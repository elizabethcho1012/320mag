-- 크리에이터 이름 영문 전환 (한 번에 실행)
-- Supabase SQL Editor에서 이 파일 전체를 복사해서 실행하세요

-- 1. UPDATE 권한 정책 추가 (이미 있으면 무시됨)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'creators'
    AND policyname = 'Allow anonymous update creators'
  ) THEN
    CREATE POLICY "Allow anonymous update creators"
    ON creators
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;

-- 2. 크리에이터 이름 업데이트 (한글 → 영문)
UPDATE creators SET name = 'Sophia' WHERE name = '소피아';
UPDATE creators SET name = 'Jane' WHERE name = '제인';
UPDATE creators SET name = 'Martin' WHERE name = '마틴';
UPDATE creators SET name = 'Clara' WHERE name = '클라라';
UPDATE creators SET name = 'Henry' WHERE name = '헨리';
UPDATE creators SET name = 'Marcus' WHERE name = '마커스';
UPDATE creators SET name = 'Antoine' WHERE name = '앙투안';
UPDATE creators SET name = 'Thomas' WHERE name = '토마스';
UPDATE creators SET name = 'Sarah' WHERE name = '닥터 사라';
UPDATE creators SET name = 'Rebecca' WHERE name = '레베카';
UPDATE creators SET name = 'Mark' WHERE name = '마크';
UPDATE creators SET name = 'Elizabeth' WHERE name = '엘리자베스';

-- 3. 결과 확인
SELECT name, profession, specialty FROM creators ORDER BY name;
