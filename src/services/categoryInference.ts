// AI를 사용한 카테고리 자동 추론 서비스

const OPENAI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_OPENAI_API_KEY
  : process.env.VITE_OPENAI_API_KEY;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// 지원하는 카테고리 목록
const VALID_CATEGORIES = [
  '패션',
  '뷰티',
  '컬처',
  '여행',
  '시니어시장',
  '글로벌트렌드',
  '푸드',
  '하우징',
  '섹슈얼리티',
  '심리',
  '운동',
  '의료',
  '라이프스타일',
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
    const cleanKey = rawKey?.trim().replace(/^["']|["']$/g, '');

    if (!cleanKey || cleanKey === 'your-openai-api-key-here') {
      console.warn('⚠️  OpenAI API 키 없음, 기본 카테고리 사용:', defaultCategory);
      return defaultCategory;
    }

    const prompt = `다음 기사의 제목과 내용을 보고, 가장 적합한 카테고리를 하나만 선택하세요.

제목: ${title}
내용: ${content.substring(0, 500)}

카테고리 옵션:
- 패션: 의류, 스타일, 패션 브랜드, 디자이너
- 뷰티: 화장품, 스킨케어, 뷰티 트렌드
- 컬처: 예술, 문화, 전시, 공연, 책
- 여행: 여행지, 호텔, 관광
- 시니어시장: 시니어 비즈니스, 고령화 사회
- 글로벌트렌드: 경제, 기술, 사회 트렌드
- 푸드: 음식, 레스토랑, 요리, 맛집
- 하우징: 건축, 인테리어, 주거 공간
- 섹슈얼리티: 친밀감, 관계, 성 건강
- 심리: 심리학, 정신 건강
- 운동: 피트니스, 스포츠, 건강 운동
- 의료: 의학, 건강, 질병, 치료
- 라이프스타일: 위 카테고리에 해당하지 않는 일반적인 생활 주제

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
 */
function quickInferCategory(title: string, content: string): string | null {
  const text = `${title} ${content}`.toLowerCase();

  // 명확한 키워드 매칭
  const rules: Record<string, string[]> = {
    뷰티: ['beauty', 'skincare', '뷰티', '화장품', '스킨케어', 'cosmetic', 'makeup'],
    푸드: ['restaurant', 'food', 'chef', 'dining', '레스토랑', '음식', '맛집', 'cuisine', 'michelin'],
    패션: ['fashion', 'designer', 'runway', 'collection', '패션', '디자이너', 'vogue', 'style'],
    하우징: ['architecture', 'interior', 'house', 'design', '건축', '인테리어', 'home'],
    컬처: ['art', 'culture', 'exhibition', 'museum', 'theater', '예술', '문화', '전시', '공연'],
    의료: ['health', 'medical', 'doctor', 'hospital', '의료', '건강', 'medicine', 'clinic'],
    여행: ['travel', 'hotel', 'tourism', '여행', '호텔', 'destination'],
    글로벌트렌드: ['economic', 'technology', 'trend', 'global', 'business', '경제', '기술'],
  };

  for (const [category, keywords] of Object.entries(rules)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return null;
}
