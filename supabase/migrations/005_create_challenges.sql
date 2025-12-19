-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_duration INTEGER DEFAULT 120, -- max recording duration in seconds
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'ended', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create challenge_participations table
CREATE TABLE IF NOT EXISTS challenge_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- actual recording duration in seconds
  transcription TEXT, -- optional: voice-to-text result
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id) -- one participation per user per challenge
);

-- Create indexes
CREATE INDEX IF NOT EXISTS challenges_status_idx ON challenges(status);
CREATE INDEX IF NOT EXISTS challenges_dates_idx ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS challenge_participations_challenge_idx ON challenge_participations(challenge_id);
CREATE INDEX IF NOT EXISTS challenge_participations_user_idx ON challenge_participations(user_id);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for challenges
-- Everyone can view active challenges
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (status = 'active' OR status = 'ended');

-- Only admins can create/update/delete challenges
CREATE POLICY "Admins can manage challenges"
  ON challenges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for challenge_participations
-- Users can view their own participations
CREATE POLICY "Users can view own participations"
  ON challenge_participations FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all participations
CREATE POLICY "Admins can view all participations"
  ON challenge_participations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can create their own participations
CREATE POLICY "Users can submit participations"
  ON challenge_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participations (before approval)
CREATE POLICY "Users can update own participations"
  ON challenge_participations FOR UPDATE
  USING (auth.uid() = user_id AND status = 'submitted');

-- Admins can update any participation
CREATE POLICY "Admins can update participations"
  ON challenge_participations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for voice recordings
CREATE POLICY "Anyone can view voice recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'voice-recordings');

CREATE POLICY "Authenticated users can upload voice recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'voice-recordings' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own voice recordings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'voice-recordings' AND
    owner = auth.uid()
  );

CREATE POLICY "Users can delete own voice recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'voice-recordings' AND
    owner = auth.uid()
  );

-- Insert sample challenges
INSERT INTO challenges (title, description, instructions, start_date, end_date, max_duration, status)
VALUES
  (
    '나의 패션 철학',
    '자신만의 패션 철학을 음성으로 공유해주세요',
    '1. 자신의 패션 스타일을 소개해주세요\n2. 옷을 선택할 때 중요하게 생각하는 점을 말씀해주세요\n3. 최근 가장 마음에 드는 패션 아이템을 소개해주세요',
    NOW(),
    NOW() + INTERVAL '30 days',
    120,
    'active'
  ),
  (
    '시니어의 아름다움',
    '나이 들수록 더 아름다워지는 비결을 나눠주세요',
    '1. 자신만의 뷰티 루틴을 소개해주세요\n2. 나이가 들면서 달라진 아름다움에 대한 생각을 공유해주세요\n3. 후배 세대에게 전하고 싶은 뷰티 팁이 있다면 말씀해주세요',
    NOW(),
    NOW() + INTERVAL '30 days',
    120,
    'active'
  ),
  (
    '인생을 바꾼 여행',
    '기억에 남는 여행 경험을 들려주세요',
    '1. 가장 기억에 남는 여행지는 어디인가요?\n2. 그 여행에서 어떤 특별한 경험을 하셨나요?\n3. 그 경험이 인생에 어떤 영향을 미쳤나요?',
    NOW(),
    NOW() + INTERVAL '30 days',
    120,
    'active'
  );

-- Comments
COMMENT ON TABLE challenges IS 'Voice recording challenges for user engagement';
COMMENT ON TABLE challenge_participations IS 'User submissions for voice challenges';
COMMENT ON COLUMN challenges.max_duration IS 'Maximum recording duration in seconds';
COMMENT ON COLUMN challenge_participations.transcription IS 'Optional voice-to-text transcription';
