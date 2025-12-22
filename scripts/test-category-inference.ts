import dotenv from 'dotenv';
dotenv.config();

/**
 * 카테고리 추론 테스트
 * - 잘못 분류된 기사의 원인 찾기
 */

// 키워드 규칙 복사 (수정된 버전)
const rules: Record<string, string[]> = {
  뷰티: ['beauty', 'skincare', '뷰티', '화장품', '스킨케어', 'cosmetic', 'makeup', 'anti-aging'],
  글로벌푸드: ['restaurant', 'chef', 'dining', '레스토랑', '미식', 'cuisine', 'michelin', 'wine', 'spirits'],
  패션: ['fashion', 'designer', 'runway', 'collection', '패션', '디자이너', 'vogue', 'style', 'jewelry', 'watch'],
  하우징: ['architecture', 'interior', 'house', 'home design', 'home interior', '건축', '인테리어', 'remodeling', 'renovation'],
  여행: ['travel', 'hotel', 'tourism', '여행', '호텔', 'destination', 'vacation', 'island', 'monument', 'landmark', 'memorial'],
  글로벌트렌드: ['senior', 'aging', 'elderly', 'retirement', 'pension', '시니어', '고령', '은퇴', '노후', 'baby boomer', 'silver economy', '실버'],
  섹슈얼리티: ['sexuality', 'intimacy', 'relationship', '섹슈얼리티', '친밀감', '관계', 'sex', 'sexual health', 'dating'],
  운동: ['fitness', 'exercise', 'workout', '운동', '피트니스', 'yoga', 'strength', 'cardio', 'training', 'gym'],
  심리: ['psychology', 'mental health', 'mindfulness', '심리', '정신건강', 'meditation', '명상', 'therapy'],
  건강푸드: ['nutrition', 'diet', 'superfood', '영양', '식단', 'healthy eating', 'meal planning', 'vitamin'],
  라이프스타일: ['art', 'culture', 'exhibition', 'museum', 'theater', '예술', '문화', '전시', '공연', 'lifestyle'],
};

function testCategoryInference(title: string, content: string) {
  const text = `${title} ${content}`.toLowerCase();

  console.log(`\n🔍 테스트 제목: "${title}"`);
  console.log(`📝 테스트 내용: "${content.substring(0, 100)}..."\n`);

  // 모든 카테고리에 대해 매칭되는 키워드 찾기
  const matches: { category: string; keywords: string[] }[] = [];

  for (const [category, keywords] of Object.entries(rules)) {
    const matchedKeywords = keywords.filter(keyword => text.includes(keyword));

    if (matchedKeywords.length > 0) {
      matches.push({ category, keywords: matchedKeywords });
    }
  }

  if (matches.length === 0) {
    console.log('❌ 매칭된 키워드 없음\n');
    return null;
  }

  console.log(`📊 매칭된 카테고리 (순서대로):\n`);
  matches.forEach((match, index) => {
    const emoji = index === 0 ? '✅' : '⚠️';
    console.log(`${emoji} ${match.category}: [${match.keywords.join(', ')}]`);
  });

  console.log(`\n🎯 최종 선택: ${matches[0].category} (첫 번째 매칭)\n`);

  return matches[0].category;
}

// 테스트 케이스 1: Wesley Memorial Monument (여행 → 운동으로 잘못 분류됨)
console.log('═'.repeat(80));
console.log('테스트 1: Wesley Memorial Monument');
console.log('═'.repeat(80));
testCategoryInference(
  'Wesley Memorial Monument in St. Simons Island, Georgia',
  'A Celtic cross memorial on a Georgia coastal island honoring two 18th-century minister brothers.'
);

// 테스트 케이스 2: Erectile Dysfunction (섹슈얼리티 → 하우징으로 잘못 분류됨)
console.log('\n' + '═'.repeat(80));
console.log('테스트 2: Erectile Dysfunction Treatment');
console.log('═'.repeat(80));
testCategoryInference(
  'New Technology Helps Treat Erectile Dysfunction At Home',
  'New at-home treatment options for erectile dysfunction using modern technology.'
);

// 테스트 케이스 3: 정상 케이스 - 뷰티
console.log('\n' + '═'.repeat(80));
console.log('테스트 3: 정상 케이스 - 뷰티');
console.log('═'.repeat(80));
testCategoryInference(
  'Best Anti-Aging Skincare Products for 2025',
  'The latest anti-aging skincare products that actually work for mature skin.'
);
