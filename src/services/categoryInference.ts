// AI를 사용한 카테고리 자동 추론 서비스
import Anthropic from '@anthropic-ai/sdk';

// 환경 변수에서 API 키 가져오기 (브라우저와 Node.js 모두 지원)
function getAnthropicApiKey(): string {
  // 브라우저 환경 (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.ANTHROPIC_API_KEY || '';
  }
  // Node.js 환경
  return process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';
}

// Lazy initialization - Anthropic 클라이언트를 필요할 때만 생성
let anthropicInstance: Anthropic | null = null;

function getAnthropicClient(apiKey?: string): Anthropic {
  const key = apiKey || getAnthropicApiKey();

  // apiKey가 제공된 경우 새 인스턴스 생성
  if (apiKey) {
    return new Anthropic({ apiKey: key });
  }

  // 기본 인스턴스 재사용
  if (!anthropicInstance) {
    anthropicInstance = new Anthropic({ apiKey: key });
  }

  return anthropicInstance;
}

// 지원하는 카테고리 목록 (NEW SEXY - 8개 카테고리)
const VALID_CATEGORIES = [
  '패션',
  '뷰티',
  '여행',
  '푸드',
  '심리',
  '운동',
  '하우징',
  '섹슈얼리티',
];

/**
 * 기사 제목과 내용을 분석해서 가장 적합한 카테고리를 추론
 *
 * 전략:
 * 1. 키워드로 1차 후보 카테고리 선정
 * 2. AI가 기사 내용을 분석하여 최종 카테고리 결정
 * 3. AI가 키워드 후보와 다른 카테고리를 선택하면 AI 판단 우선
 */
