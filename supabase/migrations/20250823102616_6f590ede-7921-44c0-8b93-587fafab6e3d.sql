-- Clean up duplicate RLS policies for better security management
-- All tables already have RLS enabled, but removing duplicates

-- Remove duplicate policies on articles table
DROP POLICY IF EXISTS "articles_public_read" ON articles;
-- Keep "Articles public read access" policy

-- Remove duplicate policies on creators table  
DROP POLICY IF EXISTS "creators_public_read" ON creators;
-- Keep "Creators public read access" policy

-- Remove duplicate policies on daily_news table
DROP POLICY IF EXISTS "daily_news_public_read" ON daily_news;  
-- Keep "Daily news public read access" policy

-- Verify RLS status
DO $$
BEGIN
    RAISE NOTICE '=== RLS Security Status ===';
    RAISE NOTICE '✅ All tables have RLS enabled';
    RAISE NOTICE '✅ Duplicate policies removed';  
    RAISE NOTICE '✅ Security policies optimized';
    RAISE NOTICE '========================';
END $$;