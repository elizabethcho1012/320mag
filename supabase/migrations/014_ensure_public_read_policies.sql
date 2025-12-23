-- Ensure public read access policies exist for all necessary tables
-- This migration ensures that non-authenticated users can read published content

-- =============================================
-- ARTICLES TABLE - Public Read Access
-- =============================================
-- Drop and recreate public read policy to ensure it exists
DROP POLICY IF EXISTS "Articles public read access" ON articles;
DROP POLICY IF EXISTS "articles_public_read" ON articles;

CREATE POLICY "Public users can view published articles"
  ON articles
  FOR SELECT
  USING (status = 'published');

-- =============================================
-- CATEGORIES TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Public users can view categories" ON categories;

CREATE POLICY "Public users can view categories"
  ON categories
  FOR SELECT
  USING (true);

-- =============================================
-- SUBCATEGORIES TABLE - Public Read Access
-- =============================================
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view subcategories" ON subcategories;

CREATE POLICY "Public users can view subcategories"
  ON subcategories
  FOR SELECT
  USING (true);

-- =============================================
-- CREATORS TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "Creators public read access" ON creators;
DROP POLICY IF EXISTS "creators_public_read" ON creators;

CREATE POLICY "Public users can view active creators"
  ON creators
  FOR SELECT
  USING (status = 'active');

-- =============================================
-- EDITORS TABLE - Public Read Access
-- =============================================
ALTER TABLE editors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view active editors" ON editors;

CREATE POLICY "Public users can view active editors"
  ON editors
  FOR SELECT
  USING (status = 'active');

-- =============================================
-- EVENTS TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "Public users can view events" ON events;
DROP POLICY IF EXISTS "Public events are viewable by everyone" ON events;

CREATE POLICY "Public users can view all events"
  ON events
  FOR SELECT
  USING (true);

-- =============================================
-- DAILY NEWS TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "daily_news_public_read" ON daily_news;
DROP POLICY IF EXISTS "Daily news public read access" ON daily_news;

CREATE POLICY "Public users can view published daily news"
  ON daily_news
  FOR SELECT
  USING (status = 'published');

-- =============================================
-- ADVERTISEMENTS TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "Public users can view active advertisements" ON advertisements;
DROP POLICY IF EXISTS "Anyone can view active advertisements" ON advertisements;

CREATE POLICY "Public users can view active advertisements"
  ON advertisements
  FOR SELECT
  USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date >= NOW())
  );

-- =============================================
-- MEDIA TABLE - Public Read Access
-- =============================================
DROP POLICY IF EXISTS "Anyone can view media" ON media;
DROP POLICY IF EXISTS "Public users can view media" ON media;

CREATE POLICY "Public users can view media"
  ON media
  FOR SELECT
  USING (true);

-- =============================================
-- HOMEPAGE SETTINGS TABLE - Public Read Access
-- =============================================
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public users can view homepage settings" ON homepage_settings;

CREATE POLICY "Public users can view homepage settings"
  ON homepage_settings
  FOR SELECT
  USING (true);

-- =============================================
-- ARTICLE LIKES TABLE - Public Read Access
-- =============================================
-- Users can view all likes (for like counts)
DROP POLICY IF EXISTS "Public users can view article likes" ON article_likes;

CREATE POLICY "Public users can view article likes"
  ON article_likes
  FOR SELECT
  USING (true);

-- Summary
-- This migration ensures that all public-facing tables have proper read policies
-- so that non-authenticated users can access published content without issues
