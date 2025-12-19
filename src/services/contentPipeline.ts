// RSS → AI 리라이팅 → Supabase 저장 통합 파이프라인
import Parser from 'rss-parser';
import { supabase } from '../integrations/supabase/client';
import { rewriteContent } from './aiRewriteService';
import { contentSources } from '../data/content-sources';
import { getCreatorUUID } from './editorMapping';
import { extractImageFromRSS, extractAllImagesFromRSS, getSmartUnsplashUrl, isValidImageUrl, fetchOgImage } from './imageService';
import { inferCategory } from './categoryInference';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['enclosure', 'enclosure'],
    ],
  },
});

interface CollectionResult {
  success: number;
  failed: number;
  articles: any[];
  errors: string[];
}

/**
 * 원본 제목에서 핵심 인물/브랜드/이벤트 추출
 * 이미지 매칭을 위한 주제 키워드 추출
 */
function extractKeySubject(title: string): string | null {
  // 제외할 일반 단어 목록
  const excludeWords = new Set([
    'The', 'What', 'Does', 'It', 'Really', 'Take', 'Get', 'Ask',
    'Red', 'Carpet', 'Festival', 'Awards', 'Show', 'Event',
    'Magazine', 'Collection', 'Biggest', 'Trends', 'Signal',
    'Vibe', 'Shift', 'Makeup', 'Best', 'Top', 'New', 'Latest',
    'Behind', 'Scenes', 'Inside', 'How', 'Why', 'When', 'Where',
    'Beauty', 'Fashion', 'Style', 'Dress', 'Look'
  ]);

  // 1순위: 인명 패턴 (2-3 단어, 대문자로 시작)
  // 예: "Jenny Packham", "Anya Taylor-Joy", "Tom Ford"
  const namePattern = /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+(?:-[A-Z][a-z]+)?){1,2})\b/g;
  const matches = title.match(namePattern);

  if (matches) {
    for (const name of matches) {
      const words = name.split(/[\s-]+/);

      // 모든 단어가 제외 목록에 없어야 함
      const isValidName = words.every(word => !excludeWords.has(word));

      if (isValidName && words.length >= 2) {
        return name;
      }
    }
  }

  return null;
}

// 카테고리 이름 → slug 매핑
const categorySlugMap: Record<string, string> = {
  '패션': 'fashion',
  '뷰티': 'beauty',
  '컬처': 'culture',
  '여행': 'travel',
  '시니어시장': 'senior-market',
  '글로벌트렌드': 'global-trends',
  '푸드': 'food',
  '하우징': 'housing',
};

/**
 * 카테고리 이름으로 category_id 조회
 */
async function getCategoryId(categoryName: string): Promise<string | null> {
  const slug = categorySlugMap[categoryName];
  if (!slug) {
    console.error(`카테고리 "${categoryName}"에 대한 slug를 찾을 수 없습니다.`);
    return null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`카테고리 조회 실패 (${slug}):`, error);
    return null;
  }

  return data?.id || null;
}

/**
 * 에디터 ID로 editor_id 조회 (editors 테이블에서)
 */
async function getEditorId(editorId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('editors')
    .select('id')
    .eq('id', editorId)
    .single();

  if (error) {
    console.error(`Editor 조회 실패 (${editorId}):`, error);
    return null;
  }

  return data?.id || null;
}

/**
 * RSS 피드에서 콘텐츠 수집 (이미지 포함)
 */
async function collectFromRSS(sourceUrl: string, category: string) {
  try {
    const feed = await parser.parseURL(sourceUrl);
    return feed.items.map(item => {
      // RSS에서 이미지 추출 시도
      const rssImage = extractImageFromRSS(item);

      return {
        title: item.title || '',
        content: item.contentSnippet || item.content || '',
        sourceUrl: item.link || '',
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        category,
        // 이미지: RSS에서 추출 또는 null
        imageUrl: rssImage && isValidImageUrl(rssImage) ? rssImage : null,
        // 원본 아이템 저장 (추가 이미지 추출용)
        rawItem: item,
      };
    });
  } catch (error) {
    console.error(`RSS 수집 실패 (${sourceUrl}):`, error);
    return [];
  }
}

