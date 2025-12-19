# 스레드 자동 업로드 시스템 설계

**상태**: 설계 완료, 구현 대기 (에디팅 자동화 완성 후 진행)
**최종 업데이트**: 2025-12-07
**예상 구현 시간**: 1-2일

## 현재 상황 파악

### 대화 복구 내용
- 사용자는 이전에 "에디팅 자동화 시스템 → 스레드 자동 업로드" 시스템에 대해 논의했음
- 대화 파일: `ebe28c5f-dcff-4f9e-a0c6-b3a4279e006b.jsonl` (15MB)
- 대화 창이 크래시된 이유: 대화 파일이 너무 커짐 (토큰 제한 초과)

### 확인된 기존 시스템
1. **에디팅 자동화 시스템** (이미 구현됨)
   - 매일 3개씩 요일별 카테고리 순환 수집
   - RSS 피드에서 콘텐츠 수집
   - AI 리라이팅 (GPT-4 + Claude 3.5 Sonnet 하이브리드)
   - Supabase에 자동 저장
   - 월 비용: 약 ₩7,560

### 필요한 작업
**"스레드에 자동으로 업로드"** 시스템 설계 및 구현

## 요구사항 (확정)

### 1. 플랫폼
- **Meta Threads** 사용

### 2. 업로드 형식
- Threads 적합 크기로 요약글 작성
- 매거진 페이지 링크를 맨 마지막에 첨부
- 이미지 포함 (기사의 featured_image_url)

### 3. 업로드 타이밍
- **기사 생성 즉시 자동 업로드**

### 4. 계정
- **매거진 공식 계정 1개**

## 설계 분석 완료

3가지 관점에서 설계를 검토했습니다:

### 1. 단순성 우선 (Simple Direct Integration)
- **장점**: 빠른 구현 (1시간), 최소한의 파일 (1개), 디버깅 쉬움
- **단점**: 재시도 로직 없음, 확장성 제한, 모니터링 약함
- **적합성**: 빠른 MVP 출시, 소규모 운영

### 2. 견고성 우선 (Robust Scalable Architecture)
- **장점**: Enterprise급 안정성, 재시도 큐, 완벽한 감사 로그, 확장 가능
- **단점**: 복잡한 구조, 구현 시간 길음 (2-3주), Edge Function 관리 필요
- **적합성**: 대규모 운영, 여러 계정 관리 예상 시

### 3. 균형잡힌 접근 (Balanced Pragmatic)
- **장점**: 1-2일 구현, 기존 패턴 따름, 프로덕션 준비됨, 향후 확장 가능
- **단점**: 재시도 로직 선택적, DB 추적 선택적
- **적합성**: **현재 요구사항에 최적** ✅

## 최종 추천: 균형잡힌 접근 방식 (Option 3)

### 추천 이유
1. **구현 속도**: 1-2일이면 완성 (Simple과 거의 같음)
2. **안정성**: 프로덕션 사용 가능한 에러 핸들링
3. **패턴 일관성**: 기존 emailService, pushNotificationService 패턴 재사용
4. **확장성**: 향후 재시도 로직, DB 추적 추가 가능 (리팩토링 불필요)
5. **비용 효율성**: Edge Function 없이 서비스 레이어만 사용

### Meta Threads API 정보
- **엔드포인트**: `POST https://graph.threads.net/v18.0/{user-id}/threads`
- **인증**: OAuth Access Token
- **글자 수 제한**: 500자 권장 (실제는 더 높음)
- **이미지**: JPEG/PNG, 8MB 권장
- **Rate Limit**: 100 posts/hour (무료 티어: 200 posts/month)

## 구현 계획

### 1. 새로 생성할 파일

#### A. `/src/services/threadsService.ts`
**목적**: Meta Threads API 통신 전담 서비스

