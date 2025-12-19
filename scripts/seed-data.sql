-- 카테고리와 크리에이터 초기 데이터 생성 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. 카테고리 데이터 (이미 존재하는 것은 건너뛰기)
DO $$
BEGIN
  -- 패션
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'fashion') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('패션', 'fashion', '최신 패션 트렌드와 스타일링 팁', 1);
  END IF;

  -- 뷰티
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'beauty') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('뷰티', 'beauty', '뷰티 제품 리뷰와 메이크업 가이드', 2);
  END IF;

  -- 컬처
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'culture') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('컬처', 'culture', '문화, 예술, 엔터테인먼트', 3);
  END IF;

  -- 여행
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'travel') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('여행', 'travel', '여행 정보와 추천 여행지', 4);
  END IF;

  -- 시니어시장
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'senior-market') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('시니어시장', 'senior-market', '시니어를 위한 시장 분석과 트렌드', 5);
  END IF;

  -- 글로벌트렌드
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'global-trends') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('글로벌트렌드', 'global-trends', '세계의 최신 트렌드와 비즈니스', 6);
  END IF;

  -- 푸드
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'food') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('푸드', 'food', '맛집과 요리 레시피', 7);
  END IF;

  -- 하우징
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'housing') THEN
    INSERT INTO categories (name, slug, description, order_index)
    VALUES ('하우징', 'housing', '인테리어와 라이프스타일', 8);
  END IF;
END $$;

-- 2. 크리에이터(AI 에디터) 데이터 (이미 존재하는 것은 건너뛰기)
DO $$
BEGIN
  -- Sophia
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Sophia') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Sophia', 45, '패션 디렉터 & 스타일리스트', '패션',
            '파리와 밀라노에서 15년간 활동하며 보그, 하퍼스 바자, 엘르의 에디터로 일했습니다.',
            '에이지리스 패션, 실용 스타일링', 'active', true);
  END IF;

  -- Jane
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Jane') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Jane', 46, '뷰티 크리에이터 & 피부과 전문의', '뷰티',
            '피부과 전문의로서 15년간 임상 경험을 쌓은 후 뷰티 콘텐츠 크리에이터로 활동 중입니다.',
            '안티에이징, 스킨케어', 'active', true);
  END IF;

  -- Martin
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Martin') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Martin', 55, '문화 평론가 & 큐레이터', '컬처',
            '30년간 예술, 영화, 음악 분야에서 평론가로 활동했습니다.',
            '예술, 영화, 음악', 'active', true);
  END IF;

  -- Clara
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Clara') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Clara', 50, '여행 작가 & 사진가', '여행',
            '25년간 전 세계 80개국을 여행하며 여행 에세이와 가이드북을 집필했습니다.',
            '여행 기획, 문화 체험', 'active', true);
  END IF;

  -- Henry
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Henry') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Henry', 54, '시니어 라이프 컨설턴트', '시니어시장',
            '글로벌 기업 임원 출신으로, 현재 시니어를 위한 라이프스타일 전문가입니다.',
            '시니어 비즈니스', 'active', true);
  END IF;

  -- Marcus
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Marcus') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Marcus', 49, '글로벌 트렌드 애널리스트', '글로벌트렌드',
            '글로벌 컨설팅 펌에서 20년간 트렌드 분석가로 활동했습니다.',
            '트렌드 분석, 미래 예측', 'active', true);
  END IF;

  -- Antoine
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Antoine') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Antoine', 48, '셰프 & 푸드 라이터', '푸드',
            '미슐랭 2스타 레스토랑 셰프 출신으로, 현재는 푸드 칼럼니스트로 활동합니다.',
            '요리, 레스토랑 큐레이션', 'active', true);
  END IF;

  -- Thomas
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Thomas') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Thomas', 52, '인테리어 디자이너 & 건축가', '하우징',
            '20년간 건축 및 인테리어 디자인 프로젝트를 진행했습니다.',
            '인테리어, 공간 디자인', 'active', true);
  END IF;

  -- Sarah
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Sarah') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Sarah', 47, '성심리학자 & 관계 전문가', '섹슈얼리티',
            '성심리학 박사로서 15년간 상담 경험을 쌓았습니다.',
            '성 건강, 관계 상담', 'active', true);
  END IF;

  -- Rebecca
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Rebecca') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Rebecca', 48, '심리학자 & 라이프 코치', '심리',
            '임상 심리학자로 20년간 활동하며 중년의 심리적 성장을 연구했습니다.',
            '심리 상담, 자기계발', 'active', true);
  END IF;

  -- Mark
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Mark') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Mark', 52, '스포츠 의학 전문의 & 피트니스 코치', '운동',
            '스포츠 의학 전문의로서 선수들과 일반인들의 건강을 관리했습니다.',
            '운동, 건강 관리', 'active', true);
  END IF;

  -- Elizabeth
  IF NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Elizabeth') THEN
    INSERT INTO creators (name, age, profession, specialty, bio, experience, status, verified)
    VALUES ('Elizabeth', 51, '편집장', '종합',
            '30년간 저널리즘 분야에서 활동한 베테랑 편집인입니다.',
            '편집, 저널리즘', 'active', true);
  END IF;
END $$;

-- 결과 확인
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Creators:' as table_name, COUNT(*) as count FROM creators;
