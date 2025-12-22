# Third Twenty AI 에디팅 자동화 시스템

## 📊 시스템 개요

**목적**: 해외 트렌드 기사를 수집하여 Ageless Generation(AGene, 에이진)을 위한 완전히 새로운 콘텐츠로 자동 재창작

**최종 업데이트**: 2025-12-22 (UI/UX 개선 + Chrome 브라우저 이슈 해결 + 프로덕션 배포)

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
| 카테고리 추론 | Claude 3.5 Haiku | $0.013/기사 |
| 콘텐츠 리라이팅 | Claude 3.5 Haiku | $0.105/기사 |
| **합계** | **Haiku 단독** | **₩154/기사** |

**일일 수집**: 8개 카테고리 × 1개씩 = 8개/일
**월간 비용** (매일 8개 × 30일 = 240개):
- **₩36,960/월**
- 완전 자동화 시스템 (관리자 개입 불필요)

---

## 📁 주요 문서

### 필수 문서
1. **[AI_EDITING_GUIDELINES.md](./AI_EDITING_GUIDELINES.md)** - 에디팅 자동화 시스템의 모든 기준
   - 법적 기준 (저작권, Fair Use)
   - 콘텐츠 변형 기준 (사실 추출 → 관점 전환 → 페르소나 적용)
   - 이미지-콘텐츠 매칭 기준
   - AI 프롬프트 구현 상태

2. **[RSS-AUTO-RECOVERY.md](./RSS-AUTO-RECOVERY.md)** - RSS 자동 복구 시스템 ⭐ NEW
   - RSS 소스 자동 모니터링
   - 죽은 소스 자동 비활성화
   - AI 기반 새 소스 자동 검색 및 추가
   - 완전 무인 운영 시스템

3. **[HAIKU_COST_ANALYSIS.md](./HAIKU_COST_ANALYSIS.md)** - Haiku 비용 분석
   - Sonnet vs Haiku 비교
   - 월간/연간 비용 시뮬레이션

### 참고 문서
4. **[IMAGE_MISMATCH_ANALYSIS.md](./IMAGE_MISMATCH_ANALYSIS.md)** - 이미지 매칭 문제 분석
5. **[API_COMPARISON.md](./API_COMPARISON.md)** - OpenAI vs Anthropic 비교
6. **[HYBRID_IMPLEMENTATION.md](./HYBRID_IMPLEMENTATION.md)** - GPT-4 + Claude 하이브리드 (구버전)

---

## 🚀 빠른 시작

### 1. API 키 설정
`.env` 파일에 Anthropic API 키 필요:
```bash
# Anthropic (카테고리 추론 + 콘텐츠 리라이팅)
ANTHROPIC_API_KEY=sk-ant-api03-...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase (데이터베이스)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. RSS 건강 체크
```bash
# RSS 소스 자동 복구 (죽은 소스 감지 및 새 소스 추가)
npm run rss:health
```

### 3. 매일 자동 수집
```bash
# 8개 카테고리 각 1개씩 자동 수집 (RSS 복구 포함)
npm run collect:daily

# Cron 설정 (매일 오전 9시)
0 9 * * * cd /path/to/320mag && npm run collect:daily
```

### 4. 프로덕션 배포
```bash
# Vercel에 자동 배포
git add .
git commit -m "Update content"
git push origin main
```

---

## 📊 워크플로우

```
0. RSS 자동 복구 (매일 1회) 🔧 NEW
   - 죽은 RSS 소스 자동 감지 및 비활성화
   - AI가 새로운 RSS 소스 자동 검색
   - 검증 후 자동으로 content-sources.ts 업데이트
   ↓
1. RSS 수집 (8개 카테고리 × 활성 소스)
   ↓
2. 카테고리 추론 (Claude 3.5 Haiku) ← $0.013
   - 키워드 기반 빠른 추론
   - AI 기반 정확한 분류
   ↓
3. 이미지 중복 체크 (조기 차단)
   - 중복 이미지 감지 시 다음 기사로 자동 이동
   - AI 처리 비용 절감 (60초/기사 절약)
   ↓
4. 이미지 추출 (RSS/OG Image)
   ↓
5. 콘텐츠 리라이팅 (Claude 3.5 Haiku) ← $0.105
   - 사실 정보 유지
   - 이미지 매칭 제약
   - 페르소나 적용
   - 2000-2500자 에세이
   ↓
6. 중복 이미지 최종 체크
   ↓
7. Supabase 저장
   ↓
