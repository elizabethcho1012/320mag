# Claude Development Rules - 320 Magazine

이 프로젝트에서 개발할 때 따라야 할 규칙과 배운 교훈들입니다.

## 1. 인증 및 로딩 상태 관리

### ❌ 하지 말아야 할 것

**절대로 동기적으로 프로필을 기다리지 마세요**

```typescript
// ❌ 나쁜 예: await로 프로필 조회를 기다림
if (event === 'SIGNED_IN' && currentSession?.user) {
  setSession(currentSession);
  setUser(currentSession.user);

  // 프로필 조회 완료까지 기다림 (수백 ms ~ 수 초)
  let userProfile = await fetchProfile(currentSession.user.id);
  if (!userProfile) {
    userProfile = await createProfile(...); // 또 기다림
  }
  setProfile(userProfile);

  // 여기서 드디어 loading=false (너무 늦음!)
  setLoading(false);
}
```

**문제점:**
- 네트워크 요청 완료까지 UI가 블로킹됨
- 프로필 조회 실패 시 무한 로딩
- 사용자 경험 저하 (로딩 시간 500ms~2초+)

### ✅ 올바른 방법

**인증 상태 확인 즉시 로딩 해제, 프로필은 백그라운드 처리**

```typescript
// ✅ 좋은 예: 즉시 loading 해제, 프로필은 백그라운드
if (event === 'SIGNED_IN' && currentSession?.user) {
  setSession(currentSession);
  setUser(currentSession.user);

  // 즉시 loading=false! (인증 상태만 확인하면 됨)
  setLoading(false);

  // 프로필 조회는 백그라운드에서 비동기 처리
  fetchProfile(currentSession.user.id).then(async (userProfile) => {
    if (!isMounted) return;
    if (!userProfile) {
      userProfile = await createProfile(...);
    }
    if (isMounted) {
      setProfile(userProfile);
    }
  }).catch(err => console.error('프로필 조회/생성 실패:', err));
}
```

**장점:**
- 로딩 시간 ~50ms (인증 확인만)
- 프로필 실패해도 앱 작동
- Progressive Enhancement 원칙
- 사용자가 즉시 콘텐츠를 볼 수 있음

### 핵심 원칙

1. **필수 정보와 선택 정보 구분**
   - 필수: 세션, 사용자 ID → 즉시 로드
   - 선택: 프로필, 메타데이터 → 백그라운드 로드

2. **실행 순서 최적화**
   ```
   ❌ 로그인 확인 → DB 프로필 조회 기다림 → UI 표시
   ✅ 로그인 확인 → 즉시 UI 표시 | (동시에) DB 프로필 조회
   ```

3. **타임아웃은 최후의 수단**
   - 타임아웃으로 해결하려 하지 말 것
   - 근본 원인(동기 처리)을 해결할 것

## 2. 데이터베이스 마이그레이션

### 광고 시스템 통합 규칙

**이벤트 테이블로 광고 기능 통합 시 주의사항:**

```sql
-- ✅ 올바른 마이그레이션
-- 1. 컬럼 추가
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_advertisement boolean DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS link_url text;

-- 2. 데이터 마이그레이션 (중복 체크)
INSERT INTO events (...)
SELECT ...
FROM advertisements
WHERE NOT EXISTS (
  SELECT 1 FROM events e WHERE e.title = advertisements.title
);

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_events_is_advertisement ON events(is_advertisement);
CREATE INDEX IF NOT EXISTS idx_events_positions ON events USING GIN(positions);
```

**주의사항:**
- `IF NOT EXISTS` 사용하여 멱등성 보장
- 중복 체크 필수
- 기존 테이블 삭제는 백업 후 수동으로

## 3. React 상태 관리

### 컴포넌트 리렌더링 최적화

```typescript
// ✅ cleanup 함수에서 isMounted 체크
useEffect(() => {
  let isMounted = true;

  fetchData().then(data => {
    if (isMounted) {  // 컴포넌트가 언마운트되면 상태 업데이트 안 함
      setData(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

## 4. 파비콘 및 PWA 설정

### 캐시 버스팅

```html
<!-- ✅ 버전 쿼리로 캐시 우회 -->
<link rel="icon" type="image/png" href="/favicon.png?v=2" />
```

### 파일 변환

```bash
# 320 로고를 여러 크기로 변환
sips -s format png logo.jpg --out favicon-32.png -z 32 32
sips -s format png logo.jpg --out favicon-192.png -z 192 192
sips -s format png logo.jpg --out favicon-512.png -z 512 512
```

## 5. 배포 체크리스트

1. **로컬 테스트**
   - 무한 로딩 확인
   - 인증 플로우 테스트
   - 브라우저 콘솔 에러 확인

2. **커밋 전**
   - 디버그 로그 정리
   - 타입 에러 해결
   - 린터 경고 확인

3. **배포 후**
   - Vercel 배포 상태 확인
   - 프로덕션 도메인 테스트
   - 브라우저 캐시 클리어 후 확인

## 6. 디버깅 베스트 프랙티스

### 로그 남기기

```typescript
// ✅ 의미 있는 이모지와 메시지
console.log('🔷 AuthContext: useEffect 시작');
console.log('🔔 Auth event:', event, 'session:', !!currentSession);
console.log('✅ SIGNED_IN processed, loading=false');
console.warn('⚠️ Auth initialization timeout');
```

### 문제 해결 순서

1. **현상 파악**: 브라우저 콘솔 로그 확인
2. **원인 분석**: 동기/비동기 처리 흐름 추적
3. **해결 방법**: 근본 원인 제거 (타임아웃 늘리기 같은 임시방편 지양)
4. **검증**: 로컬 + 배포 환경 모두 테스트

## 7. 성능 최적화

### Progressive Enhancement

```typescript
// ✅ 단계별 콘텐츠 로딩
// 1단계: 인증 확인 → UI 표시
setLoading(false);

// 2단계: 프로필 로드 (백그라운드)
fetchProfile().then(setProfile);

// 3단계: 추가 데이터 로드
fetchAdditionalData().then(setData);
```

### 실행 시간 목표

- 초기 로딩: < 100ms
- 인증 확인: < 50ms
- 프로필 로드: < 500ms (백그라운드)

## 히스토리

### 2024-12-24: 무한 로딩 문제 해결

**문제:** 페이지 새로고침 시 1초 이상 로딩 화면 표시
**원인:** `await fetchProfile()` 동기 처리로 UI 블로킹
**해결:** 인증 상태 확인 즉시 로딩 해제, 프로필은 백그라운드 처리
**영향:** 로딩 시간 500ms~2s → 50ms로 단축

### 2024-12-24: 파비콘 캐시 문제 해결

**문제:** 새 파비콘 배포 후에도 이전 파비콘 표시
**원인:** 브라우저 파비콘 강력 캐싱
**해결:** 쿼리 파라미터 버전 추가 (`?v=2`)

---

**마지막 업데이트:** 2024-12-24
**작성자:** Claude & 개발팀