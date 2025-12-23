-- events 테이블에 position 필드 추가
ALTER TABLE events ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'inline' CHECK (position IN ('inline', 'bottom'));

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_events_position ON events(position);

-- 기존 이벤트는 모두 inline으로 설정
UPDATE events SET position = 'inline' WHERE position IS NULL;
