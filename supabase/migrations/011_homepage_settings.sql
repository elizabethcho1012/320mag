-- 홈페이지 설정 테이블 생성

-- 홈페이지 설정 테이블
CREATE TABLE IF NOT EXISTS homepage_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 슬라이드 설정
  total_slides INTEGER DEFAULT 5 CHECK (total_slides >= 1 AND total_slides <= 20),
  article_slides INTEGER DEFAULT 3 CHECK (article_slides >= 0),
  ad_slides INTEGER DEFAULT 2 CHECK (ad_slides >= 0),

  -- 기사 슬라이드 카테고리 설정 (JSON 배열)
  -- 예: ["fashion", "beauty", "travel"]
  slide_categories JSONB DEFAULT '["fashion", "beauty", "travel"]'::jsonb,

  -- 슬라이드 자동 재생 설정
  autoplay_enabled BOOLEAN DEFAULT true,
  autoplay_interval INTEGER DEFAULT 5000 CHECK (autoplay_interval >= 1000),

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 단일 설정 보장 (하나의 행만 존재)
  CONSTRAINT single_setting CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- RLS 정책
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 홈페이지 설정을 볼 수 있음
CREATE POLICY "Anyone can view homepage settings"
  ON homepage_settings
  FOR SELECT
  USING (true);

-- 관리자만 홈페이지 설정을 수정할 수 있음
CREATE POLICY "Admins can update homepage settings"
  ON homepage_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_homepage_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_homepage_settings_updated_at
  BEFORE UPDATE ON homepage_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_settings_updated_at();

-- 기본 설정 삽입
INSERT INTO homepage_settings (
  id,
  total_slides,
  article_slides,
  ad_slides,
  slide_categories,
  autoplay_enabled,
  autoplay_interval
)
VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  5,
  3,
  2,
  '["fashion", "beauty", "travel"]'::jsonb,
  true,
  5000
)
ON CONFLICT (id) DO NOTHING;
