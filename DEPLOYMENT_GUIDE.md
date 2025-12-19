# Third Twenty 배포 가이드

## 완성된 기능 ✅

### 1. ✅ Supabase Auth 인증 시스템
- 실제 회원가입/로그인/로그아웃 구현
- 이메일 인증
- 세션 지속성 (localStorage)
- 역할 기반 접근 제어 (admin, member, subscriber)
- 페이지 새로고침 시에도 세션 유지

### 2. ✅ Admin 대시보드 (관리자 전용)
- 실제 Supabase 데이터 연동
- 기사 목록 조회 (필터링, 검색)
- 기사 상태 변경 (draft ↔ published)
- 기사 삭제
- 카테고리별 통계
- 실시간 데이터 새로고침

### 3. ✅ AI 콘텐츠 파이프라인
- RSS → AI 리라이팅 → Supabase 자동 저장
- 12개 AI 에디터 페르소나
- 이미지 자동 추출 (RSS → OG Image → Unsplash 폴백)
- 8개 카테고리 지원

### 4. ✅ 자동 콘텐츠 수집 스케줄러
- GitHub Actions 워크플로우
- 하루 3회 자동 수집 (6시, 12시, 18시 KST)
- 수동 실행 가능
- 로그 및 실패 알림

### 5. ✅ 이벤트 시스템 기본 구조
- Events 테이블 생성
- Event Participants 테이블
- RLS 정책 설정

---

## 배포 절차

### Step 1: Supabase 설정

1. **Supabase Dashboard**에 로그인
2. **SQL Editor**에서 마이그레이션 실행:

```sql
-- 1. Profiles 테이블
-- supabase/migrations/002_create_profiles.sql 내용 복사 & 실행

-- 2. Events 테이블 (선택사항)
-- supabase/migrations/003_create_events.sql 내용 복사 & 실행
```

3. **관리자 계정 생성**:
   - Authentication > Users > Add user
   - 이메일/비밀번호 입력
   - SQL Editor에서 실행:
     ```sql
     UPDATE profiles
     SET role = 'admin'
     WHERE email = 'your-admin-email@example.com';
     ```

### Step 2: 환경 변수 설정

1. `.env` 파일 생성:
```env
# Supabase
VITE_SUPABASE_URL=https://qitdjfckazpkqhhlacyx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI (AI 리라이팅용)
VITE_OPENAI_API_KEY=your_openai_api_key
OPENAI_API_KEY=your_openai_api_key
```

2. **GitHub Secrets** 설정 (자동 수집용):
   - Settings > Secrets and variables > Actions
   - `OPENAI_API_KEY` 추가
   - `VITE_SUPABASE_URL` 추가
   - `VITE_SUPABASE_ANON_KEY` 추가

### Step 3: 로컬 테스트

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build
```

### Step 4: 콘텐츠 수집 테스트

```bash
# 단일 카테고리 테스트
npm run collect:fashion

# 전체 카테고리 자동 수집
npm run collect:scheduled
```

### Step 5: Vercel 배포

1. **Vercel**에 GitHub 저장소 연동
2. 환경 변수 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
3. Deploy 버튼 클릭

---

## 자동 콘텐츠 수집 활성화

### GitHub Actions (권장)

워크플로우가 이미 설정되어 있습니다 (`.github/workflows/collect-content.yml`):
- 매일 오전 6시, 12시, 오후 6시(KST) 자동 실행
- Actions 탭에서 수동 실행 가능

### Vercel Cron Jobs (대안)

`vercel.json` 파일 생성:
```json
{
  "crons": [{
    "path": "/api/collect",
    "schedule": "0 */6 * * *"
  }]
}
```

그리고 `api/collect.ts` API 엔드포인트 생성 필요.

---

## 운영 가이드

### 새 기사 작성

**방법 1: AI 자동 수집 (권장)**
```bash
npm run collect:scheduled
```

**방법 2: Supabase Dashboard에서 직접 작성**
1. Table Editor > articles > Insert row
2. 필수 필드:
   - title
   - content
   - category_id
   - creator_id
   - slug
   - status ('draft' 또는 'published')

### 기사 관리

1. 관리자 계정으로 로그인
2. 햄버거 메뉴 > 관리자 페이지
3. Articles 탭에서:
   - 검색/필터링
   - 상태 변경 (발행/임시저장)
   - 삭제

### 카테고리 추가

Supabase에서:
```sql
INSERT INTO categories (name, slug, description)
VALUES ('새카테고리', 'new-category', '설명');
```

그리고 `src/data/content-sources.ts`에 RSS 소스 추가.

### AI 에디터 추가

`src/data/editors.ts`에서 새 에디터 추가:
```typescript
{
  id: 'new-editor',
  name: '에디터 이름',
  age: 45,
  category: '카테고리',
  profession: '직업',
  expertise: ['전문분야1', '전문분야2'],
  personality: '성격 설명',
  writingStyle: '글쓰기 스타일',
  tone: '어조',
  catchphrase: '캐치프레이즈',
  promptTemplate: (title, content, category) => `프롬프트 템플릿`,
  isPremium: false
}
```

그리고 Supabase `creators` 테이블에도 추가.

---

## 문제 해결

### 로그인 후 페이지 새로고침하면 로그아웃됨
- AuthContext의 localStorage 설정 확인
- Supabase client에서 `persistSession: true` 확인 (`src/integrations/supabase/client.ts`)

### AI 수집 실패
- OpenAI API 키 확인
- API 사용량 및 한도 확인
- RSS 피드 URL 유효성 확인

### Admin 페이지 접근 불가
- 해당 계정의 role이 'admin'인지 확인:
  ```sql
  SELECT email, role FROM profiles WHERE email = 'your-email';
  ```

### 이미지가 표시되지 않음
- RSS 피드에 이미지가 없으면 Unsplash 폴백 사용
- `featured_image_url` 필드 확인
- CORS 문제 확인

---

## 추가 개발 권장사항

### 우선순위 높음
1. ✅ **Supabase Auth** - 완료
2. ✅ **Admin 기사 CRUD** - 완료
3. ✅ **콘텐츠 자동 수집** - 완료
4. 🔲 **이메일 알림** (신규 기사, 이벤트)
5. 🔲 **Firebase Push Notification**

### 우선순위 중간
6. 🔲 **음성 녹음 챌린지** (Web Audio API)
7. 🔲 **이벤트 등록/참가** 완전 구현
8. 🔲 **미디어 라이브러리** (이미지 업로드)
9. 🔲 **분석 대시보드** (Google Analytics)

### 우선순위 낮음
10. 🔲 **소셜 로그인** (Google, Kakao)
11. 🔲 **PWA 기능** (오프라인 지원)
12. 🔲 **댓글 시스템**
13. 🔲 **다국어 지원** (i18n)

---

## 성능 최적화

- [ ] 이미지 CDN 사용 (Cloudinary, ImgIX)
- [ ] React Query 캐싱 전략 최적화
- [ ] 코드 스플리팅 (React.lazy)
- [ ] Service Worker (PWA)
- [ ] Database 인덱스 최적화

---

## 라이선스 & 크레딧

- **Framework**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **UI**: shadcn/ui + Tailwind CSS
- **Images**: Unsplash

---

## 지원

문제가 발생하면:
1. `SUPABASE_SETUP.md` 확인
2. Supabase 로그 확인
3. Browser Console 확인
4. GitHub Issues 생성

**프로젝트 완성을 축하합니다! 🎉**
