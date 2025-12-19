-- Update event_participants table with additional fields for registration

-- Add new columns to event_participants
ALTER TABLE event_participants
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended'));

-- Update existing attendance_status column if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='event_participants'
             AND column_name='attendance_status') THEN
    ALTER TABLE event_participants DROP COLUMN attendance_status;
  END IF;
END $$;

-- Generate QR codes for existing participants
UPDATE event_participants
SET qr_code = 'EVENT_' || id::text
WHERE qr_code IS NULL;

-- Function to auto-generate QR code on insert
CREATE OR REPLACE FUNCTION generate_event_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.qr_code IS NULL THEN
    NEW.qr_code := 'EVENT_' || NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate QR code
DROP TRIGGER IF EXISTS event_participants_qr_code_trigger ON event_participants;
CREATE TRIGGER event_participants_qr_code_trigger
  BEFORE INSERT ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION generate_event_qr_code();

-- Update events table with additional fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_time TIME,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update status constraint to include 'published'
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled'));

-- Migrate existing start_date to event_date and event_time (if start_date exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='events'
             AND column_name='start_date') THEN
    UPDATE events
    SET
      event_date = start_date::date,
      event_time = start_date::time
    WHERE event_date IS NULL;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN event_participants.qr_code IS 'Unique QR code for event check-in';
COMMENT ON COLUMN event_participants.name IS 'Participant name';
COMMENT ON COLUMN event_participants.email IS 'Participant email';
COMMENT ON COLUMN event_participants.phone IS 'Participant phone number';
COMMENT ON COLUMN event_participants.notes IS 'Special requests or notes';
COMMENT ON COLUMN event_participants.dietary_restrictions IS 'Food allergies or dietary restrictions';
COMMENT ON COLUMN event_participants.emergency_contact IS 'Emergency contact phone number';

-- Sample events update (only if the event exists)
UPDATE events
SET
  title = '시니어 패션 트렌드 워크숍 2025',
  description = '50-60대를 위한 2025 봄 패션 트렌드를 배우는 특별한 시간입니다. 전문 스타일리스트와 함께 나만의 스타일을 찾아보세요.',
  event_date = CURRENT_DATE + 10,
  event_time = '14:00:00',
  location = '서울시 강남구 청담동 패션센터',
  max_participants = 30,
  status = 'upcoming',
  image_url = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop'
WHERE title LIKE '%패션%워크숍%' OR title = '시니어 패션 워크숍';

-- Insert additional sample events
INSERT INTO events (
  title,
  description,
  event_type,
  start_date,
  end_date,
  event_date,
  event_time,
  location,
  max_participants,
  status,
  image_url
)
VALUES
  (
    '가을 메이크업 트렌드 워크숍',
    '전문 메이크업 아티스트와 함께하는 실습형 뷰티 클래스입니다. 2025 가을 트렌드를 내 얼굴에 적용해보세요.',
    'offline',
    (CURRENT_DATE + 15) + TIME '14:00:00',
    (CURRENT_DATE + 15) + TIME '17:00:00',
    CURRENT_DATE + 15,
    '14:00:00',
    '서울시 강남구 압구정동 뷰티살롱',
    20,
    'upcoming',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop'
  ),
  (
    '시니어를 위한 디지털 라이프',
    '스마트폰과 SNS를 활용한 디지털 생활을 배우는 워크숍입니다. 인스타그램, 유튜브 활용법을 익혀보세요.',
    'offline',
    (CURRENT_DATE + 20) + TIME '10:00:00',
    (CURRENT_DATE + 20) + TIME '13:00:00',
    CURRENT_DATE + 20,
    '10:00:00',
    '서울시 서초구 서초동 교육센터',
    25,
    'upcoming',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
  ),
  (
    '제주 힐링 여행',
    '2박 3일 제주도 힐링 여행입니다. 아름다운 자연과 함께 휴식을 취하세요.',
    'offline',
    (CURRENT_DATE + 30) + TIME '09:00:00',
    (CURRENT_DATE + 32) + TIME '18:00:00',
    CURRENT_DATE + 30,
    '09:00:00',
    '제주도 서귀포시',
    15,
    'upcoming',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
  ),
  (
    '와인 테이스팅 클래스',
    '소믈리에와 함께하는 와인 테이스팅 클래스입니다. 와인의 기초부터 고급까지 배워보세요.',
    'offline',
    (CURRENT_DATE + 12) + TIME '19:00:00',
    (CURRENT_DATE + 12) + TIME '21:00:00',
    CURRENT_DATE + 12,
    '19:00:00',
    '서울시 용산구 이태원 와인바',
    12,
    'upcoming',
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop'
  )
ON CONFLICT DO NOTHING;
