# Supabase Auth 설정 가이드

## 1. Profiles 테이블 생성

Supabase Dashboard에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
-- profiles 테이블 생성 (Supabase Auth 연동)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('guest', 'member', 'subscriber', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 프로필 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- 정책: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 정책: 인증된 사용자는 프로필 생성 가능
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 새 사용자 가입 시 자동으로 프로필 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 연결
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 관리자 역할 설정을 위한 함수
CREATE OR REPLACE FUNCTION set_user_role(user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET role = new_role WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 2. 이메일 인증 설정

Supabase Dashboard > Authentication > Email Templates에서:
- **Confirm signup** 템플릿을 한국어로 수정 (선택사항)
- **Email Confirmation** 설정 확인

## 3. 관리자 계정 생성

### 방법 1: Supabase Dashboard에서 생성
1. Authentication > Users > Add user
2. 이메일과 비밀번호 입력
3. User created 후 SQL Editor에서 실행:
   ```sql
   SELECT set_user_role('사용자UUID', 'admin');
   ```

### 방법 2: 앱에서 회원가입 후 SQL로 업그레이드
1. 앱에서 일반 회원가입
2. SQL Editor에서 실행:
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```

## 4. 테스트 계정 생성 (개발용)

```sql
-- 테스트 계정 역할 설정 예시
UPDATE profiles SET role = 'subscriber' WHERE email = 'premium@example.com';
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

## 5. 인증 플로우

### 회원가입
1. 사용자가 이메일/비밀번호/사용자명 입력
2. Supabase Auth에 회원가입 요청
3. `handle_new_user()` 트리거가 자동으로 profiles 레코드 생성
4. 이메일 인증 링크 발송 (Supabase 설정에 따라)
5. 사용자가 이메일 인증 클릭하면 계정 활성화

### 로그인
1. 이메일/비밀번호로 로그인
2. Supabase Auth가 세션 생성
3. AuthContext가 session을 localStorage에 저장
4. profiles 테이블에서 사용자 프로필 조회
5. 로그인 완료

### 세션 유지
- localStorage에 세션 저장 (자동)
- 페이지 새로고침 시 세션 복원
- 토큰 자동 갱신

## 6. 환경 변수 확인

`.env` 파일에 다음 값이 설정되어 있는지 확인:
```
VITE_SUPABASE_URL=https://qitdjfckazpkqhhlacyx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 7. 기능 확인 체크리스트

- [ ] Profiles 테이블 생성 완료
- [ ] RLS 정책 적용 완료
- [ ] 트리거 생성 완료
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 로그아웃 테스트
- [ ] 페이지 새로고침 후 세션 유지 확인
- [ ] 관리자 계정 생성 및 권한 확인
- [ ] Admin 페이지 접근 제어 확인

## 8. 문제 해결

### "User already registered" 오류
- 이미 등록된 이메일입니다. 다른 이메일을 사용하세요.

### 로그인 후 페이지 새로고침하면 로그아웃됨
- AuthContext의 localStorage 설정 확인
- Supabase client 설정에서 `persistSession: true` 확인

### Profile이 자동 생성되지 않음
- `handle_new_user()` 함수와 트리거가 올바르게 생성되었는지 확인
- SQL Editor에서 트리거 상태 확인:
  ```sql
  SELECT * FROM information_schema.triggers
  WHERE trigger_name = 'on_auth_user_created';
  ```

### 관리자 페이지 접근 불가
- 해당 계정의 role이 'admin'인지 확인:
  ```sql
  SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
  ```