/**
 * 카테고리별 RSS 피드 수집 및 AI 리라이팅
 */
export async function collectAndRewriteCategory(
  category: string,
  maxArticles: number = 5,
  openaiApiKey?: string,
  anthropicApiKey?: string
): Promise<CollectionResult> {
  const result: CollectionResult = {
    success: 0,
    failed: 0,
    articles: [],
    errors: [],
  };

  // 해당 카테고리의 활성화된 RSS 소스 찾기
  const sources = contentSources.filter(
    s => s.category === category && s.type === 'rss' && s.isActive
  );

  if (sources.length === 0) {
    result.errors.push(`카테고리 "${category}"에 활성화된 RSS 소스가 없습니다.`);
    return result;
  }

  console.log(`\n📡 [${category}] RSS 수집 시작 (소스 ${sources.length}개)`);

  // 모든 소스에서 아티클 수집
  const allArticles = [];
  for (const source of sources) {
    console.log(`  - ${source.name} 수집 중...`);
    const articles = await collectFromRSS(source.url, category);
    allArticles.push(...articles);
  }

  console.log(`  ✅ 총 ${allArticles.length}개 아티클 수집 완료`);

  // 최신 N개만 선택
  const selectedArticles = allArticles.slice(0, maxArticles);

  console.log(`\n🤖 AI 리라이팅 시작 (${selectedArticles.length}개)`);

  // 각 아티클 리라이팅 및 저장
  for (let i = 0; i < selectedArticles.length; i++) {
    const article = selectedArticles[i];
    try {
      console.log(`  [${i + 1}/${selectedArticles.length}] "${article.title}" 처리 중...`);

      // 1단계: AI로 실제 카테고리 추론 (RSS 소스 카테고리가 정확하지 않을 수 있음)
      const inferredCategory = await inferCategory(
        article.title,
        article.content,
        article.category,
        openaiApiKey
      );

      // 1.5단계: 이미지 먼저 추출 (리라이팅 제약용)
      let earlyImageUrl = article.imageUrl;
      if (!earlyImageUrl && article.sourceUrl) {
        const ogImage = await fetchOgImage(article.sourceUrl);
        if (ogImage && isValidImageUrl(ogImage)) {
          earlyImageUrl = ogImage;
        }
      }

      // 1.6단계: 원본 제목에서 핵심 주제 추출 (이미지 매칭용)
      const keySubject = extractKeySubject(article.title);
      if (keySubject && earlyImageUrl) {
        console.log(`    🎯 핵심 주제: "${keySubject}" (이미지 매칭 필수)`);
      }

      // 2단계: AI 리라이팅 (추론된 카테고리 사용)
      // ⚠️ 이미지가 있으면 원본 주제를 크게 벗어나지 않도록 제약
      const rewritten = await rewriteContent({
        content: article.content,
        category: inferredCategory,
        originalTitle: article.title,
        originalUrl: article.sourceUrl,
        apiKey: anthropicApiKey,
        hasImage: !!earlyImageUrl, // 이미지 존재 여부 전달
        keySubject: keySubject || undefined, // 핵심 주제 전달
      });

      // category_id 조회
      const categoryId = await getCategoryId(inferredCategory);
      if (!categoryId) {
        throw new Error(`카테고리 ID를 찾을 수 없습니다: ${inferredCategory}`);
      }

      // editor UUID 조회 (editor string ID → UUID 변환)
      const editorId = await getCreatorUUID(rewritten.editorId);
      if (!editorId) {
        throw new Error(`Editor UUID를 찾을 수 없습니다: ${rewritten.editorId}`);
      }

      // slug 생성 (제목을 기반으로)
      const slug = rewritten.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100);

      // 🆕 여러 이미지 추출 (원본 기사에서)
      const allImages = extractAllImagesFromRSS(article.rawItem);
      console.log(`    🖼️  RSS에서 추출한 이미지: ${allImages.length}개`);

      // 메인 이미지 결정: RSS 첫 번째 → OG Image → Unsplash 폴백
      let featuredImageUrl = allImages.length > 0 ? allImages[0] : null;
      if (!featuredImageUrl && article.sourceUrl) {
        // RSS에 이미지가 없으면 원본 URL에서 og:image 추출 시도
        console.log(`    🔍 OG Image 추출 시도...`);
        const ogImage = await fetchOgImage(article.sourceUrl);
        if (ogImage && isValidImageUrl(ogImage)) {
          featuredImageUrl = ogImage;
          console.log(`    📷 OG Image 사용`);
        }
      }
      if (!featuredImageUrl) {
        // 최종 폴백: Unsplash (원본 제목 사용 - 더 정확한 매칭)
        featuredImageUrl = getSmartUnsplashUrl(
          article.title,        // ⭐ 원본 제목 사용 (영문)
          article.content,      // ⭐ 원본 내용 사용
          inferredCategory,
          800,
          600
        );
        console.log(`    📷 Unsplash (원본 제목 기반: "${article.title.substring(0, 50)}...")`);
      } else if (allImages.length > 0) {
        console.log(`    📷 RSS 원본 이미지 사용 (${allImages.length}개 중 첫 번째)`);
      }

      // 추가 이미지들 (첫 번째 제외)
      const additionalImages = allImages.slice(1, 6); // 최대 5개 추가 이미지

      // Supabase에 저장
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: rewritten.title,
          content: rewritten.content,
          category_id: categoryId,
          editor_id: editorId, // 🆕 editor_id 사용 (creators → editors 테이블)
          slug: slug,
          published_at: article.publishedAt,
          status: 'published', // 자동 발행
          excerpt: rewritten.excerpt, // ⭐ AI 생성 요약글 사용 (본문 자르지 않음)
          featured_image_url: featuredImageUrl, // 메인 이미지
          additional_images: JSON.stringify(additionalImages), // 🆕 추가 이미지 배열 (JSONB)
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`    ✅ 저장 완료 (ID: ${data.id})`);
      console.log(`    📝 제목: ${rewritten.title}`);
      console.log(`    📄 요약: ${rewritten.excerpt.substring(0, 50)}...`);
      console.log(`    📏 본문 길이: ${rewritten.content.length}자`);
      console.log(`    🖼️  메인 이미지: ${featuredImageUrl.substring(0, 60)}...`);
      if (additionalImages.length > 0) {
        console.log(`    🖼️  추가 이미지: ${additionalImages.length}개`);
      }
      result.success++;
      result.articles.push(data);

      // API Rate Limit 방지
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`    ❌ 실패:`, error.message);
      result.failed++;
      result.errors.push(`"${article.title}": ${error.message}`);
    }
  }

  return result;
}

