# 🚀 Third Twenty 배포 체크리스트

완료 날짜: 2025-01-02
상태: 프로덕션 준비 완료

---

## ✅ Phase 1: Supabase 설정

### 1.1 Supabase 프로젝트 생성
- [ ] [Supabase](https://supabase.com) 접속
- [ ] 새 프로젝트 생성: "third-twenty"
- [ ] 리전 선택: Seoul (Asia Northeast)
- [ ] Database 비밀번호 저장
- [ ] 프로젝트 URL 및 API 키 복사

### 1.2 SQL 마이그레이션 실행
Supabase Dashboard > SQL Editor에서 순서대로 실행:

```bash
1. ✅ supabase/migrations/001_initial_schema.sql
2. ✅ supabase/migrations/002_create_profiles.sql
3. ✅ supabase/migrations/003_create_events.sql
4. ✅ supabase/migrations/004_add_notifications.sql
5. ✅ supabase/migrations/005_create_challenges.sql
6. ✅ supabase/migrations/006_update_event_participants.sql
7. ✅ supabase/migrations/007_create_email_system.sql
```

**각 마이그레이션 실행 후 "Success" 확인**

### 1.3 Storage 버킷 생성
Supabase Dashboard > Storage:
- [ ] `voice-recordings` 버킷 생성 (public)
- [ ] `article-images` 버킷 생성 (public)
- [ ] `profile-avatars` 버킷 생성 (public)

### 1.4 관리자 계정 생성
Supabase Dashboard > Authentication > Users:
- [ ] "Add user" 클릭
- [ ] 이메일: `admin@thirdtwenty.com` (또는 원하는 이메일)
- [ ] 비밀번호 설정
- [ ] "Auto Confirm User" 체크

SQL Editor에서 관리자 권한 부여:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@thirdtwenty.com';
```

---

## ✅ Phase 2: Firebase 설정

### 2.1 Firebase 프로젝트 생성
- [ ] [Firebase Console](https://console.firebase.google.com/) 접속
- [ ] "프로젝트 추가" 클릭
- [ ] 프로젝트 이름: "Third Twenty"
- [ ] Google Analytics 비활성화 (선택)
- [ ] 프로젝트 생성

### 2.2 Web 앱 등록
- [ ] 프로젝트 설정 > 일반
- [ ] "앱 추가" > 웹 선택
- [ ] 앱 닉네임: "Third Twenty Web"
- [ ] Firebase config 객체 복사

### 2.3 Cloud Messaging 설정
- [ ] 프로젝트 설정 > Cloud Messaging
- [ ] "Web Push certificates" 탭
- [ ] "Generate key pair" 클릭
- [ ] VAPID 키 복사

### 2.4 Service Worker 업데이트
`public/firebase-messaging-sw.js` 파일의 config 업데이트:
```javascript
const firebaseConfig = {
  apiKey: "실제-API-키",
  authDomain: "실제-도메인",
  projectId: "실제-프로젝트-ID",
  storageBucket: "실제-스토리지",
  messagingSenderId: "실제-센더-ID",
  appId: "실제-앱-ID"
};
```

---

## ✅ Phase 3: 로컬 환경 변수 설정

### 3.1 .env 파일 생성
```bash
cp .env.example .env
```

### 3.2 .env 파일 편집
다음 값들을 실제 값으로 교체:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_OPENAI_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_VAPID_KEY`

---

## ✅ Phase 4: 로컬 테스트

### 4.1 의존성 설치
```bash
npm install
```

### 4.2 개발 서버 실행
```bash
npm run dev
```

### 4.3 기능 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 관리자 페이지 접근 (admin 계정)
- [ ] 기사 목록 조회
- [ ] 이벤트 목록 조회
- [ ] 챌린지 목록 조회

### 4.4 AI 콘텐츠 수집 테스트
```bash
npm run collect:fashion
```

- [ ] 콘텐츠 수집 성공 확인
- [ ] Supabase에서 기사 생성 확인
- [ ] 이미지 추출 확인

### 4.5 빌드 테스트
```bash
npm run build
npm run preview
```

- [ ] 빌드 성공 확인
- [ ] Preview 서버에서 동작 확인

---

## ✅ Phase 5: GitHub 설정

### 5.1 GitHub Repository 생성
- [ ] GitHub에 새 repository 생성: "320mag"
- [ ] Private/Public 선택
- [ ] README 추가하지 않음 (이미 있음)

### 5.2 Git 초기화 및 Push
```bash
git init
git add .
git commit -m "Initial commit - Third Twenty complete"
git branch -M main
git remote add origin https://github.com/your-username/320mag.git
git push -u origin main
```

### 5.3 GitHub Secrets 설정
Repository > Settings > Secrets and variables > Actions:

- [ ] `OPENAI_API_KEY`
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_VAPID_KEY`

### 5.4 GitHub Actions 확인
- [ ] Actions 탭에서 "Collect Content" 워크플로우 확인
- [ ] 수동 실행 테스트

---

## ✅ Phase 6: Vercel 배포

### 6.1 Vercel 프로젝트 생성
- [ ] [Vercel](https://vercel.com) 접속
- [ ] "New Project" 클릭
- [ ] GitHub repository 연결
- [ ] "Import" 클릭

### 6.2 빌드 설정
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 6.3 환경 변수 추가
Project Settings > Environment Variables:

**Production 환경:**
- [ ] 모든 `VITE_*` 변수 추가
- [ ] `OPENAI_API_KEY` 추가

**Preview 환경:** (선택사항)
- [ ] 동일한 변수 추가

### 6.4 배포
- [ ] "Deploy" 버튼 클릭
- [ ] 배포 완료 대기 (2-3분)
- [ ] 배포 URL 확인: `https://your-project.vercel.app`

---

## ✅ Phase 7: 도메인 설정 (선택사항)

### 7.1 도메인 구매
- [ ] 원하는 도메인 구매 (예: thirdtwenty.com)

### 7.2 Vercel에 도메인 연결
Vercel > Project Settings > Domains:
- [ ] "Add Domain" 클릭
- [ ] 도메인 입력
- [ ] DNS 레코드 설정 (Vercel 안내 따라하기)

### 7.3 SSL 인증서
- [ ] Vercel 자동 SSL 활성화 확인
- [ ] HTTPS 접속 테스트

---

## ✅ Phase 8: Edge Functions 배포

### 8.1 Supabase CLI 설치
```bash
npm install -g supabase
```

### 8.2 Supabase 로그인
```bash
supabase login
```

### 8.3 프로젝트 연결
```bash
supabase link --project-ref your-project-ref
```

Project ref는 Supabase Dashboard URL에서 확인:
`https://supabase.com/dashboard/project/[project-ref]`

### 8.4 Edge Functions 배포
```bash
# Send Email Function
supabase functions deploy send-email

# Send Notification Function
supabase functions deploy send-notification
```

### 8.5 Secrets 설정
```bash
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
supabase secrets set RESEND_API_KEY=your-resend-key  # 선택사항
```

---

## ✅ Phase 9: Analytics 설정 (선택사항)

### 9.1 Google Analytics 4
- [ ] [Google Analytics](https://analytics.google.com) 접속
- [ ] 새 속성 생성: "Third Twenty"
- [ ] 측정 ID (G-XXXXXXXXXX) 복사
- [ ] Vercel 환경 변수에 `VITE_GA4_ID` 추가

### 9.2 Sentry (에러 모니터링)
- [ ] [Sentry](https://sentry.io) 가입
- [ ] 새 프로젝트 생성: "Third Twenty"
- [ ] DSN 복사
- [ ] Vercel 환경 변수에 `VITE_SENTRY_DSN` 추가

---

## ✅ Phase 10: 최종 테스트

### 10.1 프로덕션 테스트
배포된 사이트에서:
- [ ] 회원가입/로그인
- [ ] 기사 읽기
- [ ] 이벤트 등록
- [ ] 챌린지 참여
- [ ] 푸시 알림 권한 요청
- [ ] 이메일 수신 (welcome email)
- [ ] 관리자 페이지 (admin 계정)

### 10.2 성능 테스트
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) 실행
- [ ] Lighthouse 점수 확인 (목표: 90+)
- [ ] 모바일 반응형 확인

### 10.3 SEO 테스트
- [ ] Google Search Console 등록
- [ ] Sitemap 제출
- [ ] robots.txt 확인
- [ ] Meta tags 확인

---

## ✅ Phase 11: 콘텐츠 초기 설정

### 11.1 첫 콘텐츠 수집
GitHub Actions에서:
- [ ] "Collect Content" 워크플로우 수동 실행
- [ ] 수집 완료 확인 (약 5-10분)
- [ ] Supabase에서 기사 확인

### 11.2 관리자 페이지에서 확인
- [ ] Admin 로그인
- [ ] Articles 탭에서 수집된 기사 확인
- [ ] 원하는 기사를 "Published"로 변경
- [ ] 메인 페이지에서 발행된 기사 확인

---

## ✅ Phase 12: 운영 준비

### 12.1 백업 설정
- [ ] Supabase 자동 백업 활성화 확인
- [ ] Git repository 정기 백업 계획

### 12.2 모니터링 설정
- [ ] Vercel 알림 설정
- [ ] Sentry 알림 설정
- [ ] GitHub Actions 실패 알림 설정

### 12.3 문서 정리
- [ ] README.md 업데이트
- [ ] 운영 매뉴얼 작성
- [ ] 팀원 공유

---

## 🎉 완료!

모든 체크리스트를 완료하셨다면 축하합니다!

**Third Twenty가 정식으로 런칭되었습니다!** 🚀

### 다음 단계:
1. 소셜 미디어 공유
2. 사용자 피드백 수집
3. 정기적인 콘텐츠 업데이트 (자동)
4. 기능 개선 및 버그 수정

---

**문제가 발생하면:**
- SUPABASE_SETUP.md 참고
- FIREBASE_SETUP.md 참고
- DEPLOYMENT_GUIDE.md 참고
- FINAL_COMPLETION_REPORT.md 참고

**마지막 업데이트:** 2025-01-02
