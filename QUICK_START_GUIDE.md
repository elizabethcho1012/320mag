# 🚀 Third Twenty 빠른 시작 가이드

**프로젝트 상태**: ✅ 100% 완성 | 배포 준비 완료

이 가이드는 Third Twenty 프로젝트를 로컬에서 실행하고 프로덕션에 배포하는 가장 빠른 방법을 제공합니다.

---

## 📋 사전 준비물

- [x] Node.js 18+ 설치됨
- [x] npm 설치됨
- [x] Git 설치됨
- [ ] Supabase 계정 (무료)
- [ ] Firebase 계정 (무료)
- [ ] OpenAI API 키 (유료)
- [ ] Vercel 계정 (무료) - 배포용

---

## ⚡ 5분 안에 로컬 실행하기

### Step 1: Supabase 마이그레이션 실행

**현재 Supabase 프로젝트**: https://qitdjfckazpkqhhlacyx.supabase.co

1. 위 링크로 이동 → SQL Editor 클릭
2. 다음 6개 파일을 **순서대로** 복사-붙여넣기-실행:

```
✅ supabase/migrations/002_create_profiles.sql
✅ supabase/migrations/003_create_events.sql
✅ supabase/migrations/004_add_notifications.sql
✅ supabase/migrations/005_create_challenges.sql
✅ supabase/migrations/006_update_event_participants.sql
✅ supabase/migrations/007_create_email_system.sql
```

**참고**: `001_initial_schema.sql` 대신 이미 Supabase에 있는 기본 테이블들(articles, categories, creators)을 사용합니다.

각 파일 실행 후 "Success. No rows returned" 메시지 확인

### Step 2: Storage 버킷 생성

Supabase Dashboard → Storage:

1. "Create a new bucket" 클릭
2. 다음 3개 버킷 생성 (모두 Public으로):
   - `voice-recordings`
   - `article-images`
   - `profile-avatars`

### Step 3: 관리자 계정 생성

Supabase Dashboard → Authentication → Users:

1. "Add user" 클릭
2. 이메일: `admin@thirdtwenty.com`
3. 비밀번호 설정
4. "Auto Confirm User" 체크
5. Create user

SQL Editor에서 실행:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@thirdtwenty.com';
```

### Step 4: OpenAI API 키 추가

`.env` 파일 편집:
```bash
VITE_OPENAI_API_KEY=sk-your-actual-openai-key
OPENAI_API_KEY=sk-your-actual-openai-key
```

### Step 5: 로컬 실행

```bash
# 의존성 설치 (처음 한 번만)
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:5173 열기

### Step 6: 첫 콘텐츠 수집 (선택)

```bash
# 패션 카테고리 기사 수집 테스트
npm run collect:fashion
```

**축하합니다! 🎉 로컬 환경이 준비되었습니다!**

---

## 🌐 프로덕션 배포 (30분)

### Phase A: Firebase 설정

#### 1. Firebase 프로젝트 생성
1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" → 이름: "Third Twenty"
3. Google Analytics 비활성화 → 프로젝트 생성

#### 2. Web 앱 등록
1. 프로젝트 설정 → 일반 → 앱 추가 → 웹
2. 앱 닉네임: "Third Twenty Web"
3. Firebase SDK snippet 복사:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

#### 3. Cloud Messaging 설정
1. 프로젝트 설정 → Cloud Messaging
2. Web Push certificates → Generate key pair
3. VAPID 키 복사

#### 4. .env 파일 업데이트

```bash
VITE_FIREBASE_API_KEY=위에서_복사한_apiKey
VITE_FIREBASE_AUTH_DOMAIN=위에서_복사한_authDomain
VITE_FIREBASE_PROJECT_ID=위에서_복사한_projectId
VITE_FIREBASE_STORAGE_BUCKET=위에서_복사한_storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=위에서_복사한_messagingSenderId
VITE_FIREBASE_APP_ID=위에서_복사한_appId
VITE_FIREBASE_VAPID_KEY=위에서_복사한_VAPID_키
```

#### 5. Service Worker 업데이트

`public/firebase-messaging-sw.js` 파일 열기 → 13-19줄의 firebaseConfig를 위 값으로 교체

### Phase B: Vercel 배포

#### 1. GitHub에 Push
```bash
git init
git add .
git commit -m "Initial commit - Third Twenty complete"
git branch -M main
git remote add origin https://github.com/your-username/320mag.git
git push -u origin main
```

#### 2. Vercel 프로젝트 생성
1. https://vercel.com 접속
2. "New Project" → Import Git Repository
3. GitHub repository 선택 (320mag)

#### 3. 빌드 설정
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 4. 환경 변수 추가

Project Settings → Environment Variables → Production:

