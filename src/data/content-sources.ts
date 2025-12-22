// 콘텐츠 소스 정의 - NEW SEXY for 40~50대 중장년
// "나이 들어도 충분히 섹시할 수 있다" - 건강, 미용, 패션, 활동성, 관계
// ✅ 실제 작동하는 RSS 소스만 포함 (2025-12-20 테스트 완료)

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
    id: 'fashion-who-what-wear',
    name: 'Who What Wear',
    url: 'https://www.whowhatwear.com/rss',
    type: 'rss',
    category: '패션',
    description: '트렌디하고 실용적인 패션 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 뷰티 - 40~50대 피부와 안티에이징
  // ============================================
  {
    id: 'beauty-allure',
    name: 'Allure',
    url: 'https://www.allure.com/feed/rss',
    type: 'rss',
    category: '뷰티',
    description: '안티에이징과 뷰티 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-marie-claire',
    name: 'Marie Claire Beauty',
    url: 'https://www.marieclaire.com/beauty/feed/',
    type: 'rss',
    category: '뷰티',
    description: '성숙한 여성을 위한 뷰티',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-zoe-report',
    name: 'The Zoe Report',
    url: 'https://www.thezoereport.com/rss',
    type: 'rss',
    category: '뷰티',
    description: '트렌디한 뷰티 & 라이프스타일',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-temptalia',
    name: 'Temptalia',
    url: 'https://www.temptalia.com/feed/',
    type: 'rss',
    category: '뷰티',
    description: '뷰티 제품 리뷰 전문',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-organic-spa',
    name: 'Organic Spa',
    url: 'https://www.organicspamagazine.com/feed/',
    type: 'rss',
    category: '뷰티',
    description: '자연주의 뷰티 & 웰니스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-into-the-gloss',
    name: 'Into The Gloss',
    url: 'https://intothegloss.com/feed/',
    type: 'rss',
    category: '뷰티',
    description: '뷰티 인사이더 인터뷰',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-beautylish',
    name: 'Beautylish',
    url: 'https://www.beautylish.com/articles.rss',
    type: 'rss',
    category: '뷰티',
    description: '프로페셔널 뷰티 팁',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 여행 - 40~50대를 위한 프리미엄 여행
  // ============================================
  {
    id: 'travel-budget-travel',
    name: 'Budget Travel',
    url: 'https://www.budgettravel.com/rss',
    type: 'rss',
    category: '여행',
    description: '실속있는 여행 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'travel-atlas-obscura',
    name: 'Atlas Obscura',
    url: 'https://www.atlasobscura.com/feeds/latest',
    type: 'rss',
    category: '여행',
    description: '독특한 여행지와 문화',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'travel-nomadic-matt',
    name: 'Nomadic Matt',
    url: 'https://www.nomadicmatt.com/travel-blog/rss',
    type: 'rss',
    category: '여행',
    description: '여행 팁과 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'travel-points-guy',
    name: 'The Points Guy',
    url: 'https://thepointsguy.com/feed/',
    type: 'rss',
    category: '여행',
    description: '럭셔리 여행과 포인트 활용',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'travel-lonely-planet',
    name: 'Lonely Planet',
    url: 'https://www.lonelyplanet.com/blog/feed/',
    type: 'rss',
    category: '여행',
    description: '세계 여행 가이드 전문',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 라이프스타일 - 40~50대의 성숙한 삶
  // ============================================
  {
    id: 'lifestyle-the-kitchn',
    name: 'The Kitchn',
    url: 'https://www.thekitchn.com/main.rss',
    type: 'rss',
    category: '라이프스타일',
    description: '요리와 주방 생활',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'lifestyle-cup-of-jo',
    name: 'Cup of Jo',
    url: 'https://cupofjo.com/feed/',
    type: 'rss',
    category: '라이프스타일',
    description: '여성의 일상과 문화',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'lifestyle-a-beautiful-mess',
    name: 'A Beautiful Mess',
    url: 'https://abeautifulmess.com/feed',
    type: 'rss',
    category: '라이프스타일',
    description: 'DIY와 크리에이티브 라이프',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 글로벌푸드 - 세계 음식 문화와 트렌드
  // ============================================
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
  {
    id: 'global-food-bon-appetit',
    name: 'Bon Appétit',
    url: 'https://www.bonappetit.com/feed/rss',
    type: 'rss',
    category: '글로벌푸드',
    description: '미식과 요리 문화',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'global-food-serious-eats',
    name: 'Serious Eats',
    url: 'https://www.seriouseats.com/feed',
    type: 'rss',
    category: '글로벌푸드',
    description: '과학적 요리법과 레시피',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'global-food-saveur',
    name: 'Saveur',
    url: 'https://www.saveur.com/feeds/all/',
    type: 'rss',
    category: '글로벌푸드',
    description: '세계 음식 문화 탐험',
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
    id: 'health-food-precision-nutrition',
    name: 'Precision Nutrition',
    url: 'https://www.precisionnutrition.com/feed',
    type: 'rss',
    category: '건강푸드',
    description: '과학 기반 영양 정보',
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
    id: 'housing-apartment-therapy',
    name: 'Apartment Therapy',
    url: 'https://www.apartmenttherapy.com/main.rss',
    type: 'rss',
    category: '하우징',
    description: '실용적인 인테리어 아이디어',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'housing-design-milk',
    name: 'Design Milk',
    url: 'https://design-milk.com/feed/',
    type: 'rss',
    category: '하우징',
    description: '현대적인 디자인 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 글로벌트렌드 - 세계 비즈니스 & 사회 트렌드
  // ============================================
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
  {
    id: 'global-bbc-tech',
    name: 'BBC News - Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    type: 'rss',
    category: '글로벌트렌드',
    description: 'BBC 기술 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'global-wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    type: 'rss',
    category: '글로벌트렌드',
    description: '기술과 문화의 미래',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 시니어시장 - 40~50대 소비 & 비즈니스 트렌드
  // ⚠️ 주간 스케줄에서 제외되었으나 레거시 호환성 유지
  // ============================================

  // ============================================
  // 심리 - 중년의 정신 건강과 성장
  // ============================================
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
  {
    id: 'psychology-tiny-buddha',
    name: 'Tiny Buddha',
    url: 'https://tinybuddha.com/feed/',
    type: 'rss',
    category: '심리',
    description: '행복과 성장 이야기',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 섹슈얼리티 - 중장년의 친밀함과 관계
  // 🔥 NEW SEXY의 핵심 카테고리
  // ============================================
  {
    id: 'sexuality-sex-and-psychology',
    name: 'Sex and Psychology',
    url: 'https://www.sexandpsychology.com/feed/',
    type: 'rss',
    category: '섹슈얼리티',
    description: '성 심리학 전문 블로그',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-good-men-project',
    name: 'The Good Men Project',
    url: 'https://goodmenproject.com/feed/',
    type: 'rss',
    category: '섹슈얼리티',
    description: '관계와 친밀함에 대한 인사이트',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-scarleteen',
    name: 'Scarleteen',
    url: 'https://www.scarleteen.com/rss.xml',
    type: 'rss',
    category: '섹슈얼리티',
    description: '성 교육과 관계 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-psychology-today',
    name: 'Psychology Today - Sex',
    url: 'https://www.psychologytoday.com/us/blog/feed',
    type: 'rss',
    category: '섹슈얼리티',
    description: '심리학 기반 성과 관계',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-gottman',
    name: 'The Gottman Institute',
    url: 'https://www.gottman.com/blog/feed/',
    type: 'rss',
    category: '섹슈얼리티',
    description: '관계 연구의 권위자',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // ============================================
  // 운동 - 섹시한 몸매와 건강을 위한 피트니스
  // 🔥 NEW SEXY를 위한 핵심 건강관리
  // ============================================
  {
    id: 'exercise-self-magazine',
    name: 'Self Magazine Fitness',
    url: 'https://www.self.com/feed/rss',
    type: 'rss',
    category: '운동',
    description: '여성 피트니스 & 웰니스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-girls-gone-strong',
    name: 'Girls Gone Strong',
    url: 'https://www.girlsgonestrong.com/feed/',
    type: 'rss',
    category: '운동',
    description: '여성 근력 운동 전문',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-nerd-fitness',
    name: 'Nerd Fitness',
    url: 'https://www.nerdfitness.com/feed/',
    type: 'rss',
    category: '운동',
    description: '재미있고 실용적인 피트니스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-yoga-journal',
    name: 'Yoga Journal',
    url: 'https://www.yogajournal.com/rss/',
    type: 'rss',
    category: '운동',
    description: '요가와 마음챙김 운동',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-breaking-muscle',
    name: 'Breaking Muscle',
    url: 'https://breakingmuscle.com/feed/',
    type: 'rss',
    category: '운동',
    description: '근력 및 기능성 운동',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'exercise-ace-fitness',
    name: 'ACE Fitness Blog',
    url: 'https://www.acefitness.org/blog/feed/',
    type: 'rss',
    category: '운동',
    description: '전문가 피트니스 조언',
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