8. 목표 달성까지 반복 (3배 버퍼)
```

**총 비용**: $0.118 (약 ₩154/기사)
**일일 8개 수집**: ₩1,232/일
**월간 240개 수집**: ₩36,960/월

### 🔄 중복 이미지 처리 프로토콜 (2025-12-21 추가)

시스템은 중복 이미지를 자동으로 감지하고 다른 기사로 대체합니다:

- **3배 버퍼**: 4개 필요 시 12개 준비
- **자동 스킵**: 중복 감지 시 다음 기사 처리
- **목표 달성**: 성공 목표 달성까지 자동 반복
- **안전 장치**: 최대 50개까지만 시도

**예시**:
```
[시도 1/12] [성공 0/4] → 중복 감지, 스킵
[시도 2/12] [성공 0/4] → 중복 감지, 스킵
[시도 7/12] [성공 0/4] → 저장 성공! [성공 1/4]
...
[시도 10/12] [성공 3/4] → 저장 성공! [성공 4/4]
🎯 목표 달성! 4개 기사 수집 완료
```

### 🔧 RSS 자동 복구 시스템 (2025-12-22 추가)

RSS 소스가 죽으면 자동으로 감지하고 새로운 소스를 찾아서 추가하는 완전 자동화 시스템:

**실행 방법**:
```bash
# 수동 실행
npm run rss:health

# 자동 실행 (매일 수집 시 자동으로 실행됨)
npm run collect:daily
```

**처리 과정**:
1. **RSS 건강 체크 (Step 1)**
   - 모든 활성 RSS 소스 테스트 (최대 10개 기사 수집 시도)
   - 404, 403, 405, 타임아웃 등 에러 감지
   - 건강한 소스 vs 죽은 소스 분류

2. **죽은 소스 자동 비활성화 (Step 1-A)**
   - `content-sources.ts` 파일 자동 수정
   - `isActive: false` 설정
   - 에러 코드와 날짜 코멘트 자동 추가
   - 예: `isActive: false, // 2025-12-22: 404 에러로 자동 비활성화`

3. **새 소스 AI 검색 (Step 2)**
   - 소스가 3개 미만인 카테고리 감지
   - Claude AI가 해당 카테고리의 새로운 RSS 소스 검색
   - 검증 가능한 유명 사이트 위주 추천

4. **새 소스 자동 검증 및 추가 (Step 2-A)**
   - 추천된 RSS URL 실제 작동 테스트
   - 작동하는 소스만 `content-sources.ts`에 자동 추가
   - Git commit 없이 파일만 수정 (다음 배포 시 자동 반영)

**실행 결과 (2025-12-22 첫 실행)**:
```
📊 RSS 건강 체크 결과:
   - 전체 소스: 41개
   - 건강: 33개 (80.5%)
   - 죽음: 8개 (19.5%)

⚠️  죽은 소스 8개 자동 비활성화:
   - Into The Gloss (404)
   - Byrdie (404)
   - Refinery29 Beauty (404)
   - Budget Travel (403)
   - Lonely Planet (ERROR)
   - Serious Eats (404)
   - Saveur (ERROR)
   - Psychology Today (404)

🔍 카테고리별 소스 현황:
   뷰티: 2개 (1개 부족) ⚠️
   여행: 1개 (2개 부족) ⚠️
   푸드: 2개 (1개 부족) ⚠️
   섹슈얼리티: 2개 (1개 부족) ⚠️
```

**장점**:
- ✅ 관리자 개입 없이 완전 자동 운영
- ✅ RSS 죽어도 시스템이 알아서 복구
- ✅ 매일 수집 전 자동 실행으로 안정성 보장
- ✅ 소스 코드 파일 자동 업데이트

**권장 주기**: 매일 자동 실행 (daily-rotation.ts에 내장)

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

### 핵심 서비스
- `src/services/categoryInference.ts` - Claude 3.5 Haiku 카테고리 추론 + 리라이팅
- `src/services/contentPipeline.ts` - 전체 파이프라인 (8개 카테고리 일일 수집)
- `src/services/rssHealthMonitor.ts` - RSS 소스 건강 모니터링
- `src/services/webScraper.ts` - 웹 스크래핑 백업 시스템

### 자동화 스크립트
- `scripts/daily-rotation.ts` - 매일 자동 수집 (RSS 복구 포함)
- `scripts/auto-rss-recovery.ts` - RSS 자동 복구 시스템
- `scripts/check-articles.ts` - 기사 개수 확인
- `scripts/fill-specific-categories.ts` - 특정 카테고리 채우기

### 데이터 소스
- `src/data/content-sources.ts` - RSS 소스 목록 (자동 업데이트됨)
- `src/data/categories.ts` - 8개 카테고리 정의

---

## 📞 문제 해결

### Anthropic API 인증 오류
1. API 키 확인: https://console.anthropic.com/settings/keys
2. 크레딧 잔액 확인: https://console.anthropic.com/settings/billing
3. 환경 변수 확인: `VITE_ANTHROPIC_API_KEY` 설정 필수

### RSS 소스 문제
- 죽은 RSS는 자동으로 비활성화됨 (`rss:health` 자동 실행)
- 새 소스는 AI가 자동으로 찾아서 추가
- 수동 확인: `npm run rss:health`