```
VITE_SUPABASE_URL=https://qitdjfckazpkqhhlacyx.supabase.co
VITE_SUPABASE_ANON_KEY=(현재_.env_파일에_있는_값_복사)
VITE_OPENAI_API_KEY=(현재_.env_파일에_있는_값_복사)
OPENAI_API_KEY=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_API_KEY=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_AUTH_DOMAIN=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_PROJECT_ID=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_STORAGE_BUCKET=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_MESSAGING_SENDER_ID=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_APP_ID=(현재_.env_파일에_있는_값_복사)
VITE_FIREBASE_VAPID_KEY=(현재_.env_파일에_있는_값_복사)
```

#### 5. 배포
"Deploy" 버튼 클릭 → 2-3분 대기 → 배포 URL 확인

### Phase C: Supabase Edge Functions 배포

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref qitdjfckazpkqhhlacyx

# Edge Functions 배포
supabase functions deploy send-email
supabase functions deploy send-notification

# Secrets 설정
supabase secrets set SUPABASE_URL=https://qitdjfckazpkqhhlacyx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Service Role Key는 Supabase Dashboard → Settings → API에서 확인

### Phase D: GitHub Actions 설정 (자동 콘텐츠 수집)

GitHub Repository → Settings → Secrets and variables → Actions:

다음 secrets 추가:
- `OPENAI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

이제 매일 6시, 12시, 18시(KST)에 자동으로 콘텐츠가 수집됩니다!

---

## ✅ 최종 테스트 체크리스트

### 로컬 테스트
- [ ] http://localhost:5173 접속
- [ ] 회원가입 → 로그인 성공
- [ ] 기사 목록 보이는지 확인
- [ ] 이벤트 페이지 접속
- [ ] 챌린지 페이지 접속
- [ ] 관리자 계정으로 로그인 (admin@thirdtwenty.com)
- [ ] Admin 페이지 접근 가능

### 프로덕션 테스트
- [ ] Vercel URL 접속 (https://your-project.vercel.app)
- [ ] 회원가입 → 로그인 성공
- [ ] 푸시 알림 권한 요청 작동
- [ ] 이메일 수신 (welcome email)
- [ ] 관리자 페이지 접근
- [ ] 모바일에서 반응형 확인

### 콘텐츠 수집 테스트
- [ ] GitHub Actions → Collect Content 워크플로우 수동 실행
- [ ] 5-10분 후 Supabase에서 기사 확인
- [ ] Admin 페이지에서 기사를 Published로 변경
- [ ] 메인 페이지에서 발행된 기사 확인

---

## 🎯 핵심 기능 요약

### 사용자 기능
✅ AI 큐레이션 콘텐츠 (12개 에디터 페르소나)
✅ 음성 챌린지 (음성 녹음)
✅ 이벤트 시스템 (QR 체크인)
✅ 푸시 알림 (Firebase)
✅ 이메일 알림
✅ 마이페이지
✅ 댓글 시스템
✅ Full-text 검색

### 관리자 기능
✅ Admin 대시보드
✅ 기사 관리 (CRUD)
✅ 미디어 라이브러리
✅ 이벤트 관리
✅ 알림 발송

### 자동화
✅ AI 콘텐츠 수집 (하루 3회)
✅ 이미지 자동 추출
✅ 자동 이메일 발송
✅ 자동 푸시 알림

---

## 🆘 문제 해결

### 빌드 실패
```bash
npm run build
```
에러 메시지 확인 후 해결

### Supabase 연결 실패
- `.env` 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 정확한지 확인
- Supabase Dashboard → Settings → API에서 값 재확인

### Firebase 푸시 알림 안됨
- `public/firebase-messaging-sw.js`의 firebaseConfig가 정확한지 확인
- Firebase Console → Cloud Messaging에서 VAPID 키 재확인
- 브라우저에서 알림 권한 허용했는지 확인

### 콘텐츠 수집 실패
- OpenAI API 키가 유효한지 확인
- API 크레딧이 남아있는지 확인
- GitHub Actions Secrets에 OPENAI_API_KEY가 정확한지 확인

---

## 📚 추가 문서

- [README_NEW.md](README_NEW.md) - 프로젝트 전체 개요
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 상세 배포 체크리스트
- [SUPABASE_MIGRATIONS_GUIDE.md](SUPABASE_MIGRATIONS_GUIDE.md) - 마이그레이션 가이드
- [FINAL_COMPLETION_REPORT.md](FINAL_COMPLETION_REPORT.md) - 최종 완성 보고서

---

## 🎉 성공!

모든 단계를 완료하셨다면 축하합니다!

**Third Twenty가 정식으로 런칭되었습니다!** 🚀

### 다음 할 일:
1. ✅ 소셜 미디어 공유
2. ✅ 사용자 피드백 수집
3. ✅ 정기적인 콘텐츠 모니터링
4. ✅ 필요시 기능 개선

---

**마지막 업데이트**: 2025-01-02
**프로젝트 버전**: 1.0.0
**상태**: 프로덕션 준비 완료
