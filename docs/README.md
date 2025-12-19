# Third Twenty AI 에디팅 자동화 시스템

## 📊 시스템 개요

**목적**: 해외 트렌드 기사를 수집하여 한국 시니어 독자(40-60대)를 위한 완전히 새로운 콘텐츠로 자동 재창작

**최종 업데이트**: 2025-12-07

---

## 🎯 핵심 원칙

### 1. 사실 기반 저널리즘
- ✅ 원문의 사실 정보 정확히 유지 (인물명, 이벤트, 제품명, 날짜)
- ✅ 사실을 바탕으로 에디터만의 감각적인 글로 재구성
- ❌ 가상의 이야기나 인물 창작 금지
- ❌ 주제를 완전히 다른 것으로 변경 금지

### 2. 이미지-콘텐츠 매칭
- ✅ 원본 이미지 우선 사용 (RSS → OG Image → Unsplash)
- ✅ 이미지가 있으면 원본 주제 유지 필수
- ✅ 실존 인물 → 그 사람의 사진 필수

### 3. 법적 안전성
- ✅ Fair Use / 변형적 사용 (transformative use)
- ✅ 사실 정보만 추출, 표현은 완전히 다르게
- ✅ 원문 URL 출처 표기

---

## 💰 비용 구조

| 항목 | 모델 | 비용 |
|------|------|------|
| 카테고리 추론 | GPT-4 Turbo | $0.006/기사 |
| 콘텐츠 리라이팅 | Claude 3.5 Haiku | $0.015/기사 |
| **합계** | **하이브리드** | **₩27/기사** |

**월간 비용** (매일 3개 × 30일 = 90개):
- **₩2,430/월**
- GPT-4 단독 대비 82% 절감

---

## 📁 주요 문서

### 필수 문서
1. **[AI_EDITING_GUIDELINES.md](./AI_EDITING_GUIDELINES.md)** - 에디팅 자동화 시스템의 모든 기준
   - 법적 기준 (저작권, Fair Use)
   - 콘텐츠 변형 기준 (사실 추출 → 관점 전환 → 페르소나 적용)
   - 이미지-콘텐츠 매칭 기준
   - AI 프롬프트 구현 상태

2. **[HYBRID_IMPLEMENTATION.md](./HYBRID_IMPLEMENTATION.md)** - GPT-4 + Claude 3.5 Haiku 구현
   - 설치 방법
   - 비용 절감 효과
   - 사용 방법
   - 문제 해결

3. **[HAIKU_COST_ANALYSIS.md](./HAIKU_COST_ANALYSIS.md)** - Haiku 비용 분석
   - Sonnet vs Haiku 비교
   - 월간/연간 비용 시뮬레이션

### 참고 문서
4. **[IMAGE_MISMATCH_ANALYSIS.md](./IMAGE_MISMATCH_ANALYSIS.md)** - 이미지 매칭 문제 분석
5. **[API_COMPARISON.md](./API_COMPARISON.md)** - OpenAI vs Anthropic 비교
6. **[WEEKLY_ROTATION_PLAN.md](./WEEKLY_ROTATION_PLAN.md)** - 요일별 콘텐츠 순환 계획

---

## 🚀 빠른 시작

### 1. API 키 설정
`.env` 파일에 두 API 키 모두 필요:
```bash
# OpenAI (카테고리 추론)
OPENAI_API_KEY=sk-proj-...
VITE_OPENAI_API_KEY=sk-proj-...

# Anthropic (콘텐츠 리라이팅)
ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 2. 테스트 실행
```bash
# 3개 카테고리 테스트 (패션, 뷰티, 운동)
npx tsx scripts/test-three-categories.ts
```

### 3. 매일 자동 수집
```bash
# 요일별 3개 자동 수집
npm run collect:daily

# Cron 설정 (매일 오전 9시)
0 9 * * * npm run collect:daily
```

---

## 📊 워크플로우

```
1. RSS 수집
   ↓
2. 카테고리 추론 (GPT-4) ← $0.006
   - 키워드 기반 빠른 추론
   - AI 기반 정확한 분류
   ↓
3. 이미지 추출 (RSS/OG Image)
   ↓
4. 콘텐츠 리라이팅 (Claude 3.5 Haiku) ← $0.015
   - 사실 정보 유지
   - 이미지 매칭 제약
   - 페르소나 적용
   - 2000-2500자 에세이
   ↓
5. Supabase 저장
```

**총 비용**: $0.021 (약 ₩27/기사)

---

## ✅ 품질 체크리스트

### 사실 정확성
- [ ] 인물명 정확히 유지
- [ ] 이벤트/제품명 정확
- [ ] 날짜/장소 정확

### 이미지 매칭
- [ ] 이미지 주제 = 기사 주제
- [ ] 실존 인물 사진 정확
- [ ] 제품 이미지 정확

### 법적 안전성
- [ ] 원문 번역 아님
- [ ] 원문 표현 사용 안 함
- [ ] 출처 URL 저장됨

### 독자 적합성
- [ ] 시니어 독자 관점
- [ ] 에디터 페르소나 명확
- [ ] 실천 가능한 조언 포함

---

## 🔧 구현 파일

- `src/services/aiRewriteService.ts` - Claude 3.5 Haiku 리라이팅
- `src/services/categoryInference.ts` - GPT-4 카테고리 추론
- `src/services/contentPipeline.ts` - 전체 파이프라인
- `scripts/daily-rotation.ts` - 매일 자동 수집
- `scripts/test-three-categories.ts` - 테스트 스크립트

---

## 📞 문제 해결

### Anthropic API 인증 오류
1. API 키 확인: https://console.anthropic.com/settings/keys
2. 크레딧 잔액 확인: https://console.anthropic.com/settings/billing
3. Sonnet 접근 불가 → Haiku 사용 (현재 구현)

### 이미지-내용 불일치
- 원본 주제가 유지되는지 확인
- AI 프롬프트 제약 확인
- 필요시 이미지 제거 (null)

---

**개발**: Claude Code
**상태**: ✅ 프로덕션 준비 완료
**비용**: ₩2,430/월 (90개 기사)
