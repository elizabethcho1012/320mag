-- Articles 테이블에 대한 RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'articles';

-- 익명 사용자도 articles를 삽입할 수 있도록 정책 추가
-- (개발 단계에서만 사용, 프로덕션에서는 인증된 사용자만 허용하도록 수정 필요)

-- 기존 INSERT 정책이 있다면 삭제
DROP POLICY IF EXISTS "Allow anonymous insert" ON articles;

-- 새로운 INSERT 정책 생성 (개발용 - 모든 사용자 허용)
CREATE POLICY "Allow anonymous insert"
ON articles
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 기존 SELECT 정책 확인 및 수정 (읽기도 허용)
DROP POLICY IF EXISTS "Allow public read" ON articles;

CREATE POLICY "Allow public read"
ON articles
FOR SELECT
TO anon, authenticated, public
USING (true);

-- 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'articles';
