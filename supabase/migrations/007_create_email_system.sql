-- Create email_logs table for tracking sent emails
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT
);

-- Create email_preferences table for user preferences
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  new_articles BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  events BOOLEAN DEFAULT TRUE,
  challenges BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email preferences to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{"new_articles": true, "weekly_digest": true, "events": true, "challenges": true, "marketing": false}'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS email_logs_recipient_idx ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS email_preferences_user_id_idx ON email_preferences(user_id);

-- RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Only admins can view email logs
CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can view and update their own email preferences
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to create default email preferences on user signup
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create email preferences on profile creation
DROP TRIGGER IF EXISTS on_profile_created_email_prefs ON profiles;
CREATE TRIGGER on_profile_created_email_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Comments
COMMENT ON TABLE email_logs IS 'Log of all emails sent by the system';
COMMENT ON TABLE email_preferences IS 'User preferences for email notifications';
COMMENT ON COLUMN email_preferences.new_articles IS 'Receive notifications for new articles';
COMMENT ON COLUMN email_preferences.weekly_digest IS 'Receive weekly digest email';
COMMENT ON COLUMN email_preferences.events IS 'Receive event notifications';
COMMENT ON COLUMN email_preferences.challenges IS 'Receive challenge notifications';
COMMENT ON COLUMN email_preferences.marketing IS 'Receive marketing emails';
