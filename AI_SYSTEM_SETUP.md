# 써드트웬티 AI 에디터 시스템 설정 가이드

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [필수 환경 설정](#필수-환경-설정)
3. [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
4. [AI 시스템 작동 방식](#ai-시스템-작동-방식)
5. [테스트 및 배포](#테스트-및-배포)

---

## 프로젝트 개요

써드트웬티는 50-60대 시니어를 위한 AI 자동화 매거진 플랫폼입니다.

### 핵심 기능
✅ **10명의 AI 에디터**: 각각 고유한 페르소나로 콘텐츠 리라이팅
✅ **자동 콘텐츠 수집**: RSS/API를 통한 글로벌 소식 수집
✅ **AI 이미지 생성**: DALL-E 3로 메인 이미지 자동 생성
✅ **챌린지 시스템**: 음성/텍스트로 참여 가능한 커뮤니티
✅ **푸시 알림**: Firebase FCM 기반 개인화 알림

---

## 필수 환경 설정

### 1. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/)에 가입
2. API Keys 메뉴에서 새 키 생성
3. `.env` 파일에 키 입력:

```bash
VITE_OPENAI_API_KEY="sk-your-actual-openai-api-key-here"
```

**필요한 모델:**
- GPT-4 Turbo (콘텐츠 리라이팅)
- DALL-E 3 (이미지 생성)
- Whisper-1 (음성 → 텍스트 변환)

**예상 비용 (한달 기준):**
- GPT-4: 콘텐츠당 $0.03-0.05 → 월 300개 = ~$12
- DALL-E 3: 이미지당 $0.04 → 월 300개 = ~$12
- Whisper: 음성 분당 $0.006 → 월 1000분 = ~$6
- **총 예상: ~$30/월**

### 2. Firebase 설정 (푸시 알림)

#### 2-1. Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: "third-twenty" (또는 원하는 이름)
4. Google Analytics 활성화 (선택사항)

#### 2-2. 웹 앱 추가
1. 프로젝트 설정 → 일반 탭
2. "앱 추가" → 웹 앱 선택
3. 앱 닉네임: "Third Twenty Magazine"
4. 설정 정보를 `.env`에 복사:

```bash
VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

#### 2-3. Cloud Messaging 설정
1. 프로젝트 설정 → Cloud Messaging 탭
2. "웹 푸시 인증서" 생성
3. VAPID 키를 `.env`에 추가:

```bash
VITE_FIREBASE_VAPID_KEY="your-vapid-key"
```

4. `public/firebase-messaging-sw.js` 파일의 Firebase 설정도 업데이트

### 3. Supabase 설정

이미 Supabase 프로젝트가 설정되어 있지만, 추가 확인사항:

1. Storage 버킷 생성:
   - `voice-challenges`: 음성 파일 저장용
   - 공개 접근 허용 (Public bucket)

2. RLS 정책 확인:
   - SQL 마이그레이션 파일 실행 필요

---

## 데이터베이스 마이그레이션

### Supabase 마이그레이션 실행

```bash
# Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# 로컬에서 Supabase 초기화
supabase init

# Supabase 프로젝트 연결
supabase link --project-ref qitdjfckazpkqhhlacyx

# 마이그레이션 실행
supabase db push
```

또는 Supabase Dashboard에서 직접 실행:

1. SQL Editor 열기
2. `supabase/migrations/20250923000000_ai_editor_system.sql` 내용 복사
3. 실행 (Run)

### AI 에디터 데이터 초기화

```sql
-- 10명의 AI 에디터 데이터 삽입
-- (이 부분은 별도로 실행하거나 앱 시작시 자동 초기화)
```

---

## AI 시스템 작동 방식

### 1. 일일 콘텐츠 자동 수집 및 발행

```typescript
import { runDailyContentPipeline } from '@/services/contentCollector';
import { getActiveSources } from '@/data/content-sources';

// 매일 오전 6시 실행 (cron job 또는 Vercel Cron)
async function dailyJob() {
  const sources = getActiveSources();
  await runDailyContentPipeline(sources);
}
```

**프로세스:**
1. 각 카테고리별 RSS/API에서 최신 소식 수집
2. 원본 콘텐츠를 `raw_content_cache` 테이블에 저장
3. AI 에디터별로 콘텐츠 리라이팅 (GPT-4)
4. DALL-E 3로 메인 이미지 생성
5. 챌린지 질문 자동 생성
6. `articles` 테이블에 발행
7. 구독자들에게 푸시 알림 발송

### 2. 푸시 알림 스케줄

```
08:00 - 소피아 (패션)
10:00 - 제인 (뷰티)
12:00 - 마틴 (컬처)
14:00 - 클라라 (라이프스타일)
16:00 - 헨리 (시니어시장)
18:00 - 데이비드 (금융)
20:00 - 나오미 (글로벌트렌드)
08:00 - 앙투안 (푸드)
10:00 - 에밀리 (하우징)
14:00 - 닥터 리 (의료)
```

2시간 간격으로 분산 발송하여 사용자 피로도 최소화.

### 3. 챌린지 시스템

사용자가 아티클을 읽고 챌린지 질문에 답변:

**텍스트 모드:**
- 직접 타이핑 (최대 1000자)
- 즉시 발행

**음성 모드:**
1. 브라우저에서 음성 녹음 (최대 3분)
2. Whisper API로 텍스트 변환
3. 사용자가 텍스트 확인/수정
4. 음성 파일 + 텍스트 함께 저장
5. 다른 사용자들은 음성 재생 가능

**레벨 시스템:**
- 🌱 새싹 (0-10개)
- 🌿 성장 (11-30개)
- 🌳 나무 (31-100개)
- 🏅 전문가 (101-300개)
- 👑 마스터 (301+)

---

## 테스트 및 배포

### 로컬 개발 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 환경 변수 체크리스트

`.env` 파일이 다음 항목을 모두 포함하는지 확인:

- [x] `VITE_SUPABASE_URL`
- [x] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_OPENAI_API_KEY` ← **반드시 설정!**
- [ ] `VITE_FIREBASE_API_KEY` ← **반드시 설정!**
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_FIREBASE_VAPID_KEY`

### 테스트 시나리오

#### 1. AI 콘텐츠 생성 테스트

```typescript
// 수동으로 하나의 콘텐츠 처리 테스트
import { processAndPublishContent } from '@/services/contentCollector';

const testRawContent = {
  id: 'test-id',
  title: '파리 패션위크 2024',
  content: '최신 패션 트렌드...',
  category: '패션',
  // ... 기타 필드
};

await processAndPublishContent(testRawContent);
```

#### 2. 음성 녹음 테스트

1. 개발 서버 실행
2. 아티클 상세 페이지 접속
3. 챌린지 참여 → 음성 녹음 선택
4. 녹음 → 중지 → 텍스트 변환
5. 변환된 텍스트 확인
6. 제출

#### 3. 푸시 알림 테스트

```typescript
import { sendPushNotification } from '@/services/pushNotificationService';

await sendPushNotification({
  userId: 'test-user-id',
  title: '테스트 알림',
  body: '푸시 알림이 제대로 작동하는지 확인',
});
```

### 배포 (Vercel)

```bash
# Vercel에 배포
vercel

# 환경 변수는 Vercel Dashboard에서 설정:
# Settings → Environment Variables
```

**주의사항:**
- `.env` 파일의 모든 변수를 Vercel에도 추가
- Production, Preview, Development 모두 동일하게 설정

### Cron Job 설정 (자동 콘텐츠 수집)

Vercel의 Cron Job 기능 사용:

`vercel.json` 생성:

```json
{
  "crons": [
    {
      "path": "/api/daily-content",
      "schedule": "0 6 * * *"
    }
  ]
}
```

`/api/daily-content.ts` 생성:

```typescript
import { runDailyContentPipeline } from '@/services/contentCollector';
import { getActiveSources } from '@/data/content-sources';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sources = getActiveSources();
  await runDailyContentPipeline(sources);

  res.status(200).json({ success: true });
}
```

---

## 📊 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                     CONTENT PIPELINE                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. RSS/API Sources                                      │
│     ↓                                                    │
│  2. Raw Content Cache (Supabase)                         │
│     ↓                                                    │
│  3. AI Rewriting (GPT-4 + Editor Persona)                │
│     ↓                                                    │
│  4. Image Generation (DALL-E 3)                          │
│     ↓                                                    │
│  5. Challenge Question (GPT-4)                           │
│     ↓                                                    │
│  6. Publish to Articles Table                            │
│     ↓                                                    │
│  7. Push Notifications (Firebase FCM)                    │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   CHALLENGE SYSTEM                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User reads article                                      │
│     ↓                                                    │
│  Sees challenge question                                 │
│     ↓                                                    │
│  ┌───────────┐           ┌───────────┐                  │
│  │   TEXT    │    OR     │   VOICE   │                  │
│  │  (직접입력) │           │  (녹음+변환) │                  │
│  └───────────┘           └───────────┘                  │
│     ↓                         ↓                          │
│     └─────────┬───────────────┘                          │
│               ↓                                          │
│       Save to Challenges Table                           │
│               ↓                                          │
│       Update User Level                                  │
│               ↓                                          │
│       Show in Community Feed                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 다음 단계

Phase 1이 완료되었습니다! 다음은 Phase 2 작업입니다:

### Phase 2: 실제 데이터 통합
1. [ ] OpenAI API 키 설정 및 테스트
2. [ ] Firebase 프로젝트 생성 및 연동
3. [ ] Supabase 마이그레이션 실행
4. [ ] 10명 에디터 데이터 초기화
5. [ ] 콘텐츠 소스 1개로 파일럿 테스트
6. [ ] 음성 녹음 실제 테스트
7. [ ] 푸시 알림 실제 발송 테스트

### Phase 3: UI 개선
1. [ ] 에디터 프로필 페이지
2. [ ] 챌린지 피드 페이지
3. [ ] 사용자 프로필 및 레벨 표시
4. [ ] 알림 설정 페이지
5. [ ] 관리자 대시보드

---

## 💡 추가 최적화 아이디어

1. **콘텐츠 퀄리티 필터링**: AI가 저품질 콘텐츠 자동 필터링
2. **개인화 추천**: 사용자 읽기 패턴 기반 에디터 추천
3. **주간 다이제스트**: 인기 아티클 모음 이메일
4. **오프라인 이벤트 연동**: 온라인 커뮤니티 → 오프라인 모임
5. **크리에이터 프로그램**: 실제 시니어 크리에이터 초대

---

**문의사항이 있으시면 이슈를 남겨주세요!**
