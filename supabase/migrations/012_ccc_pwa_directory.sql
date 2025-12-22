-- CCC PWA Directory Integration - Database Schema
-- Adds PWA directory functionality to 320mag

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for CCC
CREATE TYPE validation_status AS ENUM ('pending', 'validating', 'approved', 'rejected');
CREATE TYPE app_status AS ENUM ('active', 'hidden', 'removed');
CREATE TYPE pricing_type AS ENUM ('free', 'freemium', 'paid', 'subscription');
CREATE TYPE report_reason AS ENUM ('broken', 'inappropriate', 'spam', 'misleading', 'other');

-- Categories table for PWA apps
CREATE TABLE pwa_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  app_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PWA Apps table
CREATE TABLE pwa_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  pricing pricing_type DEFAULT 'free',
  price NUMERIC(10, 2),
  target_audience TEXT,
  developer JSONB NOT NULL,
  screenshots TEXT[] DEFAULT '{}',
  icon TEXT,
  download_count INTEGER DEFAULT 0,
  report_count INTEGER DEFAULT 0,
  reported_by TEXT[] DEFAULT '{}',
  lighthouse_score JSONB,
  validation_status validation_status DEFAULT 'pending',
  status app_status DEFAULT 'active',
  is_hidden BOOLEAN DEFAULT FALSE,
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Reports table for PWA apps
CREATE TABLE pwa_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES pwa_apps(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  reason report_reason NOT NULL,
  comment TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Downloads table for PWA apps
CREATE TABLE pwa_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id UUID REFERENCES pwa_apps(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pwa_apps_submitted_by ON pwa_apps(submitted_by);
CREATE INDEX idx_pwa_apps_status ON pwa_apps(status);
CREATE INDEX idx_pwa_apps_category ON pwa_apps(category);
CREATE INDEX idx_pwa_apps_validation_status ON pwa_apps(validation_status);
CREATE INDEX idx_pwa_apps_created_at ON pwa_apps(created_at DESC);
CREATE INDEX idx_pwa_apps_download_count ON pwa_apps(download_count DESC);
CREATE INDEX idx_pwa_apps_status_hidden_created ON pwa_apps(status, is_hidden, created_at DESC);
CREATE INDEX idx_pwa_apps_status_hidden_downloads ON pwa_apps(status, is_hidden, download_count DESC);
CREATE INDEX idx_pwa_reports_app_id ON pwa_reports(app_id);
CREATE INDEX idx_pwa_reports_user_id ON pwa_reports(user_id);
CREATE INDEX idx_pwa_downloads_app_id ON pwa_downloads(app_id);
CREATE INDEX idx_pwa_downloads_session_id ON pwa_downloads(session_id);
CREATE INDEX idx_pwa_downloads_created_at ON pwa_downloads(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pwa_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pwa_apps_updated_at
  BEFORE UPDATE ON pwa_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_pwa_apps_updated_at();

-- Function to auto-hide apps when report_count >= 5
CREATE OR REPLACE FUNCTION auto_hide_reported_pwa_apps()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_count >= 5 AND NEW.is_hidden = FALSE THEN
    NEW.is_hidden = TRUE;
    NEW.status = 'hidden';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-hiding
CREATE TRIGGER trigger_auto_hide_pwa_apps
  BEFORE UPDATE ON pwa_apps
  FOR EACH ROW
  WHEN (OLD.report_count IS DISTINCT FROM NEW.report_count)
  EXECUTE FUNCTION auto_hide_reported_pwa_apps();

-- Function to increment download count (prevents duplicates within 24h)
CREATE OR REPLACE FUNCTION track_pwa_download(
  p_app_id UUID,
  p_session_id TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_recent_download BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pwa_downloads
    WHERE app_id = p_app_id
      AND session_id = p_session_id
      AND created_at > NOW() - INTERVAL '24 hours'
  ) INTO v_recent_download;

  IF NOT v_recent_download THEN
    INSERT INTO pwa_downloads (app_id, session_id, user_agent)
    VALUES (p_app_id, p_session_id, p_user_agent);

    UPDATE pwa_apps
    SET download_count = download_count + 1
    WHERE id = p_app_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to submit a report (prevents duplicates)
CREATE OR REPLACE FUNCTION submit_pwa_report(
  p_app_id UUID,
  p_user_id TEXT,
  p_reason report_reason,
  p_comment TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_reported BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pwa_reports
    WHERE app_id = p_app_id AND user_id = p_user_id
  ) INTO v_already_reported;

  IF NOT v_already_reported THEN
    INSERT INTO pwa_reports (app_id, user_id, reason, comment, ip_hash)
    VALUES (p_app_id, p_user_id, p_reason, p_comment, p_ip_hash);

    UPDATE pwa_apps
    SET
      report_count = report_count + 1,
      reported_by = array_append(reported_by, p_user_id)
    WHERE id = p_app_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE pwa_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for approved apps
CREATE POLICY "Public can view approved pwa apps"
  ON pwa_apps FOR SELECT
  USING (status = 'active' AND validation_status = 'approved' AND is_hidden = FALSE);

-- Users can view their own apps regardless of status
CREATE POLICY "Users can view own pwa apps"
  ON pwa_apps FOR SELECT
  USING (auth.uid() = submitted_by);

-- Authenticated users can insert apps
CREATE POLICY "Authenticated users can submit pwa apps"
  ON pwa_apps FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

-- Users can update their own apps
CREATE POLICY "Users can update own pwa apps"
  ON pwa_apps FOR UPDATE
  USING (auth.uid() = submitted_by);

-- Public can view categories
CREATE POLICY "Public can view pwa categories"
  ON pwa_categories FOR SELECT
  TO public
  USING (true);

-- Public can insert downloads (for tracking)
CREATE POLICY "Public can track pwa downloads"
  ON pwa_downloads FOR INSERT
  TO public
  WITH CHECK (true);

-- Public can submit reports
CREATE POLICY "Public can submit pwa reports"
  ON pwa_reports FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default categories
INSERT INTO pwa_categories (name, description, icon, "order") VALUES
  ('Productivity', 'Tools to help you get work done', '📊', 1),
  ('Games', 'Fun and entertainment', '🎮', 2),
  ('Social', 'Connect with others', '👥', 3),
  ('Shopping', 'E-commerce and marketplaces', '🛍️', 4),
  ('Education', 'Learning and teaching tools', '📚', 5),
  ('Entertainment', 'Movies, music, and media', '🎬', 6),
  ('Utilities', 'Helpful tools and utilities', '🔧', 7),
  ('Business', 'Business and finance apps', '💼', 8),
  ('Health', 'Health and fitness tracking', '💪', 9),
  ('Travel', 'Travel planning and guides', '✈️', 10);

-- Create a view for public app listings with stats
CREATE OR REPLACE VIEW public_pwa_apps AS
SELECT
  id,
  name,
  description,
  url,
  category,
  categories,
  pricing,
  price,
  target_audience,
  developer,
  screenshots,
  icon,
  download_count,
  lighthouse_score,
  validation_status,
  status,
  created_at,
  published_at
FROM pwa_apps
WHERE status = 'active'
  AND validation_status = 'approved'
  AND is_hidden = FALSE;
