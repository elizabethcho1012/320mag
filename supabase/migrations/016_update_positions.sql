-- advertisements 테이블에서 sidebar 옵션 제거, top과 inline만 유지
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_position_check;
ALTER TABLE advertisements ADD CONSTRAINT advertisements_position_check
  CHECK (position IN ('top', 'inline'));

-- 기존 sidebar 광고를 inline으로 변경
UPDATE advertisements SET position = 'inline' WHERE position = 'sidebar';

-- events 테이블의 position을 top과 inline으로 변경 (bottom 제거)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_position_check;
ALTER TABLE events ADD CONSTRAINT events_position_check
  CHECK (position IN ('top', 'inline'));

-- 기존 bottom 이벤트를 inline으로 변경
UPDATE events SET position = 'inline' WHERE position = 'bottom';
