-- 광고 시스템 테이블 생성

-- 광고 테이블
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  position TEXT DEFAULT 'top' CHECK (position IN ('top', 'sidebar', 'inline')),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_advertisements_category ON advertisements(category_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON advertisements(start_date, end_date);

-- RLS 정책
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성화된 광고를 볼 수 있음
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements
  FOR SELECT
  USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date >= NOW())
  );

-- 관리자만 광고를 관리할 수 있음
CREATE POLICY "Admins can manage advertisements"
  ON advertisements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_advertisements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_advertisements_updated_at
  BEFORE UPDATE ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_advertisements_updated_at();

-- 샘플 데이터 (선택사항)
-- INSERT INTO advertisements (title, image_url, link_url, position, is_active)
-- VALUES ('샘플 광고', 'https://example.com/ad.jpg', 'https://example.com', 'top', false);
