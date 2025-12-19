-- events 테이블 생성
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('online', 'offline', 'hybrid')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  max_participants INTEGER,
  registration_deadline TIMESTAMPTZ,
  registration_fee INTEGER DEFAULT 0,
  featured_image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  category_id UUID REFERENCES categories(id),
  creator_id UUID REFERENCES creators(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- event_participants 테이블 (이벤트 참가자)
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attendance_status TEXT DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  UNIQUE(event_id, user_id)
);

-- RLS 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- 정책: 누구나 이벤트 조회 가능
CREATE POLICY "Public events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- 정책: 관리자만 이벤트 생성/수정/삭제 가능
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 정책: 인증된 사용자는 이벤트에 등록 가능
CREATE POLICY "Authenticated users can register for events"
  ON event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책: 사용자는 자신의 참가 정보 조회 가능
CREATE POLICY "Users can view own event registrations"
  ON event_participants FOR SELECT
  USING (auth.uid() = user_id);

-- 정책: 사용자는 자신의 참가 정보 취소 가능
CREATE POLICY "Users can cancel own event registrations"
  ON event_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- 정책: 관리자는 모든 참가 정보 조회 가능
CREATE POLICY "Admins can view all event registrations"
  ON event_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);

-- 샘플 이벤트 데이터 (선택사항)
-- 카테고리 ID는 실제 데이터에 맞게 수정 필요
INSERT INTO events (title, description, event_type, start_date, end_date, location, max_participants, status)
VALUES
  ('시니어 패션 워크숍', '50-60대를 위한 스타일링 워크숍입니다. 전문 스타일리스트와 함께하는 특별한 시간을 만나보세요.', 'offline', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', '서울시 강남구 논현동', 30, 'upcoming'),
  ('온라인 건강 세미나', '건강한 노후를 위한 생활 습관과 운동법을 배우는 온라인 세미나입니다.', 'online', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '2 hours', '온라인 (Zoom)', 100, 'upcoming'),
  ('뷰티 & 웰니스 토크쇼', '나이를 거듭할수록 빛나는 아름다움에 대한 이야기를 나누는 토크쇼입니다.', 'hybrid', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '2 hours', '서울시 종로구 인사동', 50, 'upcoming');
