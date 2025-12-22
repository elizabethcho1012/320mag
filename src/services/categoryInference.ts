// AI를 사용한 카테고리 자동 추론 서비스

const OPENAI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_OPENAI_API_KEY
  : process.env.VITE_OPENAI_API_KEY;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 지원하는 카테고리 목록 (NEW SEXY - 9개 카테고리)
const VALID_CATEGORIES = [
  '패션',
  '뷰티',
  '여행',
  '푸드',
  '심리',
  '건강',
  '라이프스타일',
  '하우징',
  '섹슈얼리티',
];

/**
 * 기사 제목과 내용을 분석해서 가장 적합한 카테고리를 추론
 */
export async function inferCategory(
  title: string,
  content: string,
  defaultCategory: string = '라이프스타일',
  apiKey?: string
): Promise<string> {
  // 키워드 기반 빠른 추론 (AI 호출 전)
  const quickCategory = quickInferCategory(title, content);
  if (quickCategory) {
    console.log(`   📊 키워드 기반 카테고리: ${defaultCategory} → ${quickCategory}`);
    return quickCategory;
  }

  // AI 기반 정확한 추론
  try {
    const rawKey = apiKey || OPENAI_API_KEY;
    const cleanKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

    if (!cleanKey || cleanKey === 'your-openai-api-key-here') {
      console.warn('⚠️  OpenAI API 키 없음, 기본 카테고리 사용:', defaultCategory);
      return defaultCategory;
    }

    const prompt = `다음 기사의 제목과 내용을 보고, 가장 적합한 카테고리를 하나만 선택하세요.

제목: ${title}
내용: ${content.substring(0, 500)}

카테고리 옵션 (NEW SEXY - 40~50대 중장년을 위한 9개 카테고리):
- 패션: 의류, 스타일, 패션 브랜드, 디자이너, 액세서리
- 뷰티: 화장품, 스킨케어, 뷰티 트렌드, 안티에이징
- 여행: 여행지, 호텔, 관광, 문화 체험
- 푸드: 음식, 레스토랑, 미식, 영양, 식단, 건강 식품
- 심리: 심리학, 정신 건강, 마음챙김, 자기계발
- 건강: 피트니스, 운동, 스포츠, 건강 관리
- 라이프스타일: 일상, 문화, 엔터테인먼트, 예술, 전시, 공연
- 하우징: 건축, 인테리어, 주거 공간, 리모델링
- 섹슈얼리티: 친밀감, 관계, 성 건강, 상담

응답 형식: 카테고리 이름만 정확히 출력하세요 (예: 패션, 뷰티, 푸드 등)`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 기사 카테고리 분류 전문가입니다. 주어진 카테고리 중 하나만 선택하세요.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 에러: ${response.statusText}`);
    }

    const data = await response.json();
    const inferredCategory = data.choices[0]?.message?.content?.trim() || defaultCategory;

    // 유효한 카테고리인지 확인
    if (VALID_CATEGORIES.includes(inferredCategory)) {
      console.log(`   🤖 AI 추론 카테고리: ${defaultCategory} → ${inferredCategory}`);
      return inferredCategory;
    } else {
      console.warn(`   ⚠️  유효하지 않은 카테고리 "${inferredCategory}", 기본값 사용`);
      return defaultCategory;
    }
  } catch (error) {
    console.error('   ❌ 카테고리 추론 실패:', error);
    return defaultCategory;
  }
}

/**
 * 키워드 기반 빠른 카테고리 추론 (AI 호출 없이)
 * NEW SEXY 9개 카테고리만 지원
 */
function quickInferCategory(title: string, content: string): string | null {
  const text = `${title} ${content}`.toLowerCase();

  // 명확한 키워드 매칭 (NEW SEXY - 9개 카테고리)
  // ⚠️ 중요: 순서가 중요! 더 구체적인 카테고리를 먼저 체크해야 함
  // 섹슈얼리티를 심리보다, 운동을 푸드보다 먼저 체크
  const rules: Record<string, string[]> = {
    패션: ['fashion', 'designer', 'runway', 'collection', '패션', '디자이너', 'vogue', 'style', 'jewelry', 'watch'],
    뷰티: ['beauty', 'skincare', '뷰티', '화장품', '스킨케어', 'cosmetic', 'makeup', 'anti-aging'],
    여행: ['travel', 'hotel', 'tourism', '여행', '호텔', 'destination', 'vacation', 'island', 'monument', 'landmark', 'memorial'],
    하우징: ['architecture', 'interior', 'house', 'home design', 'home interior', '건축', '인테리어', 'remodeling', 'renovation'],
    // 🔥 섹슈얼리티를 먼저 체크 (심리보다 구체적)
    섹슈얼리티: ['sexuality', 'intimacy', 'relationship', '섹슈얼리티', '친밀감', '관계', 'sex', 'sexual health', 'dating', 'romance'],
    // 🔥 운동을 먼저 체크 (푸드보다 구체적) - fitness 키워드 우선
    운동: ['fitness', 'exercise', 'workout', '운동', '피트니스', 'yoga', 'strength', 'cardio', 'training', 'gym', 'bodybuilding', 'pilates', 'stretching'],
    // 이제 더 넓은 카테고리들
    심리: ['psychology', 'mental health', 'mindfulness', '심리', '정신건강', 'meditation', '명상', 'therapy', 'counseling', 'well-being'],
    푸드: ['food', 'restaurant', 'chef', 'dining', '음식', '레스토랑', '미식', 'cuisine', 'michelin', 'wine', 'spirits', 'nutrition', 'diet', 'superfood', '영양', '식단', 'healthy eating', 'meal planning', 'vitamin', 'recipe'],
    라이프스타일: ['art', 'culture', 'exhibition', 'museum', 'theater', '예술', '문화', '전시', '공연', 'lifestyle', 'entertainment', 'hobby'],
  };

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return null;
}
