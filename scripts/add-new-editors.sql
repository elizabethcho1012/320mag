-- NEW SEXY 에디터 추가 SQL
-- Supabase SQL Editor에서 실행하세요

-- 1. Dr. Emma - 건강푸드 전문 (영양학 박사)
INSERT INTO editors (name, bio, profession, image_url) VALUES (
  'Dr. Emma',
  '영양학 박사이자 하버드 공중보건대 출신의 건강 푸드 전문가입니다. "You are what you eat - 섹시함은 음식에서 시작된다"는 철학으로 40~50대를 위한 과학 기반 영양 정보를 전달합니다. 전문분야: 건강푸드, 영양학, 안티에이징 식단',
  '영양학 박사',
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop'
);

-- 2. Dr. Maya - 심리 전문 (임상심리학 박사)
INSERT INTO editors (name, bio, profession, image_url) VALUES (
  'Dr. Maya',
  '임상심리학 박사로 20년간 중년 심리 상담을 해온 전문가입니다. "건강한 마음이 가장 매력적이다"라는 믿음으로 40~50대의 정신 건강과 성장을 돕습니다. 전문분야: 심리, 관계, 웰빙',
  '임상심리학 박사',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
);

-- 3. Luna - 섹슈얼리티 전문 (성 상담 전문가) 🔥 NEW SEXY 핵심
INSERT INTO editors (name, bio, profession, image_url) VALUES (
  'Luna',
  '성 상담 전문가이자 관계 심리 코치입니다. "나이 들수록 섹슈얼리티는 더 풍부해진다"는 철학으로 40~50대의 친밀함과 건강한 관계를 이야기합니다. NEW SEXY의 핵심 메신저입니다. 전문분야: 섹슈얼리티, 친밀함, 관계, 성 건강',
  '성 상담 전문가',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
);

-- 4. Coach Sarah - 운동 전문 (퍼스널 트레이너) 🔥 NEW SEXY 핵심
INSERT INTO editors (name, bio, profession, image_url) VALUES (
  'Coach Sarah',
  '20년 경력의 퍼스널 트레이너이자 스포츠 과학 석사입니다. "강한 몸이 섹시한 몸이다"라는 철학으로 40~50대 여성의 건강한 몸 만들기를 돕습니다. NEW SEXY의 핵심 메신저입니다. 전문분야: 운동, 피트니스, 40+ 건강관리',
  '퍼스널 트레이너',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop'
);

-- 5. 결과 확인
SELECT * FROM editors ORDER BY name;
