-- Editors 테이블 생성 (기사를 작성하는 에디터들)
CREATE TABLE IF NOT EXISTS public.editors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  profession TEXT,
  bio TEXT,
  image_url TEXT,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Editors 테이블에 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_editors_status ON public.editors(status);
CREATE INDEX IF NOT EXISTS idx_editors_name ON public.editors(name);

-- Updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_editors_updated_at
  BEFORE UPDATE ON public.editors
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS (Row Level Security) 활성화
ALTER TABLE public.editors ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 설정
CREATE POLICY "Editors are viewable by everyone"
  ON public.editors
  FOR SELECT
  USING (true);

-- 인증된 사용자만 삽입 가능 (관리자용)
CREATE POLICY "Editors can be inserted by authenticated users"
  ON public.editors
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 업데이트 가능 (관리자용)
CREATE POLICY "Editors can be updated by authenticated users"
  ON public.editors
  FOR UPDATE
  USING (auth.role() = 'authenticated');

COMMENT ON TABLE public.editors IS '기사를 작성하는 에디터 정보 (AI 가상 에디터 포함)';