**주요 함수**:
```typescript
// 1. 기사를 Threads에 포스팅
postToThreads(params: {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl?: string;
  category: string;
}): Promise<{success: boolean, threadId?: string, error?: string}>

// 2. Threads용 캡션 생성 (500자 제한)
generateThreadsCaption(params): string

// 3. 환경변수 검증
validateThreadsConfig(): {valid: boolean, error?: string}
```

**특징**:
- emailService.ts 패턴 따름
- 네이티브 fetch API 사용 (추가 패키지 불필요)
- Try-catch로 모든 에러 처리
- 로깅 포함

#### B. `/scripts/test-threads-posting.ts`
**목적**: 로컬 테스트 스크립트

**기능**:
- Dry-run 모드 지원
- 샘플 기사 데이터로 테스트
- API 요청 포맷 검증
- 캡션 길이 확인

### 2. 수정할 파일

#### A. `/src/services/contentPipeline.ts`
**위치**: Line 290 (기사 저장 성공 직후)

**추가 코드**:
```typescript
// Threads 포스팅 (비차단)
try {
  await postToThreads({
    title: rewritten.title,
    excerpt: rewritten.excerpt,
    slug: slug,
    imageUrl: featuredImageUrl,
    category: inferredCategory,
  });
  console.log(`    🧵 Threads 포스팅 완료`);
} catch (error: any) {
  console.error(`    ⚠️  Threads 실패 (무시):`, error.message);
  // 파이프라인은 계속 진행
}
```

**import 추가** (Line 8):
```typescript
import { postToThreads } from './threadsService';
```

#### B. `.env` 및 `.env.example`
**추가 환경변수**:
```env
# Meta Threads API
VITE_THREADS_ACCESS_TOKEN=your-access-token
VITE_THREADS_BUSINESS_ACCOUNT_ID=your-account-id
THREADS_ACCESS_TOKEN=your-access-token
THREADS_BUSINESS_ACCOUNT_ID=your-account-id
```

### 3. 텍스트 포맷팅 전략

**Threads 캡션 구조** (500자 이내):
```
[이모지] [제목 60자]

[AI 생성 요약문 - excerpt 사용]

자세한 내용:
https://thirdtwenty.com/articles/[slug]

#ThirdTwenty #[카테고리]
```

**예시**:
```
👗 Jenny Packham 최신 컬렉션

우아함과 혁신의 완벽한 조화로 럭셔리 실루엣을 재정의한 이번 시즌 컬렉션.

자세한 내용:
https://thirdtwenty.com/articles/jenny-packham-latest

#ThirdTwenty #패션
```

### 4. 에러 핸들링

**3단계 전략**:

1. **설정 검증** (API 호출 전)
   - 토큰 누락 → 경고 로그, 포스팅 스킵
   - 계정 ID 누락 → 경고 로그, 포스팅 스킵

2. **API 에러** (네트워크/인증)
   - 401 Unauthorized → 토큰 만료 로그
   - 429 Rate Limit → Rate limit 로그
   - 500 Server Error → API 장애 로그
   - **모든 경우 파이프라인은 계속 진행**

3. **Catch-all**
   - 예상치 못한 에러 → 전체 스택 로그
   - 기사 저장은 성공 유지

**핵심 원칙**: Threads 실패가 기사 생성을 막으면 안됨

### 5. 이미지 처리

**방식**: URL 전달 (간단)
- 기사의 `featured_image_url` 직접 사용
- Meta Threads가 URL에서 이미지 가져감
- 별도 업로드 불필요

**검증**:
- URL이 HTTPS인지 확인
- 유효한 이미지 URL인지 체크
- 없으면 텍스트만 포스팅

### 6. 테스트 계획

**Phase 1: 로컬 테스트** (30분)
```bash
# Dry-run 모드로 테스트
THREADS_DRY_RUN=true npm run test:threads

# 출력 확인:
# - 캡션 포맷 검증
# - 500자 이내 확인
# - API 요청 구조 확인
```