export async function inferCategory(
  title: string,
  content: string,
  defaultCategory: string = '여행',
  apiKey?: string
): Promise<string> {
  // 1단계: 키워드로 후보 카테고리 선정
  const keywordSuggestion = quickInferCategory(title, content);

  if (keywordSuggestion) {
    console.log(`   📊 키워드 추천: ${keywordSuggestion}`);
  }

  // 2단계: AI로 최종 검증 및 결정
  try {
    const rawKey = apiKey || getAnthropicApiKey();
    const cleanKey = typeof rawKey === 'string' ? rawKey.trim().replace(/^["']|["']$/g, '') : '';

    if (!cleanKey || cleanKey === 'your-anthropic-api-key-here') {
      console.warn('⚠️  Claude API 키 없음, 기본 카테고리 사용:', defaultCategory);
      return defaultCategory;
    }

    const systemPrompt = '당신은 기사 카테고리 분류 전문가입니다. 주어진 카테고리 중 하나만 선택하세요.';

    const prompt = `다음 기사의 **핵심 주제**를 파악하여 가장 적합한 카테고리를 하나만 선택하세요.

⚠️ 중요 규칙:
1. 기사의 **핵심 주제**가 무엇인지 먼저 파악하세요
2. 단순히 단어가 포함되어 있다고 해서 그 카테고리가 아닙니다
3. 키워드 추천은 참고만 하고, 기사 내용을 분석해서 최종 결정하세요
4. 예시:
   - "집에서 만드는 빵" → 푸드 (핵심: 빵 레시피, 키워드: 하우징이었지만 내용은 푸드)
   - "집을 리모델링하다" → 하우징 (핵심: 인테리어)
   - "발기부전과 건강" → 섹슈얼리티 (핵심: 성 건강)
   - "갱년기에 충동구매를 멈추는 법" → 심리 (핵심: 소비 심리, 갱년기는 부수적 언급)

제목: ${title}
내용: ${content.substring(0, 500)}
${keywordSuggestion ? `\n💡 키워드 분석 추천: ${keywordSuggestion} (참고용 - 내용 분석 후 다른 카테고리 선택 가능)` : ''}

카테고리 옵션 (NEW SEXY - 40~50대 AGene을 위한 8개 카테고리):
- 패션: 의류, 스타일, 패션 브랜드, 디자이너, 액세서리
- 뷰티: 화장품, 스킨케어, 뷰티 트렌드, 안티에이징
- 여행: 여행지, 호텔, 관광, 문화 체험, 역사적 장소, 건축물 방문
- 푸드: 음식, 레시피, 레스토랑, 미식, 영양, 식단, 요리, 술집
- 심리: 심리학, 정신 건강, 마음챙김, 자기계발, 소비 심리
- 운동: 피트니스, 운동, 스포츠, 건강 관리, 요가, 필라테스
- 하우징: 건축, 인테리어, 주거 공간 디자인, 리모델링, 공간 미학
- 섹슈얼리티: 친밀감, 부부 관계, 성 건강, 발기부전, 폐경, 생리, 난소, 성문화, 성욕

응답 형식: 카테고리 이름만 정확히 출력하세요 (예: 패션, 뷰티, 푸드 등)`;

    // Claude API 호출 (lazy initialization)
    const client = getAnthropicClient(apiKey);

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const inferredCategory = response.content[0]?.type === 'text'
      ? response.content[0].text.trim()
      : defaultCategory;

    // 유효한 카테고리인지 확인
    if (VALID_CATEGORIES.includes(inferredCategory)) {
      // AI가 키워드 추천과 다른 카테고리를 선택한 경우 강조
      if (keywordSuggestion && keywordSuggestion !== inferredCategory) {
        console.log(`   🤖 AI 최종 결정: ${keywordSuggestion} → ${inferredCategory} (키워드 추천 무시, 내용 분석 우선)`);
      } else if (keywordSuggestion) {
        console.log(`   ✅ AI 확정: ${inferredCategory} (키워드 추천과 일치)`);
      } else {
        console.log(`   🤖 AI 분석: ${inferredCategory}`);
      }
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

  // 🔥 CRITICAL: 콘텐츠의 핵심 주제를 파악하기 위한 우선순위 체크
  // 1단계: 매우 구체적인 주제 키워드 (섹슈얼리티, 레시피, 운동)
  // 2단계: 구체적인 주제 키워드 (패션, 뷰티, 여행)
  // 3단계: 넓은 주제 키워드 (하우징, 푸드, 심리)

  // === 1단계: 매우 구체적인 주제 ===

  // 섹슈얼리티 (가장 우선 - 성 건강, 친밀감 관련)
  // ⚠️ IMPORTANT: 핵심 주제인 경우만 매칭되도록 구체적인 키워드 사용
  const sexualityKeywords = [
    // 성 건강 (erectile, sexual health)
    'erectile dysfunction', 'impotence', '발기부전', '발기',
    'sexual health', 'sex life', '성생활', '성관계', '성기능',

    // 친밀감 & 성욕 (intimacy, libido)
    '친밀감', 'libido', '성욕', 'orgasm', '오르가즘',

    // 폐경 & 생리 (menopause, period)
    '폐경', 'menopause', '생리', 'period', 'menstruation',

    // 난소 & 호르몬 (ovary, PCOS)
    '난소', 'ovary', 'PCOS', '다낭성난소',

    // 성문화 (sexual culture)
    '성문화', 'sexual culture', '성적 콘텐츠', 'sexual content',

    // 성 관계 도서/자료
    '성과 관계', 'sex and relationship'
  ];

  // 제목에 섹슈얼리티 키워드가 있으면 우선 반환
  const titleLower = title.toLowerCase();
  if (sexualityKeywords.some(kw => titleLower.includes(kw.toLowerCase()))) {
    return '섹슈얼리티';
  }

  // 본문에서는 더 엄격하게 체크 (갱년기는 제외 - 너무 넓음)
  const specificSexualityKeywords = [
    'erectile dysfunction', 'impotence', '발기부전', '발기',
    'sexual health', 'sex life', '성생활', '성관계', '성기능',
    '친밀감', 'libido', '성욕', 'orgasm', '오르가즘',
    '폐경', 'menopause', '생리', 'period',
    '난소', 'ovary', 'PCOS', '다낭성난소',
    '성문화', 'sexual culture', '성적 콘텐츠'
  ];

  if (specificSexualityKeywords.some(kw => content.toLowerCase().includes(kw.toLowerCase()))) {
    return '섹슈얼리티';
  }

  // 레시피/요리 (푸드 우선 체크 - 'recipe', 'baking' 등 명확한 요리 행위)
  const recipeKeywords = [
    'recipe', 'baking', 'cooking', 'ingredient',
    '레시피', '베이킹', '요리법', '조리', '재료',
    'how to make', 'how to cook', 'bread recipe', 'cake recipe'
  ];
  if (recipeKeywords.some(kw => text.includes(kw))) {
    return '푸드';
  }

  // 운동 (피트니스 우선 체크)
  const fitnessKeywords = [
    'fitness', 'exercise', 'workout', 'training', 'gym',
    '운동', '피트니스', '트레이닝', '헬스', '체조',
    'yoga', 'pilates', 'strength', 'cardio', 'bodybuilding'
  ];
  if (fitnessKeywords.some(kw => text.includes(kw))) {
    return '건강';
  }

  // === 2단계: 구체적인 주제 ===

  // 패션
  const fashionKeywords = [
    'fashion', 'designer', 'runway', 'collection', 'vogue',
    '패션', '디자이너', '컬렉션', '패션쇼',
    'style', 'jewelry', 'watch', 'accessories'
  ];
  if (fashionKeywords.some(kw => text.includes(kw))) {
    return '패션';
  }

  // 뷰티
  const beautyKeywords = [
    'beauty', 'skincare', 'cosmetic', 'makeup', 'anti-aging',
    '뷰티', '화장품', '스킨케어', '메이크업', '안티에이징'
  ];
  if (beautyKeywords.some(kw => text.includes(kw))) {
    return '뷰티';
  }

  // 여행
  const travelKeywords = [
    'travel', 'hotel', 'tourism', 'destination', 'vacation',
    '여행', '호텔', '관광', '휴가', '여행지',
    'island', 'monument', 'landmark', 'memorial'
  ];
  if (travelKeywords.some(kw => text.includes(kw))) {
    return '여행';
  }

  // === 3단계: 넓은 주제 (더 신중하게) ===

  // 하우징 (인테리어, 건축 등 주거 공간에 대한 내용만)
  // ⚠️ CRITICAL: 'house', 'home' 단독 키워드는 제외! (너무 넓음)
  const housingKeywords = [
    'architecture', 'architect', '건축', '건축가',
    'interior design', 'interior decoration', '인테리어',
    'remodeling', 'renovation', '리모델링', '리노베이션',
    'home decor', '집 꾸미기', '주거 공간', 'furniture design'
  ];
  if (housingKeywords.some(kw => text.includes(kw))) {
    return '하우징';
  }

  // 푸드 (일반 음식 관련 - 레시피는 이미 체크됨)
  const foodKeywords = [
    'restaurant', 'chef', 'dining', 'michelin', 'wine', 'spirits',
    '레스토랑', '미식', '요리사', '셰프', '와인',
    'cuisine', 'nutrition', 'diet', 'superfood', '영양', '식단'
  ];
  if (foodKeywords.some(kw => text.includes(kw))) {
    return '푸드';
  }

  // 심리
  const psychologyKeywords = [
    'psychology', 'mental health', 'mindfulness', 'meditation',
    '심리', '정신건강', '마음챙김', '명상', 'therapy', 'counseling'
  ];
  if (psychologyKeywords.some(kw => text.includes(kw))) {
    return '심리';
  }

  // 더 이상 라이프스타일 카테고리 없음
  // 애매한 경우는 null 반환 → AI가 판단

  return null;
}
