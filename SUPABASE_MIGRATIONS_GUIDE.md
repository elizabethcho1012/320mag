# Supabase 마이그레이션 실행 가이드

**Supabase URL**: https://qitdjfckazpkqhhlacyx.supabase.co

---

## 실행 순서

Supabase Dashboard (https://supabase.com/dashboard/project/qitdjfckazpkqhhlacyx) 접속 후:

**SQL Editor** 탭에서 아래 파일들을 **순서대로** 복사하여 실행하세요.

**중요**: 기본 테이블(articles, categories, creators)은 이미 Supabase에 존재하므로 001번 마이그레이션은 건너뛰고 002번부터 시작합니다.

---

## 1. Profiles (사용자 프로필)

**파일**: `supabase/migrations/002_create_profiles.sql`

**생성되는 것**:
- profiles 테이블
- 자동 프로필 생성 트리거
- RLS 정책

**주의**: Auth 사용자와 profiles가 자동으로 연동됩니다.

---

## 2. Events (이벤트 시스템)

**파일**: `supabase/migrations/003_create_events.sql`

**생성되는 테이블**:
- events
- event_participants

**샘플 데이터**: 3개의 샘플 이벤트가 자동 생성됩니다.

---

## 3. Notifications (알림 시스템)

**파일**: `supabase/migrations/004_add_notifications.sql`

**생성되는 것**:
- notifications 테이블
- profiles에 fcm_token 컬럼 추가
- notification_preferences 컬럼 추가

---

## 4. Challenges (챌린지 시스템)

**파일**: `supabase/migrations/005_create_challenges.sql`

**생성되는 테이블**:
- challenges
- challenge_participations

**Storage Bucket**: voice-recordings (자동 생성)

**샘플 데이터**: 3개의 샘플 챌린지가 자동 생성됩니다.

---

## 5. Event Participants Update (참가자 테이블 업데이트)

**파일**: `supabase/migrations/006_update_event_participants.sql`

**추가되는 컬럼**:
- name, email, phone
- dietary_restrictions
- emergency_contact
- qr_code (자동 생성)

**샘플 데이터**: 5개의 추가 이벤트가 생성됩니다.

---

## 6. Email System (이메일 시스템)

**파일**: `supabase/migrations/007_create_email_system.sql`

**생성되는 테이블**:
- email_logs (발송 로그)
- email_preferences (수신 설정)

---

## ✅ 마이그레이션 완료 확인

모든 마이그레이션 실행 후:

### Table Editor에서 확인:
- [ ] articles
- [ ] categories
- [ ] creators
- [ ] profiles
- [ ] events
- [ ] event_participants
- [ ] challenges
- [ ] challenge_participations
- [ ] notifications
- [ ] email_logs
- [ ] email_preferences

### Storage에서 확인:
- [ ] voice-recordings 버킷

---

## 🔐 관리자 계정 생성

### 1. Authentication 탭에서 사용자 생성:
- Email: `admin@thirdtwenty.com` (또는 원하는 이메일)
- Password: 안전한 비밀번호
- "Auto Confirm User" 체크

### 2. SQL Editor에서 관리자 권한 부여:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@thirdtwenty.com';
```

**주의**: 이메일을 실제 생성한 이메일로 변경하세요!

---

## 🧪 테스트

### 로컬 테스트:
```bash
npm run dev
```

브라우저에서:
1. http://localhost:5173 접속
2. 회원가입 시도
3. profiles 테이블에 자동 생성 확인
4. admin 계정으로 로그인
5. 햄버거 메뉴 > "관리자 페이지" 확인

---

## 🚨 문제 해결

### "relation does not exist" 에러:
- 이전 마이그레이션이 실행되지 않았을 수 있음
- 순서대로 다시 실행

### "permission denied" 에러:
- RLS 정책 문제
- SQL Editor에서 해당 마이그레이션 다시 실행

### profiles 자동 생성 안됨:
```sql
-- 트리거 확인
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 수동 생성
INSERT INTO profiles (id, email, username, role)
VALUES (
  'user-uuid-here',
  'email@example.com',
  'username',
  'member'
);
```

---

## 📞 지원

문제가 있을 경우:
1. Supabase Dashboard > Logs 확인
2. Browser Console 확인
3. `SUPABASE_SETUP.md` 문서 참고

**완료 날짜**: 2025-01-02
