/**
 * Alternative Content Sources System
 *
 * RSS 소스 실패 시 사용할 수 있는 대체 소스 풀
 * - API 기반 뉴스 서비스 (NewsAPI, Currents API 등)
 * - 추가 RSS 소스 풀
 * - 우선순위 기반 fallback 시스템
 */

export interface AlternativeSource {
  id: string;
  name: string;
  type: 'rss' | 'newsapi' | 'currents' | 'guardian' | 'nyt';
  url?: string; // RSS용
  apiEndpoint?: string; // API용
  category: string;
  priority: number; // 낮을수록 우선순위 높음 (1 = 최우선)
  requiresAuth: boolean;
  description: string;
}

/**
 * 대체 소스 풀 - 카테고리별로 정리
 */
export const alternativeSources: AlternativeSource[] = [
  // 패션 대체 소스
  {
    id: 'fashion-wwd-alt',
    name: 'WWD (Women\'s Wear Daily)',
    type: 'rss',
    url: 'https://wwd.com/feed/',
    category: '패션',
    priority: 1,
    requiresAuth: false,
    description: '패션 업계 전문 뉴스',
  },
  {
    id: 'fashion-fashionista',
    name: 'Fashionista',
    type: 'rss',
    url: 'https://fashionista.com/feed',
    category: '패션',
    priority: 2,
    requiresAuth: false,
    description: '패션 트렌드와 스타일',
  },

  // 뷰티 대체 소스
  {
    id: 'beauty-byrdie',
    name: 'Byrdie',
    type: 'rss',
    url: 'https://www.byrdie.com/feeds/all',
    category: '뷰티',
    priority: 1,
    requiresAuth: false,
    description: '뷰티 트렌드와 제품 리뷰',
  },
  {
    id: 'beauty-coveteur',
    name: 'Coveteur',
    type: 'rss',
    url: 'https://coveteur.com/feed',
    category: '뷰티',
    priority: 2,
    requiresAuth: false,
    description: '럭셔리 뷰티와 라이프스타일',
  },
  {
    id: 'beauty-refinery29',
    name: 'Refinery29 Beauty',
    type: 'rss',
    url: 'https://www.refinery29.com/en-us/beauty/rss',
    category: '뷰티',
    priority: 3,
    requiresAuth: false,
    description: '뷰티 뉴스와 트렌드',
  },

  // 여행 대체 소스
  {
    id: 'travel-afar',
    name: 'Afar Magazine',
    type: 'rss',
    url: 'https://www.afar.com/magazine/rss',
    category: '여행',
    priority: 1,
    requiresAuth: false,
    description: '고급 여행 매거진',
  },
  {
    id: 'travel-natgeo',
    name: 'National Geographic Travel',
    type: 'rss',
    url: 'https://www.nationalgeographic.com/travel/rss',
    category: '여행',
    priority: 2,
    requiresAuth: false,
    description: '내셔널지오그래픽 여행',
  },
  {
    id: 'travel-conde-nast',
    name: 'Conde Nast Traveler',
    type: 'rss',
    url: 'https://www.cntraveler.com/feed/rss',
    category: '여행',
    priority: 3,
    requiresAuth: false,
    description: '럭셔리 여행 가이드',
  },

  // 푸드 대체 소스 (글로벌푸드 + 건강푸드 통합)
  {
    id: 'food-foodwine',
    name: 'Food & Wine',
    type: 'rss',
    url: 'https://www.foodandwine.com/rss',
    category: '푸드',
    priority: 1,
    requiresAuth: false,
    description: '음식과 와인',
  },
  {
    id: 'food-epicurious',
    name: 'Epicurious',
    type: 'rss',
    url: 'https://www.epicurious.com/services/rss/recipes',
    category: '푸드',
    priority: 2,
    requiresAuth: false,
    description: '레시피와 요리 기술',
  },
  {
    id: 'food-tasting-table',
    name: 'Tasting Table',
    type: 'rss',
    url: 'https://www.tastingtable.com/rss',
    category: '푸드',
    priority: 3,
    requiresAuth: false,
    description: '음식 문화와 레스토랑',
  },
  {
    id: 'health-food-eatingwell',
    name: 'EatingWell',
    type: 'rss',
    url: 'https://www.eatingwell.com/rss',
    category: '푸드',
    priority: 4,
    requiresAuth: false,
    description: '건강한 식단과 레시피',
  },
  {
    id: 'health-food-nutrition-action',
    name: 'Nutrition Action',
    type: 'rss',
    url: 'https://www.nutritionaction.com/rss',
    category: '푸드',
    priority: 5,
    requiresAuth: false,
    description: '영양학 뉴스',
  },

  // 건강 대체 소스 (운동 → 건강으로 변경)
  {
    id: 'fitness-menshealth',
    name: 'Men\'s Health Fitness',
    type: 'rss',
    url: 'https://www.menshealth.com/fitness/rss',
    category: '운동',
    priority: 1,
    requiresAuth: false,
    description: '남성 피트니스',
  },
  {
    id: 'fitness-womenshealth',
    name: 'Women\'s Health Fitness',
    type: 'rss',
    url: 'https://www.womenshealthmag.com/fitness/rss',
    category: '운동',
    priority: 2,
    requiresAuth: false,
    description: '여성 피트니스',
  },
  {
    id: 'fitness-runnersworld',
    name: 'Runner\'s World',
    type: 'rss',
    url: 'https://www.runnersworld.com/rss',
    category: '운동',
    priority: 3,
    requiresAuth: false,
    description: '러닝과 지구력 운동',
  },
  {
    id: 'fitness-bodybuilding',
    name: 'Bodybuilding.com',
    type: 'rss',
    url: 'https://www.bodybuilding.com/rss/all-articles.xml',
    category: '운동',
    priority: 4,
    requiresAuth: false,
    description: '보디빌딩과 근력 운동',
  },

  // 섹슈얼리티 대체 소스
  {
    id: 'sexuality-goodtherapy',
    name: 'Good Therapy',
    type: 'rss',
    url: 'https://www.goodtherapy.org/blog/feed/',
    category: '섹슈얼리티',
    priority: 1,
    requiresAuth: false,
    description: '관계와 심리 상담',
  },
  {
    id: 'sexuality-healthline',
    name: 'Healthline Sexual Health',
    type: 'rss',
    url: 'https://www.healthline.com/health/healthy-sex/rss',
    category: '섹슈얼리티',
    priority: 2,
    requiresAuth: false,
    description: '성 건강 정보',
  },
  {
    id: 'sexuality-webmd',
    name: 'WebMD Sexual Health',
    type: 'rss',
    url: 'https://www.webmd.com/sex-relationships/rss',
    category: '섹슈얼리티',
    priority: 3,
    requiresAuth: false,
    description: '성 건강과 관계',
  },

  // 심리 대체 소스
  {
    id: 'psychology-greater-good',
    name: 'Greater Good Magazine',
    type: 'rss',
    url: 'https://greatergood.berkeley.edu/feed',
    category: '심리',
    priority: 1,
    requiresAuth: false,
    description: 'UC 버클리 심리학 매거진',
  },
  {
    id: 'psychology-mindbodygreen',
    name: 'Mind Body Green Psychology',
    type: 'rss',
    url: 'https://www.mindbodygreen.com/articles.rss',
    category: '심리',
    priority: 2,
    requiresAuth: false,
    description: '마음과 웰빙',
  },

  // 하우징 대체 소스
  {
    id: 'housing-architizer',
    name: 'Architizer',
    type: 'rss',
    url: 'https://architizer.com/blog/feed/',
    category: '하우징',
    priority: 1,
    requiresAuth: false,
    description: '건축과 디자인',
  },
  {
    id: 'housing-dwell',
    name: 'Dwell',
    type: 'rss',
    url: 'https://www.dwell.com/rss',
    category: '하우징',
    priority: 2,
    requiresAuth: false,
    description: '모던 주거 디자인',
  },

  // 라이프스타일 대체 소스 (글로벌트렌드 → 라이프스타일로 변경)
  {
    id: 'lifestyle-senior-planet',
    name: 'Senior Planet',
    type: 'rss',
    url: 'https://seniorplanet.org/feed/',
    category: '라이프스타일',
    priority: 1,
    requiresAuth: false,
    description: '시니어 기술과 라이프스타일',
  },
  {
    id: 'lifestyle-aging-in-place',
    name: 'Aging in Place',
    type: 'rss',
    url: 'https://www.aginginplace.org/feed/',
    category: '라이프스타일',
    priority: 2,
    requiresAuth: false,
    description: '시니어 주거와 생활',
  },
  {
    id: 'lifestyle-oprah-daily',
    name: 'Oprah Daily',
    type: 'rss',
    url: 'https://www.oprahdaily.com/rss/',
    category: '라이프스타일',
    priority: 3,
    requiresAuth: false,
    description: '여성의 성장과 웰빙',
  },
];

/**
 * 카테고리별 대체 소스 가져오기 (우선순위 정렬)
 */
export function getAlternativesByCategory(category: string): AlternativeSource[] {
  return alternativeSources
    .filter(source => source.category === category)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * 사용 가능한 대체 소스 가져오기 (인증 불필요한 것만)
 */
export function getAvailableAlternatives(category: string): AlternativeSource[] {
  return getAlternativesByCategory(category)
    .filter(source => !source.requiresAuth);
}

/**
 * RSS 타입 대체 소스만 가져오기
 */
export function getRSSAlternatives(category: string): AlternativeSource[] {
  return getAlternativesByCategory(category)
    .filter(source => source.type === 'rss');
}
