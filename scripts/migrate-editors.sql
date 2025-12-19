-- 모든 AI 에디터들을 creators 테이블에서 editors 테이블로 마이그레이션
-- (영문 이름 + 한글 이름 모두 포함)

-- 1. 모든 AI 에디터를 editors 테이블로 복사
DO $$
DECLARE
  editor_record RECORD;
BEGIN
  -- 2. 모든 크리에이터를 editors 테이블로 복사 (모두 AI 에디터이므로)
  FOR editor_record IN
    SELECT * FROM public.creators
    WHERE status = 'active'
  LOOP
    -- Editors 테이블에 삽입 (중복 방지)
    INSERT INTO public.editors (id, name, profession, bio, image_url, verified, status, created_at, updated_at)
    VALUES (
      editor_record.id,
      editor_record.name,
      editor_record.profession,
      editor_record.bio,
      editor_record.image_url,
      editor_record.verified,
      editor_record.status,
      editor_record.created_at,
      editor_record.updated_at
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Migrated editor: % (ID: %)', editor_record.name, editor_record.id;
  END LOOP;

  RAISE NOTICE 'Migration completed!';
END $$;

-- 3. 마이그레이션 확인
SELECT
  'Total creators (before cleanup)' as description,
  COUNT(*) as count
FROM public.creators

UNION ALL

SELECT
  'Total editors (after migration)' as description,
  COUNT(*) as count
FROM public.editors;
