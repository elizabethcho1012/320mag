-- Articles 테이블에 additional_images 컬럼 추가
-- 원본 기사에서 추출한 여러 이미지를 저장하기 위한 JSONB 배열

-- 1. additional_images 컬럼 추가 (JSONB 타입)
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

-- 2. JSONB 검색 인덱스 추가 (선택사항, 성능 향상)
CREATE INDEX IF NOT EXISTS idx_articles_additional_images
ON public.articles USING GIN (additional_images);

-- 3. 컬럼 설명 추가
COMMENT ON COLUMN public.articles.additional_images IS '원본 기사에서 추출한 추가 이미지 URL 배열 (JSONB)';

-- 4. 확인 쿼리
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'articles'
  AND column_name = 'additional_images';
