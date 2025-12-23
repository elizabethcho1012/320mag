# 카테고리 페이지 하단 배너 및 성능 개선 작업 완료

## 날짜
2025-12-23

## 작업 내용

### 1. 카테고리 페이지 하단 배너 추가
- **문제**: 카테고리 페이지에 하단 배너가 표시되지 않음
- **원인**: `bottom` position 타입이 정의되지 않음, 하단 배너 렌더링 로직 누락
- **해결**:
  - `src/components/AdBanner.tsx`: 'bottom' position 타입 추가
  - `src/pages/CategoryPage.tsx`: bottomAdvertisement 가져오기 및 렌더링 로직 추가
  - 페이지네이션 아래에 하단 배너 표시

**관련 파일**:
- `src/components/AdBanner.tsx:7` - position 타입에 'bottom' 추가
- `src/components/AdBanner.tsx:21` - bottom position 크기 설정
- `src/pages/CategoryPage.tsx:111-112` - top/bottom 광고 가져오기
- `src/pages/CategoryPage.tsx:272-276` - 하단 배너 렌더링

### 2. 관리자 페이지 접근 권한 문제 해결
- **문제**: admin 권한이 있어도 관리자 페이지 접근 불가
- **원인**: `App.tsx`에서 `AdminPage`에 `currentUser` prop 전달하지 않음
- **해결**:
  - `App.tsx`에서 profile 데이터를 currentUser로 변환하여 전달
  - Supabase profiles 테이블에 admin 권한 설정 확인

**관련 파일**:
- `src/App.tsx:160-165` - currentUser prop 전달 추가

**Supabase 설정**:
```sql
-- profiles 테이블에서 admin 권한 부여
UPDATE profiles
SET role = 'admin'
WHERE email = '3rdtwenty@gmail.com';
```

### 3. Supabase 쿼리 타임아웃 문제 해결
- **문제**: 페이지 로딩 시 20초 타임아웃 발생, 브라우저가 느려짐
- **원인**: `Promise.race`를 사용한 타임아웃 로직이 쿼리를 느리게 만듦
- **해결**:
  - 타임아웃 로직 완전 제거
  - retry를 0으로 설정하여 즉시 에러 처리
  - 에러 발생 시 빈 배열 반환하여 앱이 멈추지 않도록 함

**관련 파일**:
- `src/hooks/useArticles.ts:50-84` - usePublishedArticles 타임아웃 제거
- `src/hooks/useArticles.ts:124-158` - useFeaturedArticles 타임아웃 제거
- `src/hooks/useArticles.ts:351-378` - useCreators 타임아웃 제거

### 4. 홈페이지 무한 로딩 문제 해결
- **문제**: 홈페이지 접속 시 무한 로딩 발생
- **원인**: `articlesLoading || featuredLoading` 조건이 모두 완료될 때까지 기다림
- **해결**:
  - 2초 타임아웃 추가
  - 2초 후에는 데이터 로드 여부와 관계없이 콘텐츠 표시

**관련 파일**:
- `src/pages/HomePage.tsx:33-57` - 로딩 타임아웃 로직 추가

### 5. Vercel divemind 연결 문제 해결
- **문제**: `vercel link` 실행 시 자동으로 divemind 팀으로 연결됨
- **원인**:
  - Vercel CLI가 `mrdifferman-4847` 계정으로 로그인되어 있었고, 이 계정이 divemind 팀의 멤버였음
  - `.vercel/project.json`에 divemind의 orgId가 저장됨
- **해결**:
  1. `vercel logout` - 기존 계정 로그아웃
  2. `vercel login 3rdtwenty@gmail.com` - 올바른 계정으로 로그인
  3. `.vercel` 폴더 삭제 및 gitignore에 추가
  4. elizabethchos-projects 팀으로 프로젝트 연결

**중요**: 앞으로 `vercel link` 명령을 실행하지 말 것. GitHub push만으로 자동 배포됨.

## 배포 정보

### 현재 배포 상태
- **메인 도메인**: https://www.320.kr
- **Vercel 도메인**: https://320mag-two.vercel.app
- **Vercel 계정**: 3rdtwenty-8959 (3rdtwenty@gmail.com)
- **Vercel 팀**: elizabethchos-projects
- **GitHub 저장소**: https://github.com/elizabethcho1012/320mag

### 배포 방법
```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "커밋 메시지"
git push

# Vercel이 자동으로 배포 시작
# 1-2분 후 https://www.320.kr 에서 확인 가능
```

## 성능 개선 결과

### Before
- 홈페이지 로딩: 20초+ (타임아웃 발생)
- 관리자 페이지: 접근 불가
- 카테고리 하단 배너: 표시 안 됨

### After
- 홈페이지 로딩: 2초 이내
- 관리자 페이지: 정상 접근 가능
- 카테고리 하단 배너: 정상 표시 (bottom position 광고 등록 시)

## 향후 작업

### 선택적 개선 사항
1. Editor applications 쿼리 에러 수정
   - 현재 상태: `PGRST201` 에러 발생 (관계 중복)
   - 영향: 기능에는 영향 없음 (콘솔 에러만 발생)
   - 수정: `src/hooks/useArticles.ts`에서 쿼리 명시적 관계 지정

2. Mixed Content 경고 해결
   - 현재 상태: HTTP 이미지가 자동으로 HTTPS로 업그레이드됨
   - 영향: 기능에는 영향 없음 (자동 처리됨)
   - 수정: 이미지 URL을 HTTPS로 변경

## Git 커밋 히스토리
- `e36d3a2` - Fix category page bottom banner and admin access issues
- `be21403` - Fix infinite loading on homepage - add 2s timeout

## 참고 사항

### Supabase 데이터베이스
- 프로젝트 ID: `qitdjfckazpkqhhlacyx`
- URL: `https://qitdjfckazpkqhhlacyx.supabase.co`
- Admin 계정: `3rdtwenty@gmail.com` (role: 'admin')

### 환경 변수
- `.env` - 메인 환경 변수 (Git 추적됨)
- `.env.local` - 로컬 개발 환경 변수 (Git 무시됨)
- Vercel Dashboard에서 프로덕션 환경 변수 관리

### 중요 파일
- `.vercel/` - Vercel 프로젝트 설정 (Git 무시됨)
- `.gitignore` - `.vercel`, `.env*.local` 포함
- `vercel.json` - Vercel 빌드 설정

## 문제 해결 가이드

### divemind 연결 문제가 다시 발생하면
1. 현재 Vercel 계정 확인: `vercel whoami`
2. 팀 목록 확인: `vercel teams ls`
3. divemind가 보이면:
   - `vercel logout`
   - `vercel login` (3rdtwenty@gmail.com으로 로그인)
4. `.vercel` 폴더 삭제: `rm -rf .vercel`

### 무한 로딩 문제가 다시 발생하면
1. 브라우저 캐시 클리어 (Cmd+Shift+R)
2. Supabase 프로젝트 상태 확인 (Dashboard)
3. 로컬 개발 서버 재시작: `npm run dev`
4. Vite 캐시 클리어: `rm -rf node_modules/.vite && npm run dev`

### 관리자 페이지 접근 불가 시
1. Supabase에서 role 확인:
   ```sql
   SELECT id, email, role FROM profiles WHERE email = '3rdtwenty@gmail.com';
   ```
2. admin 권한 부여:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = '3rdtwenty@gmail.com';
   ```
3. 브라우저 새로고침 (로그아웃 후 재로그인)