**Phase 2: 실제 API 테스트** (30분)
- 테스트 Threads 계정 생성
- 실제 포스팅 1회 시도
- 결과 확인

**Phase 3: 통합 테스트** (1시간)
- 기사 1개 자동 생성
- Threads 자동 포스팅 확인
- 에러 핸들링 테스트 (토큰 제거해서 테스트)

### 7. 구현 순서

**Day 1 오전 (2시간)**:
1. `threadsService.ts` 작성
2. 환경변수 설정
3. 로컬 dry-run 테스트

**Day 1 오후 (2시간)**:
1. `contentPipeline.ts` 통합
2. 테스트 스크립트 작성
3. 실제 API 테스트

**Day 2 (선택, 1시간)**:
1. DB 추적 테이블 추가 (선택적)
2. 모니터링 개선
3. 문서 작성

### 8. 핵심 파일 목록

**생성**:
- `/src/services/threadsService.ts` (~150줄)
- `/scripts/test-threads-posting.ts` (~50줄)

**수정**:
- `/src/services/contentPipeline.ts` (10줄 추가)
- `/.env` (4줄 추가)
- `/.env.example` (4줄 추가)

**총 작업량**: 약 200줄의 새 코드

### 9. 배포 전 체크리스트

- [ ] Meta Developer 계정 생성
- [ ] Threads Business 계정 연결
- [ ] Access Token 발급
- [ ] Account ID 확인
- [ ] `.env`에 토큰 추가
- [ ] 로컬 dry-run 테스트 성공
- [ ] 실제 API 테스트 1회 성공
- [ ] 에러 핸들링 테스트 완료
- [ ] 프로덕션 배포

### 10. 모니터링

**성공 로그**:
```
✅ 저장 완료 (ID: abc-123)
🧵 Threads 포스팅 완료 (Thread ID: 456)
```

**실패 로그**:
```
✅ 저장 완료 (ID: abc-123)
⚠️  Threads 실패 (무시): Invalid access token
```

**추적 메트릭** (향후):
- 포스팅 성공률
- 평균 응답 시간
- 에러 타입별 빈도

---

## 구현 전제 조건

### 필수 완료 사항
1. ✅ 에디팅 자동화 시스템 완성
   - RSS 수집 파이프라인 작동
   - AI 리라이팅 (GPT-4 + Claude 3.5) 안정화
   - Supabase 자동 저장 검증
   - 매일 3개 기사 자동 생성 확인

2. ⏳ Meta Threads 계정 준비
   - Meta Business 계정 생성
   - Threads 공식 계정 개설
   - Developer App 생성 및 Access Token 발급

### 구현 시작 시점
에디팅 자동화 시스템이 **최소 1주일 이상 안정적으로 작동**한 후 시작

---

## 다음 단계

### Phase 1: 에디팅 자동화 완성 (현재 단계)
- [ ] RSS 수집 안정화
- [ ] AI 리라이팅 품질 검증
- [ ] 매일 자동 실행 확인
- [ ] 에러 핸들링 개선

### Phase 2: Threads 계정 설정
- [ ] Meta Developer 계정 생성
- [ ] Threads Business 계정 연결
- [ ] API Access Token 발급
- [ ] 테스트 포스팅 수동 실행

### Phase 3: Threads 자동화 구현 (이 문서 기반)
- [ ] threadsService.ts 개발
- [ ] contentPipeline.ts 통합
- [ ] 테스트 및 검증
- [ ] 프로덕션 배포

---

## 참고 문서

이 설계 문서는 다음을 포함합니다:
- ✅ 3가지 설계 관점 비교 분석
- ✅ 최종 추천안 (균형잡힌 접근)
- ✅ 상세 구현 계획
- ✅ 파일별 수정 사항
- ✅ 테스트 전략
- ✅ 에러 핸들링 방법
- ✅ 배포 체크리스트

**구현 시작 전 이 문서를 다시 검토하세요.**
