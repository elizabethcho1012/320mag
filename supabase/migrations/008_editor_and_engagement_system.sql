-- Migration: Editor Application and Engagement System
-- Purpose: Add editor applications, article likes, and enhanced user roles

-- 1. Update profiles table to add editor role and creator/editor flags
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_editor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS editor_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS editor_approved_by UUID REFERENCES profiles(id);

-- Add index for editor queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_editor ON profiles(is_editor) WHERE is_editor = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_is_creator ON profiles(is_creator) WHERE is_creator = TRUE;

-- 2. Create editor_applications table
CREATE TABLE IF NOT EXISTS editor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  application_text TEXT NOT NULL,
  writing_samples TEXT,
  experience TEXT,
  specialty TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  UNIQUE(user_id)
);

-- Add indexes for editor applications
CREATE INDEX IF NOT EXISTS idx_editor_applications_user_id ON editor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_applications_status ON editor_applications(status);
CREATE INDEX IF NOT EXISTS idx_editor_applications_creator_id ON editor_applications(creator_id);

-- 3. Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Add indexes for article likes
CREATE INDEX IF NOT EXISTS idx_article_likes_article_id ON article_likes(article_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_user_id ON article_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_article_likes_created_at ON article_likes(created_at DESC);

-- 4. Create article_views table for tracking views per user
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

-- Add indexes for article views
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_session_id ON article_views(session_id);
CREATE INDEX IF NOT EXISTS idx_article_views_created_at ON article_views(created_at DESC);

-- 5. Create function to update article like_count
CREATE OR REPLACE FUNCTION update_article_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article_likes
DROP TRIGGER IF EXISTS trigger_update_article_like_count ON article_likes;
CREATE TRIGGER trigger_update_article_like_count
AFTER INSERT OR DELETE ON article_likes
FOR EACH ROW EXECUTE FUNCTION update_article_like_count();

-- 6. Create function to sync editor approval to profiles
CREATE OR REPLACE FUNCTION sync_editor_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE profiles
    SET
      is_editor = TRUE,
      editor_approved_at = NEW.reviewed_at,
      editor_approved_by = NEW.reviewed_by
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND OLD.status = 'approved' THEN
    UPDATE profiles
    SET
      is_editor = FALSE,
      editor_approved_at = NULL,
      editor_approved_by = NULL
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for editor_applications
DROP TRIGGER IF EXISTS trigger_sync_editor_approval ON editor_applications;
CREATE TRIGGER trigger_sync_editor_approval
AFTER UPDATE ON editor_applications
FOR EACH ROW EXECUTE FUNCTION sync_editor_approval();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE editor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies for editor_applications

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications"
ON editor_applications FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications"
ON editor_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to create their own application
CREATE POLICY "Users can create own application"
ON editor_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update applications
CREATE POLICY "Admins can update applications"
ON editor_applications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 9. Create RLS Policies for article_likes

-- Anyone can view likes
CREATE POLICY "Anyone can view article likes"
ON article_likes FOR SELECT
USING (true);

-- Authenticated users can create likes
CREATE POLICY "Authenticated users can like articles"
ON article_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can unlike articles"
ON article_likes FOR DELETE
USING (auth.uid() = user_id);

-- 10. Create RLS Policies for article_views

-- Anyone can create views (including anonymous)
CREATE POLICY "Anyone can create article views"
ON article_views FOR INSERT
WITH CHECK (true);

-- Users can view their own views
CREATE POLICY "Users can view own article views"
ON article_views FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all views
CREATE POLICY "Admins can view all article views"
ON article_views FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 11. Create helper function to check if user liked an article
CREATE OR REPLACE FUNCTION has_user_liked_article(p_article_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM article_likes
    WHERE article_id = p_article_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create function to get article stats
CREATE OR REPLACE FUNCTION get_article_stats(p_article_id UUID)
RETURNS TABLE (
  like_count BIGINT,
  view_count BIGINT,
  unique_view_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT al.id)::BIGINT as like_count,
    COUNT(av.id)::BIGINT as view_count,
    COUNT(DISTINCT COALESCE(av.user_id::TEXT, av.session_id))::BIGINT as unique_view_count
  FROM articles a
  LEFT JOIN article_likes al ON al.article_id = a.id
  LEFT JOIN article_views av ON av.article_id = a.id
  WHERE a.id = p_article_id
  GROUP BY a.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Add comments for documentation
COMMENT ON TABLE editor_applications IS 'Stores applications from creators who want to become editors';
COMMENT ON TABLE article_likes IS 'Tracks user likes on articles';
COMMENT ON TABLE article_views IS 'Tracks article views with user/session information';
COMMENT ON COLUMN profiles.is_creator IS 'Flag indicating if user has creator privileges';
COMMENT ON COLUMN profiles.is_editor IS 'Flag indicating if user has editor privileges (can write articles)';
COMMENT ON COLUMN editor_applications.status IS 'Application status: pending, approved, or rejected';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