/**
 * 모든 카테고리에서 콘텐츠 수집
 */
export async function collectAllCategories(
  articlesPerCategory: number = 3,
  openaiApiKey?: string,
  anthropicApiKey?: string
): Promise<Record<string, CollectionResult>> {
  const categories = [
    '패션',
    '뷰티',
    '컬처',
    '여행',
    '시니어시장',
    '글로벌트렌드',
    '푸드',
    '하우징',
  ];

  const results: Record<string, CollectionResult> = {};

  console.log('\n🚀 전체 카테고리 콘텐츠 수집 시작\n');
  console.log('='.repeat(60));

  for (const category of categories) {
    console.log(`\n📂 카테고리: ${category}`);
    console.log('-'.repeat(60));

    results[category] = await collectAndRewriteCategory(
      category,
      articlesPerCategory,
      openaiApiKey,
      anthropicApiKey
    );

    console.log(`\n✅ [${category}] 완료 - 성공: ${results[category].success}, 실패: ${results[category].failed}`);

    // 카테고리 간 간격
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 전체 수집 완료!\n');

  // 전체 통계
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);

  console.log(`📊 전체 통계:`);
  console.log(`   성공: ${totalSuccess}개`);
  console.log(`   실패: ${totalFailed}개`);
  console.log(`   총계: ${totalSuccess + totalFailed}개\n`);

  return results;
}

