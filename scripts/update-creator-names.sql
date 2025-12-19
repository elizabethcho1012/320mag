-- Update creator names from Korean to English
-- Supabase SQL Editor에서 실행하세요

-- Update existing creators to English names
UPDATE creators SET name = 'Sophia' WHERE name = '소피아';
UPDATE creators SET name = 'Jane' WHERE name = '제인';
UPDATE creators SET name = 'Martin' WHERE name = '마틴';
UPDATE creators SET name = 'Clara' WHERE name = '클라라';
UPDATE creators SET name = 'Henry' WHERE name = '헨리';
UPDATE creators SET name = 'Marcus' WHERE name = '마커스';
UPDATE creators SET name = 'Antoine' WHERE name = '앙투안';
UPDATE creators SET name = 'Thomas' WHERE name = '토마스';
UPDATE creators SET name = 'Sarah' WHERE name = '닥터 사라';
UPDATE creators SET name = 'Rebecca' WHERE name = '레베카';
UPDATE creators SET name = 'Mark' WHERE name = '마크';
UPDATE creators SET name = 'Elizabeth' WHERE name = '엘리자베스';

-- Verify results
SELECT id, name, profession, specialty FROM creators ORDER BY name;
