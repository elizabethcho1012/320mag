-- =====================================================
-- 320MAG NEW SEXY 전체 카테고리/서브카테고리 초기화 SQL
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 1. 기존 데이터 정리
TRUNCATE categories CASCADE;

-- 2. 메인 카테고리 11개 삽입 (RSS 소스가 있는 카테고리만)
INSERT INTO categories (name, slug, description, order_index) VALUES
  ('패션', 'fashion', '트렌디하고 실용적인 패션 가이드', 1),
  ('뷰티', 'beauty', '안티에이징과 뷰티 트렌드', 2),
  ('여행', 'travel', '40~50대를 위한 프리미엄 여행', 3),
  ('라이프스타일', 'lifestyle', '풍요로운 중년의 라이프스타일', 4),
  ('글로벌푸드', 'global-food', '세계 각국의 음식 문화와 트렌드', 5),
  ('건강푸드', 'health-food', '건강을 위한 영양과 식단 정보', 6),
  ('하우징', 'housing', '집과 공간을 아름답게 꾸미는 방법', 7),
  ('글로벌트렌드', 'global-trends', '세계적인 사회, 경제, 기술 트렌드', 8),
  ('심리', 'psychology', '마음의 건강과 심리학 인사이트', 9),
  ('섹슈얼리티', 'sexuality', '성과 관계에 대한 건강한 이해', 10),
  ('운동', 'exercise', '건강한 신체를 위한 운동과 피트니스', 11);

-- 3. 서브카테고리 삽입

-- 패션 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'fashion-all', (SELECT id FROM categories WHERE slug = 'fashion'), 1),
  ('TRENDS', 'fashion-trends', (SELECT id FROM categories WHERE slug = 'fashion'), 2),
  ('CELEB STYLE', 'fashion-celeb-style', (SELECT id FROM categories WHERE slug = 'fashion'), 3),
  ('WATCH & JEWELRY', 'fashion-watch-jewelry', (SELECT id FROM categories WHERE slug = 'fashion'), 4),
  ('FASHION WEEK', 'fashion-week', (SELECT id FROM categories WHERE slug = 'fashion'), 5),
  ('DESIGNERS', 'fashion-designers', (SELECT id FROM categories WHERE slug = 'fashion'), 6);

-- 뷰티 서브카테고리 (5개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'beauty-all', (SELECT id FROM categories WHERE slug = 'beauty'), 1),
  ('MAKE-UP & NAILS', 'beauty-makeup-nails', (SELECT id FROM categories WHERE slug = 'beauty'), 2),
  ('SKINCARE', 'beauty-skincare', (SELECT id FROM categories WHERE slug = 'beauty'), 3),
  ('BODY & HAIR', 'beauty-body-hair', (SELECT id FROM categories WHERE slug = 'beauty'), 4),
  ('WELLNESS', 'beauty-wellness', (SELECT id FROM categories WHERE slug = 'beauty'), 5);

-- 여행 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'travel-all', (SELECT id FROM categories WHERE slug = 'travel'), 1),
  ('DESTINATION', 'travel-destination', (SELECT id FROM categories WHERE slug = 'travel'), 2),
  ('CULTURE', 'travel-culture', (SELECT id FROM categories WHERE slug = 'travel'), 3),
  ('FOOD TRAVEL', 'travel-food', (SELECT id FROM categories WHERE slug = 'travel'), 4),
  ('SLOW TRAVEL', 'travel-slow', (SELECT id FROM categories WHERE slug = 'travel'), 5),
  ('TIPS', 'travel-tips', (SELECT id FROM categories WHERE slug = 'travel'), 6);

-- 라이프스타일 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'lifestyle-all', (SELECT id FROM categories WHERE slug = 'lifestyle'), 1),
  ('WELLNESS', 'lifestyle-wellness', (SELECT id FROM categories WHERE slug = 'lifestyle'), 2),
  ('CAREER', 'lifestyle-career', (SELECT id FROM categories WHERE slug = 'lifestyle'), 3),
  ('RELATIONSHIPS', 'lifestyle-relationships', (SELECT id FROM categories WHERE slug = 'lifestyle'), 4),
  ('CULTURE', 'lifestyle-culture', (SELECT id FROM categories WHERE slug = 'lifestyle'), 5),
  ('ENTERTAINMENT', 'lifestyle-entertainment', (SELECT id FROM categories WHERE slug = 'lifestyle'), 6);

-- 글로벌푸드 서브카테고리 (5개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'global-food-all', (SELECT id FROM categories WHERE slug = 'global-food'), 1),
  ('WORLD CUISINE', 'global-food-world-cuisine', (SELECT id FROM categories WHERE slug = 'global-food'), 2),
  ('RESTAURANT', 'global-food-restaurant', (SELECT id FROM categories WHERE slug = 'global-food'), 3),
  ('FOOD CULTURE', 'global-food-culture', (SELECT id FROM categories WHERE slug = 'global-food'), 4),
  ('WINE & SPIRITS', 'global-food-wine-spirits', (SELECT id FROM categories WHERE slug = 'global-food'), 5);

