# 🎉 Third Twenty (써드트웬티) - AI-Powered Senior Magazine

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Completion**: 100%

40-60대 시니어를 위한 AI 자동화 라이프스타일 매거진 플랫폼

## 🎯 프로젝트 개요

써드트웬티는 50-60대 시니어를 위한 **AI 자동화 라이프스타일 매거진**입니다.

12개 AI 에디터 페르소나가 매일 글로벌 소식을 수집하고, 각자의 고유한 페르소나로 리라이팅하여 시니어 독자들에게 전달합니다. 단순한 뉴스 큐레이션을 넘어, **커뮤니티 챌린지**, **이벤트 참가**, **음성 녹음** 등을 통해 시니어들의 경험과 생각을 공유하는 완전한 플랫폼입니다.

## 🌟 주요 기능

### 사용자 기능
- 📰 **AI 큐레이션 콘텐츠** - 12개 AI 에디터 페르소나가 매일 글로벌 뉴스를 큐레이션
- 🎤 **음성 챌린지** - 음성 녹음으로 참여하는 커뮤니티 챌린지
- 📅 **이벤트 시스템** - 온/오프라인 이벤트 등록 및 QR 체크인
- 🔔 **푸시 알림** - Firebase Cloud Messaging 기반 실시간 알림
- ✉️ **이메일 알림** - 맞춤형 이메일 뉴스레터
- 👤 **마이페이지** - 프로필, 히스토리, 북마크 관리
- 💬 **댓글 시스템** - 기사/이벤트 댓글 및 대댓글
- 🔍 **Full-text 검색** - 카테고리/날짜/작성자 필터

### 관리자 기능
- 📊 **Admin 대시보드** - 실시간 통계 및 분석
- ✍️ **기사 관리** - CRUD, Markdown 에디터
- 🖼️ **미디어 라이브러리** - 이미지 업로드/관리
- 🎫 **이벤트 관리** - 참가자 관리, QR 체크인
- 📢 **알림 발송** - 푸시/이메일 일괄 전송

### 자동화
- 🤖 **AI 콘텐츠 수집** - RSS → GPT-4 리라이팅 → DB (하루 3회)
- 🖼️ **이미지 자동 추출** - 10가지 방법 + Unsplash 폴백
- 📧 **자동 이메일** - 환영/확인/알림 자동 발송
- 🔔 **자동 푸시** - 새 기사/이벤트 알림

---

## 🏗️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Context + React Query
- **Routing**: React Router v6

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Social OAuth
- **Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions (Deno)
- **AI**: OpenAI GPT-4
- **Push Notifications**: Firebase Cloud Messaging

### DevOps
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Monitoring**: Google Analytics 4 + Sentry
- **PWA**: Service Workers + Manifest

---

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/your-username/320mag.git
cd 320mag
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env` 파일 생성:
```bash
cp .env.example .env
```

**필수 환경 변수**:
- `VITE_SUPABASE_URL` ✅ (이미 설정됨)
- `VITE_SUPABASE_ANON_KEY` ✅ (이미 설정됨)
- `VITE_OPENAI_API_KEY` (AI 콘텐츠 생성용)
- `VITE_FIREBASE_*` (푸시 알림용)

### 4. Supabase 마이그레이션 실행
**⭐ [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)를 먼저 읽어보세요!**

Supabase Dashboard에서:
1. SQL Editor 열기
2. 마이그레이션 파일 7개 순서대로 실행

### 5. 개발 서버 실행
```bash
npm run dev
```

http://localhost:5173 에서 확인

### 6. 빌드
```bash
npm run build
npm run preview
```

---

## 📚 문서

### 🚀 시작하기
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** ⭐ **시작하려면 여기부터!**
- [SUPABASE_MIGRATIONS_GUIDE.md](SUPABASE_MIGRATIONS_GUIDE.md) - 마이그레이션 실행 방법

### 📖 설정 가이드
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase 푸시 알림 설정

### 📊 프로젝트 문서
- [FINAL_COMPLETION_REPORT.md](FINAL_COMPLETION_REPORT.md) - 최종 완성 보고서
- [PROGRESS_REPORT.md](PROGRESS_REPORT.md) - 진행 상황 보고서

---

## 📦 프로젝트 구조

```
320mag/
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── ui/           # shadcn/ui 컴포넌트
│   │   ├── layout/       # Header, Footer 등
│   │   ├── VoiceRecorder.tsx
│   │   ├── EventRegistrationForm.tsx
│   │   └── NotificationBell.tsx
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── ChallengesPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── ...
│   ├── contexts/         # React Context
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/         # 서비스 레이어
│   │   ├── firebaseService.ts
│   │   ├── emailService.ts
│   │   ├── audioService.ts
│   │   ├── contentPipeline.ts
│   │   └── ...
│   ├── data/             # 정적 데이터
│   │   ├── editors.ts    # 12개 AI 에디터
│   │   └── content-sources.ts
│   └── integrations/     # 외부 통합
│       └── supabase/
├── supabase/
│   ├── migrations/       # SQL 마이그레이션 (7개)
│   └── functions/        # Edge Functions (2개)
├── scripts/              # 자동화 스크립트
│   ├── scheduled-collection.ts
│   ├── collect-fashion.ts
│   └── ...
├── .github/workflows/    # GitHub Actions
│   └── collect-content.yml
└── public/
    ├── firebase-messaging-sw.js
    └── manifest.json
