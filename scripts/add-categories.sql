-- NEW SEXY 카테고리 추가 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 컬처 카테고리 삭제
DELETE FROM categories WHERE slug = 'culture';

-- 2. 새로운 카테고리 추가
INSERT INTO categories (name, slug, description) VALUES
  ('글로벌푸드', 'global-food', '세계 각국의 음식 문화와 트렌드'),
  ('건강푸드', 'health-food', '건강을 위한 영양과 식단 정보'),
  ('심리', 'psychology', '마음의 건강과 심리학 인사이트'),
  ('섹슈얼리티', 'sexuality', '성과 관계에 대한 건강한 이해'),
  ('운동', 'exercise', '건강한 신체를 위한 운동과 피트니스')
ON CONFLICT (slug) DO NOTHING;

-- 3. 결과 확인
SELECT * FROM categories ORDER BY name;
