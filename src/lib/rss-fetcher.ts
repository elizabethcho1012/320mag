// RSS 피드 수집 및 콘텐츠 자동화
import Parser from 'rss-parser';
import { supabase } from './supabase';
import { rewriteContent } from './openai';
import { getEditorByCategory } from '../data/editors';
import { getSourcesByCategory, type ContentSourceConfig } from '../data/content-sources';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

export interface FetchedArticle {
  title: string;
  content: string;
  link: string;
  pubDate?: string;
  imageUrl?: string;
  category: string;
  sourceId: string;
  sourceName: string;
}

/**
 * RSS 피드에서 아티클 수집
 */
export async function fetchRSSFeed(source: ContentSourceConfig): Promise<FetchedArticle[]> {
  try {
    if (source.type !== 'rss') {
      console.log(`[RSS] ${source.name}은 RSS가 아닙니다. type=${source.type}`);
      return [];
    }

    console.log(`[RSS] ${source.name} 피드 수집 시작: ${source.url}`);
    const feed = await parser.parseURL(source.url);

    const articles: FetchedArticle[] = feed.items.slice(0, 5).map((item) => {
      // 이미지 추출
      let imageUrl = '';
      if (item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      } else if ((item as any).mediaContent?.$ ?.url) {
        imageUrl = (item as any).mediaContent.$.url;
      }

      return {
        title: item.title || '제목 없음',
        content: item.contentSnippet || item.content || item.summary || '',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate,
        imageUrl,
        category: source.category,
        sourceId: source.id,
        sourceName: source.name,
      };
    });

    console.log(`[RSS] ${source.name}에서 ${articles.length}개 아티클 수집 완료`);
    return articles;
  } catch (error) {
    console.error(`[RSS] ${source.name} 수집 실패:`, error);
    return [];
  }
}

/**
 * 카테고리별 모든 RSS 소스에서 수집
 */
export async function fetchAllRSSByCategory(category: string): Promise<FetchedArticle[]> {
  const sources = getSourcesByCategory(category).filter((s) => s.type === 'rss');

  console.log(`[RSS] ${category} 카테고리: ${sources.length}개 RSS 소스 수집 시작`);

  const results = await Promise.allSettled(sources.map((source) => fetchRSSFeed(source)));

  const allArticles = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => (r as PromiseFulfilledResult<FetchedArticle[]>).value);

  console.log(`[RSS] ${category} 카테고리 총 ${allArticles.length}개 아티클 수집`);
  return allArticles;
}

/**
 * AI 에디터로 콘텐츠 리라이팅 후 Supabase에 저장
 */
export async function processAndSaveArticle(article: FetchedArticle): Promise<boolean> {
  try {
    console.log(`[처리] "${article.title}" 리라이팅 시작...`);

    // 1. 해당 카테고리의 AI 에디터 가져오기
    const editor = getEditorByCategory(article.category);
    if (!editor) {
      console.error(`[처리] ${article.category} 카테고리의 에디터를 찾을 수 없음`);
      return false;
    }

    // 2. OpenAI로 리라이팅
    const rewrittenData = await rewriteContent({
      originalContent: article.content,
      editorPromptTemplate: editor.promptTemplate,
      title: article.title,
    });

    if (!rewrittenData.content) {
      console.error('[처리] 리라이팅 실패 - 빈 콘텐츠');
      return false;
    }

    // 3. Supabase에 저장
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: rewrittenData.title || article.title,
        content: rewrittenData.content,
        summary: rewrittenData.content.substring(0, 200) + '...',
        category: article.category,
        subcategory: 'ALL',
        editor_id: editor.id,
        editor_name: editor.name,
        source_url: article.link,
        source_name: article.sourceName,
        featured_image: article.imageUrl || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=600&fit=crop',
        is_premium: editor.isPremium || false,
        status: 'published',
        published_at: article.pubDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[처리] Supabase 저장 실패:', error);
      return false;
    }

    console.log(`[처리] ✅ 저장 완료: ${data.id} - ${rewrittenData.title}`);
    return true;
  } catch (error) {
    console.error(`[처리] 에러:`, error);
    return false;
  }
}

/**
 * 카테고리별 자동 수집 & AI 처리 & 저장 (전체 파이프라인)
 */
export async function autoCollectAndProcess(category: string, maxArticles: number = 3) {
  console.log(`\n========================================`);
  console.log(`[자동수집] ${category} 카테고리 시작`);
  console.log(`========================================\n`);

  // 1. RSS 피드 수집
  const articles = await fetchAllRSSByCategory(category);

  if (articles.length === 0) {
    console.log(`[자동수집] ${category}: 수집된 아티클 없음`);
    return { success: 0, failed: 0 };
  }

  // 2. 상위 N개만 처리
  const toProcess = articles.slice(0, maxArticles);
  console.log(`[자동수집] ${toProcess.length}개 아티클 처리 시작\n`);

  let successCount = 0;
  let failedCount = 0;

  // 3. 순차 처리 (OpenAI Rate Limit 고려)
  for (const article of toProcess) {
    const success = await processAndSaveArticle(article);
    if (success) {
      successCount++;
    } else {
      failedCount++;
    }

    // Rate limit 방지: 각 요청 사이 2초 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(`\n========================================`);
  console.log(`[자동수집] ${category} 완료`);
  console.log(`성공: ${successCount}, 실패: ${failedCount}`);
  console.log(`========================================\n`);

  return { success: successCount, failed: failedCount };
}

/**
 * 모든 카테고리 자동 수집 (한번에 모두)
 */
export async function autoCollectAll(articlesPerCategory: number = 2) {
  const categories = [
    '패션',
    '뷰티',
    '컬처',
    '라이프스타일',
    '시니어시장',
    '금융',
    '글로벌트렌드',
    '푸드',
    '하우징',
    '의료',
    '섹슈얼리티',
  ];

  const results: Record<string, { success: number; failed: number }> = {};

  for (const category of categories) {
    results[category] = await autoCollectAndProcess(category, articlesPerCategory);
  }

  console.log('\n\n========================================');
  console.log('전체 자동수집 결과');
  console.log('========================================');
  Object.entries(results).forEach(([category, result]) => {
    console.log(`${category}: 성공 ${result.success}, 실패 ${result.failed}`);
  });
  console.log('========================================\n');

  return results;
}