### 이미지-내용 불일치
- 원본 주제가 유지되는지 확인
- AI 프롬프트 제약 확인
- 필요시 이미지 제거 (null)

### Vercel 배포 문제
- 환경 변수 설정: Settings → Environment Variables
- 필수 변수: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ANTHROPIC_API_KEY`
- 재배포: `git push origin main` (자동 배포 트리거)

### Chrome 브라우저 로딩 문제 (2025-12-22 해결)
**증상**: 특정 Chrome 프로필에서 무한 로딩 또는 느린 로딩

**해결 방법**:
1. **캐시 클리어 (가장 빠름)**
   ```
   https://320.kr?clearCache=true
   ```
   - React Query 캐시, localStorage, sessionStorage 자동 클리어
   - 정상 URL로 자동 리다이렉트

2. **Chrome 개발자 도구**
   - F12 → Application → Storage → "Clear site data"
   - Ctrl+Shift+R (하드 리프레시)

3. **Chrome 설정**
   ```
   chrome://settings/content/all
   → 검색: 320.kr → 데이터 삭제
   ```

**기술적 해결**:
- Auth 초기화 5초 타임아웃 추가 ([AuthContext.tsx](../src/contexts/AuthContext.tsx))
- Supabase 쿼리 20초 타임아웃 추가 ([useArticles.ts](../src/hooks/useArticles.ts))
- React Query `refetchOnMount`, `refetchOnReconnect` 활성화
- URL 파라미터 캐시 클리어 기능 추가 ([App.tsx](../src/App.tsx))

---

## 📈 현재 상태 (2025-12-22)

**배포**: ✅ Vercel 프로덕션 (https://320.kr)
**기사**: 106개 (8개 카테고리)
**시스템**: 완전 자동화 (관리자 개입 불필요)
**비용**: ₩36,960/월 (240개 기사)

### 최근 업데이트 (2025-12-22)

#### UI/UX 개선
- ✅ **Footer 정보 업데이트**: AGENE LIFESTYLE MAGAZINE으로 브랜드명 변경
- ✅ **모바일 네비게이션**: 가로 스크롤 지원 (스크롤바 숨김)
- ✅ **터치 제스처**: 히어로 슬라이더 스와이프 지원 (50px 임계값)
- ✅ **한글 타이포그래피**: `break-keep` 적용으로 단어 중간 줄바꿈 방지
  - 예: "스타일링" → "스타/일링" ❌ → "스타일링" ✅

#### 브라우저 호환성
- ✅ **Chrome 무한 로딩 해결**:
  - Auth 초기화 타임아웃 (5초)
  - Supabase 쿼리 타임아웃 (20초)
  - 캐시 클리어 URL 파라미터 (`?clearCache=true`)
- ✅ **Supabase 클라이언트 최적화**:
  - 헤더 설정 추가
  - DB 스키마 명시
  - Realtime 설정 최적화

#### 파일 변경 내역
- `src/components/layout/Footer.tsx` - 회사 정보 업데이트
- `src/components/layout/Header.tsx` - 모바일 네비게이션 스크롤
- `src/index.css` - `scrollbar-hide` 유틸리티 추가
- `src/pages/HomePage.tsx` - 터치 스와이프 + `break-keep`
- `src/components/article/ArticleCard.tsx` - `break-keep` 적용
- `src/pages/CategoryPage.tsx` - `break-keep` 적용
- `src/pages/SearchResultsPage.tsx` - `break-keep` 적용
- `src/contexts/AuthContext.tsx` - 타임아웃 + `isMounted` 플래그
- `src/hooks/useArticles.ts` - 20초 타임아웃 + 에러 처리
- `src/integrations/supabase/client.ts` - 클라이언트 설정 개선
- `src/App.tsx` - 캐시 클리어 기능 추가

### 카테고리별 기사 현황
- 하우징: 17개 ✅
- 섹슈얼리티: 13개 ✅
- 여행: 13개 ✅
- 푸드: 13개 ✅
- 패션: 13개 ✅
- 심리: 13개 ✅
- 뷰티: 12개 (1개 부족)
- 운동: 12개 (1개 부족)

### 다음 단계
1. ✅ RSS 자동 복구 시스템 완료
2. ✅ 일일 8개 카테고리 수집 완료
3. ✅ Vercel 프로덕션 배포 완료
4. ✅ UI/UX 모바일 최적화 완료
5. ✅ Chrome 브라우저 이슈 해결 완료
6. 🔄 매일 자동 수집 실행 중 (Cron 설정 권장)
7. 📊 월 1회 기사 품질 모니터링 권장

---

**개발**: Claude Code
**최종 업데이트**: 2025-12-22
**상태**: ✅ 프로덕션 운영 중
**자동화 레벨**: 100% (무인 운영)
