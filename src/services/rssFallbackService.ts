// RSS 실패 시 자동 Fallback 시스템
import Parser from 'rss-parser';
import { ContentSourceConfig } from '../data/content-sources';

const parser = new Parser();

export interface FallbackSource {
  id: string;
  name: string;
  url: string;
  category: string;
  priority: number; // 낮을수록 우선순위 높음
  tested: boolean;
  lastTested?: string;
}

// 카테고리별 대체 RSS 소스 풀
// 우선순위: 1 = 주요 소스, 2 = 1차 백업, 3 = 2차 백업, 4 = 긴급 백업
const FALLBACK_SOURCES: FallbackSource[] = [
  // ============================================
  // 패션 fallback
  // ============================================
  { id: 'fashion-fb-instyle', name: 'InStyle Fashion', url: 'https://www.instyle.com/fashion/feed', category: '패션', priority: 2, tested: false },
  { id: 'fashion-fb-elle', name: 'Elle Fashion', url: 'https://www.elle.com/fashion/feed/', category: '패션', priority: 3, tested: false },

  // ============================================
  // 뷰티 fallback
  // ============================================
  { id: 'beauty-fb-glossy', name: 'Glossy', url: 'https://www.glossy.co/feed/', category: '뷰티', priority: 2, tested: false },
  { id: 'beauty-fb-wwd', name: 'WWD Beauty', url: 'https://wwd.com/beauty-industry-news/feed/', category: '뷰티', priority: 2, tested: false },
  { id: 'beauty-fb-beauty-ind', name: 'Beauty Independent', url: 'https://www.beautyindependent.com/feed/', category: '뷰티', priority: 3, tested: false },
  { id: 'beauty-fb-chalkboard', name: 'The Chalkboard Mag', url: 'https://thechalkboardmag.com/feed', category: '뷰티', priority: 3, tested: false },

  // ============================================
  // 여행 fallback
  // ============================================
  { id: 'travel-fb-forbes', name: 'Forbes Travel', url: 'https://www.forbes.com/travel/feed/', category: '여행', priority: 2, tested: false },
  { id: 'travel-fb-natgeo', name: 'National Geographic Travel', url: 'https://www.nationalgeographic.com/travel/rss/', category: '여행', priority: 3, tested: false },

  // ============================================
  // 라이프스타일 fallback
  // ============================================
  { id: 'lifestyle-fb-real-simple', name: 'Real Simple', url: 'https://www.realsimple.com/syndication/feed', category: '라이프스타일', priority: 2, tested: false },
  { id: 'lifestyle-fb-martha', name: 'Martha Stewart', url: 'https://www.marthastewart.com/rss', category: '라이프스타일', priority: 3, tested: false },
  { id: 'lifestyle-fb-goop', name: 'Goop', url: 'https://goop.com/feed/', category: '라이프스타일', priority: 3, tested: false },

  // ============================================
  // 글로벌푸드 fallback
  // ============================================
  { id: 'food-fb-serious-eats', name: 'Serious Eats', url: 'https://www.seriouseats.com/feed', category: '글로벌푸드', priority: 2, tested: false },
  { id: 'food-fb-food-wine', name: 'Food & Wine', url: 'https://www.foodandwine.com/syndication/feed', category: '글로벌푸드', priority: 3, tested: false },

  // ============================================
  // 건강푸드 fallback
  // ============================================
  { id: 'health-food-fb-nutrition-action', name: 'Nutrition Action', url: 'https://www.nutritionaction.com/feed/', category: '건강푸드', priority: 2, tested: false },
  { id: 'health-food-fb-healthline', name: 'Healthline Nutrition', url: 'https://www.healthline.com/nutrition/rss', category: '건강푸드', priority: 3, tested: false },

  // ============================================
  // 하우징 fallback
  // ============================================
  { id: 'housing-fb-dwell', name: 'Dwell', url: 'https://www.dwell.com/rss', category: '하우징', priority: 2, tested: false },
  { id: 'housing-fb-mydomaine', name: 'MyDomaine', url: 'https://www.mydomaine.com/rss', category: '하우징', priority: 3, tested: false },

  // ============================================
  // 글로벌트렌드 fallback
  // ============================================
  { id: 'global-fb-economist', name: 'The Economist', url: 'https://www.economist.com/feeds/print-sections/latest/all.xml', category: '글로벌트렌드', priority: 2, tested: false },
  { id: 'global-fb-axios', name: 'Axios', url: 'https://www.axios.com/feeds/feed.rss', category: '글로벌트렌드', priority: 3, tested: false },

  // ============================================
  // 심리 fallback
  // ============================================
  { id: 'psychology-fb-psych-today', name: 'Psychology Today General', url: 'https://www.psychologytoday.com/us/blog/feed', category: '심리', priority: 2, tested: false },
  { id: 'psychology-fb-psych-central', name: 'Psych Central', url: 'https://psychcentral.com/feed/', category: '심리', priority: 3, tested: false },

  // ============================================
  // 섹슈얼리티 fallback
  // ============================================
  { id: 'sexuality-fb-healthline', name: 'Healthline Health', url: 'https://www.healthline.com/health/rss', category: '섹슈얼리티', priority: 2, tested: false },
  { id: 'sexuality-fb-everyday-health', name: 'Everyday Health', url: 'https://www.everydayhealth.com/rss/', category: '섹슈얼리티', priority: 3, tested: false },

  // ============================================
  // 운동 fallback
  // ============================================
  { id: 'exercise-fb-shape', name: 'Shape Magazine', url: 'https://www.shape.com/rss', category: '운동', priority: 2, tested: false },
  { id: 'exercise-fb-fitness-blender', name: 'Fitness Blender', url: 'https://www.fitnessblender.com/blog/rss', category: '운동', priority: 3, tested: false },
  { id: 'exercise-fb-breaking-muscle', name: 'Breaking Muscle', url: 'https://breakingmuscle.com/feed/', category: '운동', priority: 3, tested: false },
];