```

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **profiles** - 사용자 프로필
- **articles** - 기사
- **categories** - 카테고리
- **creators** - AI 에디터/작성자
- **events** - 이벤트
- **event_participants** - 이벤트 참가자
- **challenges** - 챌린지
- **challenge_participations** - 챌린지 참여
- **notifications** - 알림
- **email_logs** - 이메일 로그
- **email_preferences** - 이메일 설정
- **comments** - 댓글
- **bookmarks** - 북마크
- **reading_history** - 읽은 기사 히스토리

---

## 🎨 12개 AI 에디터 페르소나

1. **Sophia** (패션) - 파리 출신 패션 에디터
2. **Jane** (뷰티) - 뉴욕 메이크업 아티스트
3. **Martin** (컬처) - 런던 문화 평론가
4. **Clara** (라이프스타일) - 밀라노 라이프스타일 코치
5. **Henry** (시니어시장) - 하버드 경제학자
6. **David** (금융) - 월스트리트 투자 전문가
7. **Naomi** (글로벌트렌드) - 도쿄 트렌드 애널리스트
8. **Antoine** (푸드) - 파리 셰프
9. **Emily** (하우징) - 인테리어 디자이너
10. **Dr. Williams** (의료) - 하버드 메디컬 스쿨 교수
11. **Isabella** (여행) - 세계 여행가
12. **Michael** (테크) - 실리콘밸리 기술 전문가

---

## 🔧 NPM Scripts

```bash
# 개발
npm run dev              # 개발 서버 실행
npm run build            # 프로덕션 빌드
npm run preview          # 빌드 미리보기

# 콘텐츠 수집
npm run collect:fashion        # 패션 카테고리만 수집
npm run collect:scheduled      # 전체 카테고리 수집
npm run collect:all            # 모든 소스에서 수집

# 유틸리티
npm run check:articles         # 기사 확인
npm run update:names           # 작성자 이름 업데이트
```

---

## 🚀 배포

### Vercel 배포
1. GitHub에 push
2. Vercel에서 import
3. 환경 변수 설정
4. Deploy

자세한 내용은 [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) 참고

### GitHub Actions
- **자동 콘텐츠 수집**: 매일 6시, 12시, 18시 (KST)
- **수동 실행**: Actions 탭에서 "Collect Content" 워크플로우 실행

---

## 🧪 테스트

### 로컬 테스트
```bash
npm run dev
```

### 기능 테스트
1. 회원가입/로그인
2. 기사 읽기
3. 이벤트 등록
4. 챌린지 참여 (음성 녹음)
5. 푸시 알림 권한 요청
6. 관리자 페이지 (admin 계정)

### 빌드 테스트
```bash
npm run build
npm run preview
```

---

## 📊 성능

- **Lighthouse Score**: 90+ (목표)
- **Bundle Size**: ~584KB (gzip: 164KB)
- **First Load**: < 3s
- **Time to Interactive**: < 5s

---

## 🔒 보안

- ✅ **Row Level Security** (RLS) - Supabase
- ✅ **HTTPS** - Vercel 자동 SSL
- ✅ **Authentication** - Supabase Auth
- ✅ **Environment Variables** - 민감 정보 보호
- ✅ **CORS** - 적절한 CORS 설정

---

## 🤝 기여

이 프로젝트는 프로덕션 준비 완료 상태입니다.

### 개선 제안
- Issue 생성
- Pull Request 제출
- 피드백 공유

---

## 📄 라이선스

이 프로젝트는 상업용으로 사용 가능합니다.

---

## 📞 지원

### 문제 해결
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - 빠른 시작 가이드
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - 배포 체크리스트
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase 설정

### 연락처
- Email: support@thirdtwenty.com
- GitHub Issues: [Issues](https://github.com/your-username/320mag/issues)

---

## 🎉 완성 현황

- **전체 완성도**: 100% ✅
- **핵심 기능**: 15/15 완료
- **문서화**: 100% 완료
- **테스트**: 빌드 성공
- **배포 준비**: 완료

**프로젝트 완성을 축하합니다!** 🚀

---

**Last Updated**: 2025-01-02
**Version**: 1.0.0
**Status**: Production Ready
