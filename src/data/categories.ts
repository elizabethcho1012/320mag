/**
 * 🎯 카테고리 정의 - 절대 변경 금지!
 *
 * ⚠️  경고: 이 파일은 프로젝트의 단일 진실 공급원(Single Source of Truth)입니다.
 * 카테고리를 추가하거나 제거하려면 반드시 이 파일만 수정하세요.
 *
 * 사용처:
 * - src/services/categoryInference.ts (AI 카테고리 추론)
 * - src/data/content-sources.ts (RSS 소스 정의)
 * - scripts/seed-categories-creators.ts (DB 초기화)
 * - scripts/fill-missing-categories.ts (카테고리 채우기)
 * - 기타 모든 카테고리 관련 스크립트
 */

export interface CategoryDefinition {
  name: string;
  slug: string;
  description: string;
  order_index: number;
  keywords: string[];
}

/**
 * NEW SEXY 카테고리 (40-50대 AGene을 위한 8개 카테고리)
 *
 * ⚠️  2025-12-22 업데이트: 라이프스타일 제거 (기준 애매함)
 * 카테고리 개수: 8개
 */
export const CATEGORIES: CategoryDefinition[] = [
  {
    name: '패션',
    slug: 'fashion',
    description: '최신 패션 트렌드와 스타일링 팁',
    order_index: 1,
    keywords: ['fashion', 'designer', 'runway', 'collection', '패션', '디자이너', 'vogue', 'style', 'jewelry', 'watch'],
  },
  {
    name: '뷰티',
    slug: 'beauty',
    description: '뷰티 제품 리뷰와 메이크업 가이드',
    order_index: 2,
    keywords: ['beauty', 'skincare', '뷰티', '화장품', '스킨케어', 'cosmetic', 'makeup', 'anti-aging'],
  },
  {
    name: '여행',
    slug: 'travel',
    description: '여행 정보와 추천 여행지',
    order_index: 3,
    keywords: ['travel', 'hotel', 'tourism', '여행', '호텔', 'destination', 'vacation', 'island', 'monument', 'landmark', 'memorial'],
  },
  {
    name: '푸드',
    slug: 'food',
    description: '음식, 레스토랑, 영양, 건강 식품',
    order_index: 4,
    keywords: ['food', 'restaurant', 'chef', 'dining', '음식', '레스토랑', '미식', 'cuisine', 'michelin', 'wine', 'spirits', 'nutrition', 'diet', 'superfood', '영양', '식단', 'healthy eating', 'meal planning', 'vitamin', 'recipe'],
  },
  {
    name: '심리',
    slug: 'mind',
    description: '심리학, 정신 건강, 마음챙김',
    order_index: 5,
    keywords: ['psychology', 'mental health', 'mindfulness', '심리', '정신건강', 'meditation', '명상', 'therapy', 'counseling', 'well-being'],
  },
  {
    name: '운동',
    slug: 'fitness',
    description: '피트니스, 운동, 건강 관리',
    order_index: 6,
    keywords: ['fitness', 'exercise', 'workout', '운동', '피트니스', 'yoga', 'strength', 'cardio', 'training', 'gym', 'health', '건강', 'wellness'],
  },
  {
    name: '하우징',
    slug: 'housing',
    description: '인테리어와 주거 공간',
    order_index: 7,
    keywords: ['architecture', 'interior', 'house', 'home design', 'home interior', '건축', '인테리어', 'remodeling', 'renovation'],
  },
  {
    name: '섹슈얼리티',
    slug: 'sexuality',
    description: '친밀감, 관계, 성 건강',
    order_index: 8,
    keywords: ['sexuality', 'intimacy', 'relationship', '섹슈얼리티', '친밀감', '관계', 'sex', 'sexual health', 'dating', 'romance'],
  },
];

/**
 * 카테고리 이름 목록 (간단 참조용)
 */
export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

/**
 * 카테고리 키워드 매핑 (카테고리 추론용)
 *
 * ⚠️  중요: 순서가 중요! 더 구체적인 카테고리를 먼저 체크해야 함
 * 섹슈얼리티를 심리보다 먼저, 운동을 푸드보다 먼저 체크
 */
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  패션: CATEGORIES.find(c => c.name === '패션')!.keywords,
  뷰티: CATEGORIES.find(c => c.name === '뷰티')!.keywords,
  여행: CATEGORIES.find(c => c.name === '여행')!.keywords,
  하우징: CATEGORIES.find(c => c.name === '하우징')!.keywords,
  // 🔥 섹슈얼리티를 먼저 체크 (심리보다 구체적)
  섹슈얼리티: CATEGORIES.find(c => c.name === '섹슈얼리티')!.keywords,
  // 🔥 운동을 먼저 체크 (푸드보다 구체적)
  운동: CATEGORIES.find(c => c.name === '운동')!.keywords,
  // 이제 더 넓은 카테고리들
  심리: CATEGORIES.find(c => c.name === '심리')!.keywords,
  푸드: CATEGORIES.find(c => c.name === '푸드')!.keywords,
};

/**
 * 카테고리별 서브카테고리 맵
 */
export const subcategoryMap = {
  "패션": ["ALL", "TRENDS", "CELEB STYLE", "WATCH & JEWELRY", "FASHION WEEK", "DESIGNERS"],
  "뷰티": ["ALL", "MAKE-UP & NAILS", "SKINCARE", "BODY & HAIR", "WELLNESS"],
  "여행": ["ALL", "DESTINATION", "CULTURE", "FOOD TRAVEL", "SLOW TRAVEL", "TIPS"],
  "푸드": ["ALL", "WORLD CUISINE", "RESTAURANT", "FOOD CULTURE", "WINE & SPIRITS", "NUTRITION", "RECIPES"],
  "심리": ["ALL", "WELLNESS", "MINDFULNESS", "RELATIONSHIPS", "SELF-DEVELOPMENT"],
  "운동": ["ALL", "STRENGTH", "CARDIO", "FLEXIBILITY", "INJURY PREVENTION", "EXERCISE SCIENCE"],
  "하우징": ["ALL", "INTERIOR", "REMODELING", "SMART HOME", "UNIVERSAL DESIGN", "SENIOR LIVING"],
  "섹슈얼리티": ["ALL", "INTIMACY", "RELATIONSHIPS", "HEALTH", "COUNSELING"]
};

/**
 * 카테고리 slug로 이름 찾기
 */
export function getCategoryNameBySlug(slug: string): string | null {
  const category = CATEGORIES.find(c => c.slug === slug);
  return category ? category.name : null;
}

/**
 * 카테고리 이름으로 slug 찾기
 */
export function getCategorySlugByName(name: string): string | null {
  const category = CATEGORIES.find(c => c.name === name);
  return category ? category.slug : null;
}