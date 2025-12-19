-- Creators 테이블에서 AI 에디터 제거
-- (이미 editors 테이블로 마이그레이션 완료)

-- 1. 삭제 전 확인
SELECT
  'AI editors to be deleted from creators' as description,
  COUNT(*) as count
FROM public.creators
WHERE name IN (
  'Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus',
  'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'
);

-- 2. AI 에디터가 작성한 기사의 creator_id를 NULL로 설정
-- (이미 editor_id가 설정되어 있으므로 creator_id는 불필요)
UPDATE public.articles
SET creator_id = NULL
WHERE creator_id IN (
  SELECT id FROM public.creators
  WHERE name IN (
    'Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus',
    'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'
  )
);

-- 3. AI 에디터 삭제
DELETE FROM public.creators
WHERE name IN (
  'Sophia', 'Jane', 'Martin', 'Clara', 'Henry', 'Marcus',
  'Antoine', 'Thomas', 'Sarah', 'Rebecca', 'Mark', 'Elizabeth'
);

-- 3. 삭제 후 확인
SELECT
  'Remaining creators' as description,
  COUNT(*) as count
FROM public.creators
WHERE status = 'active';

-- 4. 최종 결과 확인
SELECT
  id,
  name,
  profession,
  verified,
  status,
  created_at
FROM public.creators
WHERE status = 'active'
ORDER BY created_at DESC;