-- 건강푸드 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'health-food-all', (SELECT id FROM categories WHERE slug = 'health-food'), 1),
  ('NUTRITION', 'health-food-nutrition', (SELECT id FROM categories WHERE slug = 'health-food'), 2),
  ('RECIPES', 'health-food-recipes', (SELECT id FROM categories WHERE slug = 'health-food'), 3),
  ('SUPERFOODS', 'health-food-superfoods', (SELECT id FROM categories WHERE slug = 'health-food'), 4),
  ('DIET', 'health-food-diet', (SELECT id FROM categories WHERE slug = 'health-food'), 5),
  ('MEAL PLANNING', 'health-food-meal-planning', (SELECT id FROM categories WHERE slug = 'health-food'), 6);

-- 하우징 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'housing-all', (SELECT id FROM categories WHERE slug = 'housing'), 1),
  ('INTERIOR', 'housing-interior', (SELECT id FROM categories WHERE slug = 'housing'), 2),
  ('REMODELING', 'housing-remodeling', (SELECT id FROM categories WHERE slug = 'housing'), 3),
  ('SMART HOME', 'housing-smart-home', (SELECT id FROM categories WHERE slug = 'housing'), 4),
  ('UNIVERSAL DESIGN', 'housing-universal-design', (SELECT id FROM categories WHERE slug = 'housing'), 5),
  ('SENIOR LIVING', 'housing-senior-living', (SELECT id FROM categories WHERE slug = 'housing'), 6);

-- 글로벌트렌드 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'global-trends-all', (SELECT id FROM categories WHERE slug = 'global-trends'), 1),
  ('POLITICS', 'global-trends-politics', (SELECT id FROM categories WHERE slug = 'global-trends'), 2),
  ('ECONOMY', 'global-trends-economy', (SELECT id FROM categories WHERE slug = 'global-trends'), 3),
  ('TECH', 'global-trends-tech', (SELECT id FROM categories WHERE slug = 'global-trends'), 4),
  ('SOCIETY', 'global-trends-society', (SELECT id FROM categories WHERE slug = 'global-trends'), 5),
  ('ENVIRONMENT', 'global-trends-environment', (SELECT id FROM categories WHERE slug = 'global-trends'), 6);

-- 심리 서브카테고리 (5개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'psychology-all', (SELECT id FROM categories WHERE slug = 'psychology'), 1),
  ('WELLNESS', 'psychology-wellness', (SELECT id FROM categories WHERE slug = 'psychology'), 2),
  ('MINDFULNESS', 'psychology-mindfulness', (SELECT id FROM categories WHERE slug = 'psychology'), 3),
  ('RELATIONSHIPS', 'psychology-relationships', (SELECT id FROM categories WHERE slug = 'psychology'), 4),
  ('SELF-DEVELOPMENT', 'psychology-self-development', (SELECT id FROM categories WHERE slug = 'psychology'), 5);

-- 섹슈얼리티 서브카테고리 (5개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'sexuality-all', (SELECT id FROM categories WHERE slug = 'sexuality'), 1),
  ('INTIMACY', 'sexuality-intimacy', (SELECT id FROM categories WHERE slug = 'sexuality'), 2),
  ('RELATIONSHIPS', 'sexuality-relationships', (SELECT id FROM categories WHERE slug = 'sexuality'), 3),
  ('HEALTH', 'sexuality-health', (SELECT id FROM categories WHERE slug = 'sexuality'), 4),
  ('COUNSELING', 'sexuality-counseling', (SELECT id FROM categories WHERE slug = 'sexuality'), 5);

-- 운동 서브카테고리 (6개)
INSERT INTO subcategories (name, slug, category_id, order_index) VALUES
  ('ALL', 'exercise-all', (SELECT id FROM categories WHERE slug = 'exercise'), 1),
  ('STRENGTH', 'exercise-strength', (SELECT id FROM categories WHERE slug = 'exercise'), 2),
  ('CARDIO', 'exercise-cardio', (SELECT id FROM categories WHERE slug = 'exercise'), 3),
  ('FLEXIBILITY', 'exercise-flexibility', (SELECT id FROM categories WHERE slug = 'exercise'), 4),
  ('INJURY PREVENTION', 'exercise-injury-prevention', (SELECT id FROM categories WHERE slug = 'exercise'), 5),
  ('EXERCISE SCIENCE', 'exercise-science', (SELECT id FROM categories WHERE slug = 'exercise'), 6);

-- 4. 결과 확인
SELECT
  c.name AS category,
  c.slug,
  COUNT(s.id) AS subcategory_count
FROM categories c
LEFT JOIN subcategories s ON s.category_id = c.id
GROUP BY c.id, c.name, c.slug, c.order_index
ORDER BY c.order_index;
-- 5. 서브카테고리 상세 확인
SELECT
  c.name AS category,
  s.name AS subcategory,
  s.slug,
  s.order_index
FROM categories c
JOIN subcategories s ON s.category_id = c.id
ORDER BY c.order_index, s.order_index;
