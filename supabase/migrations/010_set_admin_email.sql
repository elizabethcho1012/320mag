-- 관리자 이메일 설정: 3rdtwenty@gmail.com

-- 1. 해당 이메일의 프로필을 관리자로 설정
UPDATE profiles
SET role = 'admin'
WHERE email = '3rdtwenty@gmail.com';

-- 2. 만약 프로필이 없다면 (auth.users에만 있는 경우) 프로필 생성
INSERT INTO profiles (id, email, role, username, created_at, updated_at)
SELECT
  id,
  email,
  'admin' as role,
  COALESCE(raw_user_meta_data->>'username', email) as username,
  created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = '3rdtwenty@gmail.com'
  AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- 3. 확인 쿼리 (실행 후 결과 확인)
-- SELECT id, email, role, username FROM profiles WHERE email = '3rdtwenty@gmail.com';
