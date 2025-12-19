-- Articles 테이블에 editor_id 컬럼 추가

-- 1. editor_id 컬럼 추가
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS editor_id UUID;

-- 2. editor_id에 외래 키 제약 조건 추가
ALTER TABLE public.articles
ADD CONSTRAINT fk_articles_editor
FOREIGN KEY (editor_id)
REFERENCES public.editors(id)
ON DELETE SET NULL;

-- 3. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_articles_editor_id ON public.articles(editor_id);

-- 4. 기존 creator_id를 editor_id로 복사 (AI 에디터인 경우만)
DO $$
DECLARE
  ai_editor_ids UUID[];
BEGIN
  -- AI 에디터 ID 목록 가져오기
  SELECT ARRAY_AGG(id) INTO ai_editor_ids
  FROM public.editors;

  -- creator_id가 AI 에디터인 기사들의 editor_id 업데이트
  UPDATE public.articles
  SET editor_id = creator_id
  WHERE creator_id = ANY(ai_editor_ids);

  RAISE NOTICE 'Updated % articles with editor_id',
    (SELECT COUNT(*) FROM public.articles WHERE editor_id IS NOT NULL);
END $$;

-- 5. 확인
SELECT
  'Articles with editor_id' as description,
  COUNT(*) as count
FROM public.articles
WHERE editor_id IS NOT NULL

UNION ALL

SELECT
  'Articles with creator_id (AI editors)' as description,
  COUNT(*) as count
FROM public.articles a
WHERE EXISTS (
  SELECT 1 FROM public.editors e
  WHERE e.id = a.creator_id
);

COMMENT ON COLUMN public.articles.editor_id IS '기사를 작성한 에디터 ID (editors 테이블 참조)';