/**
 * 특정 시간에 자동 실행되는 스케줄러 (cron job용)
 */
export async function scheduledCollection(openaiApiKey?: string, anthropicApiKey?: string) {
  console.log(`\n⏰ 자동 수집 시작 - ${new Date().toLocaleString('ko-KR')}`);

  const results = await collectAllCategories(5, openaiApiKey, anthropicApiKey);

  // 결과 로깅
  const totalArticles = Object.values(results).reduce((sum, r) => sum + r.success, 0);
  console.log(`\n✅ 자동 수집 완료 - 총 ${totalArticles}개 아티클 추가됨`);

  return results;
}

/**
 * 요일별 카테고리 순환 스케줄
 */
const WEEKLY_SCHEDULE: Record<number, { categories: string[]; counts: number[] }> = {
  0: { // 일요일 - 라이프스타일
    categories: ['라이프스타일'],
    counts: [3]
  },
  1: { // 월요일 - 패션 & 뷰티
    categories: ['패션', '뷰티'],
    counts: [2, 1]
  },
  2: { // 화요일 - 컬처 & 여행
    categories: ['컬처', '여행'],
    counts: [2, 1]
  },
  3: { // 수요일 - 푸드 & 하우징
    categories: ['푸드', '하우징'],
    counts: [2, 1]
  },
  4: { // 목요일 - 글로벌트렌드 & 시니어시장
    categories: ['글로벌트렌드', '시니어시장'],
    counts: [2, 1]
  },
  5: { // 금요일 - 심리 & 섹슈얼리티
    categories: ['심리', '섹슈얼리티'],
    counts: [2, 1]
  },
  6: { // 토요일 - 운동 & 의료
    categories: ['운동', '의료'],
    counts: [2, 1]
  }
};

function getDayName(day: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[day];
}

/**
 * 매일 3개씩 요일별 카테고리 순환 수집
 * 가장 경제적이고 효율적인 방식
 */
export async function dailyRotationCollection(
  openaiApiKey?: string,
  anthropicApiKey?: string
): Promise<CollectionResult> {
  const today = new Date().getDay(); // 0 = 일요일
  const schedule = WEEKLY_SCHEDULE[today];
  const dayName = getDayName(today);

  console.log(`\n📅 ${dayName} 콘텐츠 수집`);
  console.log(`📂 카테고리: ${schedule.categories.join(', ')}`);
  console.log('='.repeat(60));

  const result: CollectionResult = {
    success: 0,
    failed: 0,
    articles: [],
    errors: [],
  };

  for (let i = 0; i < schedule.categories.length; i++) {
    const category = schedule.categories[i];
    const count = schedule.counts[i];

    console.log(`\n🔄 [${category}] ${count}개 수집 중...`);

    const categoryResult = await collectAndRewriteCategory(
      category,
      count,
      openaiApiKey,
      anthropicApiKey
    );

    result.success += categoryResult.success;
    result.failed += categoryResult.failed;
    result.articles.push(...categoryResult.articles);
    result.errors.push(...categoryResult.errors);

    // 카테고리 간 간격
    if (i < schedule.categories.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ ${dayName} 수집 완료`);
  console.log(`   성공: ${result.success}개`);
  console.log(`   실패: ${result.failed}개`);
  console.log(`   예상 비용: 약 ₩${result.success * 154}`);
  console.log('='.repeat(60));

  return result;
}
