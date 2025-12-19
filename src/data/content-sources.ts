// 콘텐츠 소스 정의 - NEW SEXY for 40~50대 중장년
// "나이 들어도 충분히 섹시할 수 있다" - 건강, 미용, 패션, 활동성, 관계

export interface ContentSourceConfig {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'web';
  category: string;
  description: string;
  fetchFrequency: 'daily' | 'hourly';
  isActive: boolean;
}

export const contentSources: ContentSourceConfig[] = [
  // ============================================
  // 패션 - 40~50대를 위한 우아하고 섹시한 스타일
  // ============================================
  {
    id: 'fashion-porter',
    name: 'Porter Magazine',
    url: 'https://www.net-a-porter.com/porter/rss',
    type: 'rss',
    category: '패션',
    description: '성숙한 여성을 위한 하이패션',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'fashion-vogue',
    name: 'Vogue Fashion',
    url: 'https://www.vogue.com/fashion/rss',
    type: 'rss',
    category: '패션',
    description: '에이지리스 패션 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'fashion-wsj',
    name: 'WSJ Fashion',
    url: 'https://www.wsj.com/news/types/fashion',
    type: 'web',
    category: '패션',
    description: '프로페셔널 여성 스타일',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 뷰티 - 40~50대 피부와 안티에이징
  // ============================================
  {
    id: 'beauty-allure-mature',
    name: 'Allure Anti-Aging',
    url: 'https://www.allure.com/anti-aging/rss',
    type: 'rss',
    category: '뷰티',
    description: '안티에이징 뷰티 솔루션',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-dermstore',
    name: 'Dermstore Skincare',
    url: 'https://www.dermstore.com/blog/skincare-over-40/',
    type: 'web',
    category: '뷰티',
    description: '40+ 피부관리 전문',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-prevention',
    name: 'Prevention Beauty',
    url: 'https://www.prevention.com/beauty/rss',
    type: 'rss',
    category: '뷰티',
    description: '건강한 아름다움',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 여행 - 40~50대를 위한 프리미엄 여행
  // ============================================
  {
    id: 'travel-conde-nast',
    name: 'Condé Nast Traveler',
    url: 'https://www.cntraveler.com/rss',
    type: 'rss',
    category: '여행',
    description: '럭셔리 여행 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'travel-aarp',
    name: 'AARP Travel',
    url: 'https://www.aarp.org/travel/rss',
    type: 'rss',
    category: '여행',
    description: '50+ 여행 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 라이프스타일 - 40~50대의 성숙한 삶
  // ============================================
  {
    id: 'lifestyle-aarp-magazine',
    name: 'AARP The Magazine',
    url: 'https://www.aarp.org/magazine/rss',
    type: 'rss',
    category: '라이프스타일',
    description: '50+ 라이프스타일 전문지',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'lifestyle-next-avenue',
    name: 'Next Avenue',
    url: 'https://www.nextavenue.org/feed/',
    type: 'rss',
    category: '라이프스타일',
    description: '40~60대 라이프 & 커리어',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'lifestyle-oprah',
    name: 'Oprah Daily',
    url: 'https://www.oprahdaily.com/rss/',
    type: 'rss',
    category: '라이프스타일',
    description: '여성의 성장과 웰빙',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 글로벌푸드 - 세계 음식 문화와 트렌드
  // ============================================
  {
    id: 'global-food-saveur',
    name: 'Saveur',
    url: 'https://www.saveur.com/rss',
    type: 'rss',
    category: '글로벌푸드',
    description: '세계 음식 문화 탐험',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'global-food-eater',
    name: 'Eater',
    url: 'https://www.eater.com/rss/index.xml',
    type: 'rss',
    category: '글로벌푸드',
    description: '레스토랑 & 푸드 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 건강푸드 - 영양과 건강을 위한 식단
  // ============================================
  {
    id: 'health-food-harvard-nutrition',
    name: 'Harvard Nutrition Source',
    url: 'https://www.hsph.harvard.edu/nutritionsource/feed/',
    type: 'rss',
    category: '건강푸드',
    description: '하버드 영양학 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'health-food-eating-well',
    name: 'EatingWell',
    url: 'https://www.eatingwell.com/rss',
    type: 'rss',
    category: '건강푸드',
    description: '건강한 식단 레시피',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'health-food-cleveland-clinic',
    name: 'Cleveland Clinic Nutrition',
    url: 'https://health.clevelandclinic.org/category/nutrition/feed/',
    type: 'rss',
    category: '건강푸드',
    description: '의학 기반 영양 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 하우징 - 중장년을 위한 주거 공간
  // ============================================
  {
    id: 'housing-dezeen',
    name: 'Dezeen',
    url: 'https://www.dezeen.com/feed/',
    type: 'rss',
    category: '하우징',
    description: '인테리어 & 디자인',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'housing-architectural-digest',
    name: 'Architectural Digest',
    url: 'https://www.architecturaldigest.com/rss',
    type: 'rss',
    category: '하우징',
    description: '럭셔리 주거 디자인',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 글로벌트렌드 - 세계 비즈니스 & 사회 트렌드
  // ============================================
  {
    id: 'global-wef',
    name: 'World Economic Forum',
    url: 'https://www.weforum.org/rss/',
    type: 'rss',
    category: '글로벌트렌드',
    description: '세계경제포럼 인사이트',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'global-mit',
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    type: 'rss',
    category: '글로벌트렌드',
    description: '기술 혁신 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 시니어시장 - 40~50대 소비 & 비즈니스 트렌드
  // ============================================
  {
    id: 'senior-aarp-money',
    name: 'AARP Money',
    url: 'https://www.aarp.org/money/rss',
    type: 'rss',
    category: '시니어시장',
    description: '50+ 경제 & 소비 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'senior-forbes-aging',
    name: 'Forbes Aging',
    url: 'https://www.forbes.com/aging/rss',
    type: 'rss',
    category: '시니어시장',
    description: '시니어 시장 비즈니스',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 심리 - 중년의 정신 건강과 성장
  // ============================================
  {
    id: 'psychology-greater-good',
    name: 'Greater Good Magazine',
    url: 'https://greatergood.berkeley.edu/feed',
    type: 'rss',
    category: '심리',
    description: 'UC 버클리 웰빙 심리학',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'psychology-today-aging',
    name: 'Psychology Today - Aging',
    url: 'https://www.psychologytoday.com/us/basics/aging/feed',
    type: 'rss',
    category: '심리',
    description: '중년 심리와 성장',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'psychology-mindful',
    name: 'Mindful Magazine',
    url: 'https://www.mindful.org/feed/',
    type: 'rss',
    category: '심리',
    description: '마음챙김과 명상',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 섹슈얼리티 - 중장년의 친밀함과 관계
  // NEW SEXY의 핵심 카테고리
  // ============================================
  {
    id: 'sexuality-psychology-today-sex',
    name: 'Psychology Today - Sex',
    url: 'https://www.psychologytoday.com/us/basics/sex/feed',
    type: 'rss',
    category: '섹슈얼리티',
    description: '심리학 기반 친밀감 & 관계',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-healthline',
    name: 'Healthline Sexual Health',
    url: 'https://www.healthline.com/health/healthy-sex/feed',
    type: 'rss',
    category: '섹슈얼리티',
    description: '의학 기반 성 건강',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-womens-health',
    name: "Women's Health Sex & Love",
    url: 'https://www.womenshealthmag.com/sex-and-love/rss',
    type: 'rss',
    category: '섹슈얼리티',
    description: '여성의 성과 관계',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-aarp-relationships',
    name: 'AARP Relationships',
    url: 'https://www.aarp.org/home-family/sex-intimacy/rss',
    type: 'rss',
    category: '섹슈얼리티',
    description: '50+ 친밀함과 섹슈얼리티',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 운동 - 섹시한 몸매와 건강을 위한 피트니스
  // NEW SEXY를 위한 핵심 건강관리
  // ============================================
  {
    id: 'exercise-prevention',
    name: 'Prevention Fitness',
    url: 'https://www.prevention.com/fitness/rss',
    type: 'rss',
    category: '운동',
    description: '40+ 피트니스 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-aarp-health',
    name: 'AARP Health & Fitness',
    url: 'https://www.aarp.org/health/healthy-living/rss',
    type: 'rss',
    category: '운동',
    description: '50+ 건강과 운동',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-ace-fitness',
    name: 'ACE Fitness',
    url: 'https://www.acefitness.org/rss',
    type: 'rss',
    category: '운동',
    description: '전문 피트니스 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-womens-health',
    name: "Women's Health Fitness",
    url: 'https://www.womenshealthmag.com/fitness/rss',
    type: 'rss',
    category: '운동',
    description: '여성 피트니스 & 웰니스',
    fetchFrequency: 'daily',
    isActive: true,
  },
];

// 카테고리별 소스 가져오기
export function getSourcesByCategory(category: string): ContentSourceConfig[] {
  return contentSources.filter((source) => source.category === category && source.isActive);
}

// 모든 활성 소스
export function getActiveSources(): ContentSourceConfig[] {
  return contentSources.filter((source) => source.isActive);
}
