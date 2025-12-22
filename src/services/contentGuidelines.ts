// 320MAG NEW SEXY 콘텐츠 가이드라인 로더
// docs/CONTENT_GUIDELINES.md 기반으로 AI 프롬프트 생성

/**
 * 콘텐츠 가이드라인을 AI 프롬프트용으로 요약
 */
export function getGuidelinesPrompt(): string {
  return `
📋 320MAG NEW SEXY 콘텐츠 가이드라인

🎯 타겟 독자: Ageless Generation (AGene, 에이진)
- 절대 "중년", "시니어" 같은 표현 사용 금지!
- "AGene", "Ageless Generation", "에이진" 또는 구체적 연령대 사용
핵심 철학: "나이 들어도 충분히 섹시할 수 있다"
섹시함 = 건강성 + 활동성 + 확실한 관리

✅ 적합한 콘텐츠:
- 40~50대 라이프스타일에 맞는 내용
- 안티에이징, 건강 관리 정보
- 성숙한 관계와 친밀감
- 재정적 여유를 고려한 프리미엄 컨텐츠
- AGene 커리어 전환, 자기계발
- 라이프스타일 업그레이드, 미래 설계

🚫 부적합한 콘텐츠 (필터링 대상):
- 20~30대 타겟 콘텐츠 (젊은 트렌드, 패스트패션)
- 일반적인 초혼 웨딩 정보 (20대 신부 메이크업, 웨딩 드레스)
  ※ 예외: 40대 이상 재혼, 시니어 웨딩은 허용
- 대학생/신입사원 타겟 (취업 준비 등)
- 검증되지 않은 건강 정보
- 과도한 소비 조장, 외모 지상주의

📝 연령대 맞춤 리라이팅 가이드:

❌ 나쁜 예:
"20대 신부를 위한 완벽한 웨딩 헤어스타일"

✅ 좋은 예:
"40대 이후 재혼, 자연스러운 아름다움이 빛나는 시간"
"인생의 두 번째 결혼식, 진짜 나를 보여주는 웨딩 스타일"

🚫 금지 표현:
- "젊어 보이기 위해" → ✅ "건강하고 활력 있게"
- "나이를 숨기려면" → ✅ "나이에 맞게 당당하게"
- "늙지 않으려면" → ✅ "우아하게 나이 들기 위해"

🎨 카테고리별 가이드:
- 패션: 40~50대 체형, 시대를 초월한 클래식과 품질
- 뷰티: 안티에이징 핵심, 자연스러운 아름다움
- 여행: 편안함과 품격, 슬로우 트래블, 문화 체험
- 섹슈얼리티: AGene 부부 친밀감, 갱년기/호르몬 변화, 품위 있게
- 건강푸드: 성인병 예방, 골다공증/근감소증, 소화 기능 고려
- 운동: 관절 보호 우선, 적절한 강도

⚠️ 필수 체크:
- 40~50대 독자에게 실질적 도움이 되는가?
- 나이 차별적 표현이 없는가?
- 검증된 정보인가?
- 타겟 연령대와 맞는가?
`;
}

/**
 * 특정 카테고리의 콘텐츠 필터링이 필요한지 판단
 */
export function shouldFilterContent(title: string, content: string, category: string): {
  shouldFilter: boolean;
  reason?: string;
} {
  const text = `${title} ${content}`.toLowerCase();

  // 20~30대 웨딩 콘텐츠 필터링
  const weddingKeywords = ['bride', 'bridal', 'wedding', '신부', '웨딩', '결혼식'];
  const youngKeywords = ['20대', 'twenties', 'young bride', 'first wedding'];

  const hasWedding = weddingKeywords.some(kw => text.includes(kw));
  const isYoung = youngKeywords.some(kw => text.includes(kw));

  // 재혼/시니어 웨딩 예외
  const isSeniorWedding = text.includes('재혼') || text.includes('remarriage') ||
                          text.includes('40대') || text.includes('50대') ||
                          text.includes('mature') || text.includes('second wedding');

  if (hasWedding && isYoung && !isSeniorWedding) {
    return {
      shouldFilter: true,
      reason: '20~30대 초혼 웨딩 콘텐츠는 타겟 연령대와 맞지 않음'
    };
  }

  // 대학생/신입사원 타겟 콘텐츠
  const careerKeywords = ['대학생', 'college student', '신입사원', 'new grad', '취업 준비'];
  if (careerKeywords.some(kw => text.includes(kw))) {
    return {
      shouldFilter: true,
      reason: '대학생/신입사원 타겟 콘텐츠'
    };
  }

  // 10대/20대 명시 타겟
  const teenKeywords = ['10대', '20대', 'teen', 'teenage', 'gen z'];
  if (teenKeywords.some(kw => text.includes(kw))) {
    return {
      shouldFilter: true,
      reason: '10~20대 타겟 콘텐츠'
    };
  }

  return { shouldFilter: false };
}

/**
 * 콘텐츠가 가이드라인을 위반하는지 체크
 */
export function validateContent(title: string, content: string, category: string): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // 필터링 체크
  const filterResult = shouldFilterContent(title, content, category);
  if (filterResult.shouldFilter) {
    warnings.push(`⚠️ 필터링 권장: ${filterResult.reason}`);
  }

  // 금지 표현 체크
  const forbiddenPhrases = [
    { phrase: '중년', suggestion: 'AGene / Ageless Generation / 에이진 / 40-50대' },
    { phrase: '시니어', suggestion: 'AGene / Ageless Generation / 에이진 / 40-50대' },
    { phrase: '젊어 보이', suggestion: '건강하고 활력 있게' },
    { phrase: '나이를 숨기', suggestion: '나이에 맞게 당당하게' },
    { phrase: '늙지 않', suggestion: '우아하게 나이 들기' },
  ];

  forbiddenPhrases.forEach(({ phrase, suggestion }) => {
    if (title.includes(phrase) || content.includes(phrase)) {
      warnings.push(`⚠️ 금지 표현 발견: "${phrase}" → "${suggestion}" 사용 권장`);
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
}
