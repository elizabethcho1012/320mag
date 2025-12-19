-- Enable UPDATE permission for creators table
-- Run this in Supabase SQL Editor

-- Add RLS policy to allow updates
CREATE POLICY IF NOT EXISTS "Allow anonymous update creators"
ON creators
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'creators';
