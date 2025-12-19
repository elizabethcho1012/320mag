// 콘텐츠 소스 정의
// 10개 카테고리별로 신뢰할 수 있는 정보 소스를 정의합니다.

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
  // 패션 (Sophia)
  {
    id: 'fashion-vogue',
    name: 'Vogue Business',
    url: 'https://www.voguebusiness.com/rss',
    type: 'rss',
    category: '패션',
    description: '글로벌 패션 비즈니스 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'fashion-wwd',
    name: "Women's Wear Daily",
    url: 'https://wwd.com/feed/',
    type: 'rss',
    category: '패션',
    description: '패션 산업 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'fashion-bof',
    name: 'Business of Fashion',
    url: 'https://www.businessoffashion.com',
    type: 'web',
    category: '패션',
    description: '패션 비즈니스 인사이트',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 뷰티 (Jane)
  {
    id: 'beauty-allure',
    name: 'Allure',
    url: 'https://www.allure.com/feed/rss',
    type: 'rss',
    category: '뷰티',
    description: '뷰티 & 웰니스 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'beauty-dermstore',
    name: 'Dermstore Blog',
    url: 'https://www.dermstore.com/blog.list',
    type: 'web',
    category: '뷰티',
    description: '피부과학 기반 뷰티 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 컬처 (Martin)
  {
    id: 'culture-guardian',
    name: 'The Guardian Culture',
    url: 'https://www.theguardian.com/culture/rss',
    type: 'rss',
    category: '컬처',
    description: '문화 예술 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'culture-nyt',
    name: 'New York Times Arts',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
    type: 'rss',
    category: '컬처',
    description: '예술 & 문화 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 라이프스타일 (Clara)
  {
    id: 'lifestyle-monocle',
    name: 'Monocle',
    url: 'https://monocle.com',
    type: 'web',
    category: '라이프스타일',
    description: '글로벌 라이프스타일 매거진',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'lifestyle-kinfolk',
    name: 'Kinfolk',
    url: 'https://kinfolk.com',
    type: 'web',
    category: '라이프스타일',
    description: '슬로우 라이프 & 디자인',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 시니어시장 (Henry)
  {
    id: 'senior-aarp',
    name: 'AARP',
    url: 'https://www.aarp.org/rss/',
    type: 'rss',
    category: '시니어시장',
    description: '미국 시니어 시장 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'senior-silvereco',
    name: 'SilverEco',
    url: 'https://www.silvereco.fr',
    type: 'web',
    category: '시니어시장',
    description: '프랑스 실버산업 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'senior-korea',
    name: '보건복지부',
    url: 'https://www.mohw.go.kr',
    type: 'web',
    category: '시니어시장',
    description: '한국 노인복지 정책',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 금융 (David)
  {
    id: 'finance-ft',
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    type: 'rss',
    category: '금융',
    description: '글로벌 금융 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'finance-bloomberg-retirement',
    name: 'Bloomberg Retirement',
    url: 'https://www.bloomberg.com',
    type: 'web',
    category: '금융',
    description: '은퇴 & 자산관리',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'finance-forbes',
    name: 'Forbes Retirement',
    url: 'https://www.forbes.com/retirement',
    type: 'web',
    category: '금융',
    description: '은퇴 설계 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 글로벌트렌드 (Naomi)
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
    id: 'global-mckinsey',
    name: 'McKinsey Insights',
    url: 'https://www.mckinsey.com',
    type: 'web',
    category: '글로벌트렌드',
    description: '글로벌 비즈니스 트렌드',
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

  // 푸드 (Antoine)
  {
    id: 'food-michelin',
    name: 'Michelin Guide',
    url: 'https://guide.michelin.com',
    type: 'web',
    category: '푸드',
    description: '미슐랭 가이드 뉴스',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'food-eater',
    name: 'Eater',
    url: 'https://www.eater.com/rss/index.xml',
    type: 'rss',
    category: '푸드',
    description: '레스토랑 & 푸드 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'food-saveur',
    name: 'Saveur',
    url: 'https://www.saveur.com',
    type: 'web',
    category: '푸드',
    description: '세계 음식 문화',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 하우징 (Emily)
  {
    id: 'housing-archdaily',
    name: 'ArchDaily',
    url: 'https://www.archdaily.com/feed/',
    type: 'rss',
    category: '하우징',
    description: '건축 & 디자인',
    fetchFrequency: 'daily',
    isActive: true,
  },
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
    id: 'housing-senior-housing',
    name: 'Senior Housing News',
    url: 'https://seniorhousingnews.com',
    type: 'web',
    category: '하우징',
    description: '시니어 주거 트렌드',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 의료 (Dr. Lee)
  {
    id: 'medical-harvard',
    name: 'Harvard Health',
    url: 'https://www.health.harvard.edu/blog/feed',
    type: 'rss',
    category: '의료',
    description: '하버드 의대 건강 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'medical-mayo',
    name: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org',
    type: 'web',
    category: '의료',
    description: '메이요 클리닉 건강 가이드',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'medical-nia',
    name: 'National Institute on Aging',
    url: 'https://www.nia.nih.gov',
    type: 'web',
    category: '의료',
    description: '노화 관련 의학 연구',
    fetchFrequency: 'daily',
    isActive: true,
  },

  // 섹슈얼리티 (Dr. Sarah) - 프리미엄
  {
    id: 'sexuality-psychology-today',
    name: 'Psychology Today - Sex',
    url: 'https://www.psychologytoday.com/us/blog/feed',
    type: 'rss',
    category: '섹슈얼리티',
    description: '심리학 기반 친밀감 & 관계',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-healthline',
    name: 'Healthline Sexual Health',
    url: 'https://www.healthline.com',
    type: 'web',
    category: '섹슈얼리티',
    description: '성 건강 의학 정보',
    fetchFrequency: 'daily',
    isActive: true,
  },
  {
    id: 'sexuality-aasect',
    name: 'AASECT',
    url: 'https://www.aasect.org',
    type: 'web',
    category: '섹슈얼리티',
    description: '미국 성교육·상담·치료 협회',
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