/**
 * 특정 카테고리의 대체 소스 찾기
 */
export function getFallbackSources(category: string): FallbackSource[] {
  return FALLBACK_SOURCES
    .filter(s => s.category === category)
    .sort((a, b) => a.priority - b.priority); // 우선순위 순으로 정렬
}

/**
 * 대체 소스가 작동하는지 테스트
 */
export async function testFallbackSource(source: FallbackSource): Promise<{
  success: boolean;
  articleCount: number;
  error?: string;
}> {
  try {
    const feed = await parser.parseURL(source.url);
    const articleCount = feed.items?.length || 0;

    return {
      success: articleCount > 0,
      articleCount,
    };
  } catch (error: any) {
    return {
      success: false,
      articleCount: 0,
      error: error.message,
    };
  }
}

/**
 * 카테고리의 첫 번째 작동하는 대체 소스 찾기
 */
export async function findWorkingFallback(category: string): Promise<FallbackSource | null> {
  const fallbacks = getFallbackSources(category);

  console.log(`\n🔄 [${category}] 대체 소스 검색 중... (${fallbacks.length}개 후보)`);

  for (const fallback of fallbacks) {
    console.log(`   시도 중: ${fallback.name} (우선순위 ${fallback.priority})`);

    const test = await testFallbackSource(fallback);

    if (test.success) {
      console.log(`   ✅ 작동하는 대체 소스 발견! (${test.articleCount}개 기사)`);
      fallback.tested = true;
      fallback.lastTested = new Date().toISOString();
      return fallback;
    } else {
      console.log(`   ❌ 실패: ${test.error || '기사 없음'}`);
    }

    // API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`   ⚠️  작동하는 대체 소스를 찾지 못했습니다.`);
  return null;
}

/**
 * 대체 소스를 ContentSourceConfig 형식으로 변환
 */
export function convertToSourceConfig(fallback: FallbackSource): ContentSourceConfig {
  return {
    id: fallback.id,
    name: `${fallback.name} (Fallback)`,
    url: fallback.url,
    type: 'rss',
    category: fallback.category,
    description: `자동 대체 소스 - ${fallback.name}`,
    fetchFrequency: 'daily',
    isActive: true,
  };
}

/**
 * 카테고리별 모든 대체 소스 테스트 (배치 작업용)
 */
export async function testAllFallbackSources(): Promise<Record<string, FallbackSource[]>> {
  console.log('\n🧪 모든 대체 소스 테스트 시작\n');

  const results: Record<string, FallbackSource[]> = {};
  const categories = [...new Set(FALLBACK_SOURCES.map(s => s.category))];

  for (const category of categories) {
    const fallbacks = getFallbackSources(category);
    const working: FallbackSource[] = [];

    console.log(`\n[${category}] ${fallbacks.length}개 대체 소스 테스트 중...`);

    for (const fallback of fallbacks) {
      const test = await testFallbackSource(fallback);

      if (test.success) {
        console.log(`   ✅ ${fallback.name}: ${test.articleCount}개 기사`);
        fallback.tested = true;
        fallback.lastTested = new Date().toISOString();
        working.push(fallback);
      } else {
        console.log(`   ❌ ${fallback.name}: ${test.error || '실패'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    results[category] = working;
  }

  console.log('\n📊 대체 소스 테스트 완료');
  for (const [category, sources] of Object.entries(results)) {
    console.log(`   [${category}]: ${sources.length}개 작동`);
  }

  return results;
}
