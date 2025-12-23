-- Fix RLS policies for admin access to all tables

-- =============================================
-- ADVERTISEMENTS TABLE
-- =============================================
-- Drop existing admin policy and recreate it properly
DROP POLICY IF EXISTS "Admins can manage advertisements" ON advertisements;

-- Admin can view ALL advertisements (not just active ones)
CREATE POLICY "Admins can view all advertisements"
  ON advertisements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert advertisements
CREATE POLICY "Admins can insert advertisements"
  ON advertisements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update advertisements
CREATE POLICY "Admins can update advertisements"
  ON advertisements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete advertisements
CREATE POLICY "Admins can delete advertisements"
  ON advertisements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- EVENTS TABLE
-- =============================================
-- Drop existing admin policy and recreate it properly
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Admin can view all events
CREATE POLICY "Admins can view all events"
  ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert events
CREATE POLICY "Admins can insert events"
  ON events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update events
CREATE POLICY "Admins can update events"
  ON events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete events
CREATE POLICY "Admins can delete events"
  ON events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- CREATORS TABLE
-- =============================================
-- Admin can view all creators (including inactive)
CREATE POLICY "Admins can view all creators"
  ON creators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can insert creators
CREATE POLICY "Admins can insert creators"
  ON creators
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can update creators
CREATE POLICY "Admins can update creators"
  ON creators
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can delete creators
CREATE POLICY "Admins can delete creators"
  ON creators
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- CATEGORIES TABLE
-- =============================================
-- Enable RLS on categories if not already enabled
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  USING (true);

-- Admin can manage categories
CREATE POLICY "Admins can insert categories"
  ON categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- MEDIA TABLE
-- =============================================
-- Enable RLS on media if not already enabled
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Everyone can view media
CREATE POLICY "Anyone can view media"
  ON media
  FOR SELECT
  USING (true);

-- Admin can manage media
CREATE POLICY "Admins can insert media"
  ON media
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update media"
  ON media
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete media"
  ON media
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- ARTICLES TABLE
-- =============================================
-- Admin can view all articles (including drafts)
CREATE POLICY "Admins can view all articles"
  ON articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin can manage articles
CREATE POLICY "Admins can insert articles"
  ON articles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update articles"
  ON articles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete articles"
  ON articles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
