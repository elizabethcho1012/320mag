-- 모든 AI 에디터 제거 (영문 + 한글)
-- 실제로 등록 폼을 통해 등록된 크리에이터는 없으므로 모두 삭제

-- 1. 삭제 전 확인
SELECT
  'Total creators before cleanup' as description,
  COUNT(*) as count
FROM public.creators
WHERE status = 'active';

-- 2. 모든 AI 에디터가 작성한 기사의 creator_id를 NULL로 설정
UPDATE public.articles
SET creator_id = NULL
WHERE creator_id IS NOT NULL;

-- 3. 모든 크리에이터 삭제 (실제 등록자가 없으므로)
DELETE FROM public.creators;

-- 4. 삭제 후 확인
SELECT
  'Total creators after cleanup' as description,
  COUNT(*) as count
FROM public.creators;

-- 5. 최종 확인 - 비어있어야 함
SELECT * FROM public.creators;
