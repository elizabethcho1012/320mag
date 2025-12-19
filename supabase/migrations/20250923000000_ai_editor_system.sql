-- AI 에디터 시스템을 위한 데이터베이스 스키마

-- 1. AI 에디터 테이블
CREATE TABLE IF NOT EXISTS public.ai_editors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  editor_id TEXT UNIQUE NOT NULL, -- 'fashion-sophia', 'beauty-jane' 등
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  age INTEGER NOT NULL,
  category TEXT NOT NULL,
  profession TEXT NOT NULL,
  background TEXT,
  personality TEXT,
  tone TEXT,
  writing_style TEXT,
  catchphrase TEXT,
  expertise TEXT[] DEFAULT '{}',
  avatar TEXT,
  prompt_template TEXT,
  is_premium BOOLEAN DEFAULT false, -- 프리미엄 전용 에디터 여부
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. AI 생성 콘텐츠 테이블 (기존 articles 테이블 확장)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS ai_editor_id TEXT REFERENCES public.ai_editors(editor_id),
  ADD COLUMN IF NOT EXISTS source_urls TEXT[], -- 원본 소스 URL들
  ADD COLUMN IF NOT EXISTS ai_generated_image TEXT, -- AI 생성 메인 이미지
  ADD COLUMN IF NOT EXISTS challenge_question TEXT, -- 챌린지 질문
  ADD COLUMN IF NOT EXISTS challenge_participants_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- 3. 챌린지 참여 테이블
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participation_type TEXT CHECK (participation_type IN ('voice', 'text')),
  voice_url TEXT, -- 음성 파일 URL (Supabase Storage)
  text_content TEXT NOT NULL, -- 변환된 텍스트 또는 직접 입력
  voice_duration INTEGER, -- 음성 길이 (초)
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false, -- 에디터 추천
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. 챌린지 댓글 테이블
CREATE TABLE IF NOT EXISTS public.challenge_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. 챌린지 좋아요 테이블
CREATE TABLE IF NOT EXISTS public.challenge_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(challenge_id, user_id)
);

-- 6. 사용자 프로필 확장
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  age INTEGER,
  bio TEXT,
  avatar_url TEXT,
  challenge_level TEXT DEFAULT 'newcomer', -- 'newcomer', 'growing', 'tree', 'expert', 'master'
  challenges_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. 푸시 알림 설정 테이블
CREATE TABLE IF NOT EXISTS public.push_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  fcm_token TEXT, -- Firebase Cloud Messaging 토큰
  subscribed_editors TEXT[] DEFAULT '{}', -- 구독한 에디터 ID 목록
  quiet_hours_start TIME, -- 조용한 시간 시작 (예: 21:00)
  quiet_hours_end TIME, -- 조용한 시간 종료 (예: 07:00)
  community_notifications BOOLEAN DEFAULT true, -- 댓글/좋아요 알림
  weekly_digest BOOLEAN DEFAULT true, -- 주간 다이제스트
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. 콘텐츠 소스 테이블 (수집된 원본 소스 관리)
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT CHECK (source_type IN ('rss', 'api', 'web_scraping')),
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  fetch_frequency TEXT DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. 원본 콘텐츠 캐시 테이블 (AI 리라이팅 전 원본)
CREATE TABLE IF NOT EXISTS public.raw_content_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.content_sources(id),
  original_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE,
  author TEXT,
  category TEXT,
  is_processed BOOLEAN DEFAULT false,
  ai_rewritten_article_id UUID REFERENCES public.articles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 10. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_articles_ai_editor ON public.articles(ai_editor_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_article ON public.challenges(article_id);
CREATE INDEX IF NOT EXISTS idx_challenges_user ON public.challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_created ON public.challenges(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenge_likes_challenge ON public.challenge_likes(challenge_id);
CREATE INDEX IF NOT EXISTS idx_push_settings_user ON public.push_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_category ON public.content_sources(category);
CREATE INDEX IF NOT EXISTS idx_raw_content_processed ON public.raw_content_cache(is_processed);

-- 11. RLS (Row Level Security) 정책
ALTER TABLE public.ai_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_settings ENABLE ROW LEVEL SECURITY;

-- AI 에디터는 모두가 읽을 수 있음
CREATE POLICY "AI editors are viewable by everyone"
  ON public.ai_editors FOR SELECT
  USING (true);

-- 챌린지는 모두가 읽을 수 있음
CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges FOR SELECT
  USING (true);

-- 챌린지는 인증된 사용자만 작성
CREATE POLICY "Authenticated users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 자신의 챌린지만 수정/삭제
CREATE POLICY "Users can update own challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own challenges"
  ON public.challenges FOR DELETE
  USING (auth.uid() = user_id);

-- 챌린지 댓글 정책
CREATE POLICY "Challenge replies are viewable by everyone"
  ON public.challenge_replies FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON public.challenge_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 챌린지 좋아요 정책
CREATE POLICY "Challenge likes are viewable by everyone"
  ON public.challenge_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like challenges"
  ON public.challenge_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes"
  ON public.challenge_likes FOR DELETE
  USING (auth.uid() = user_id);

-- 사용자 프로필 정책
CREATE POLICY "Profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 푸시 설정 정책 (자신의 설정만)
CREATE POLICY "Users can view own push settings"
  ON public.push_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own push settings"
  ON public.push_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push settings"
  ON public.push_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 12. 트리거: 챌린지 좋아요 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_challenge_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenges
    SET likes_count = likes_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenges
    SET likes_count = likes_count - 1
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_likes_count_trigger
AFTER INSERT OR DELETE ON public.challenge_likes
FOR EACH ROW EXECUTE FUNCTION update_challenge_likes_count();

-- 13. 트리거: 챌린지 댓글 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_challenge_replies_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.challenges
    SET replies_count = replies_count + 1
    WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.challenges
    SET replies_count = replies_count - 1
    WHERE id = OLD.challenge_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_replies_count_trigger
AFTER INSERT OR DELETE ON public.challenge_replies
FOR EACH ROW EXECUTE FUNCTION update_challenge_replies_count();

-- 14. 트리거: 아티클의 챌린지 참여자 수 자동 업데이트
CREATE OR REPLACE FUNCTION update_article_challenge_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles
    SET challenge_participants_count = challenge_participants_count + 1
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles
    SET challenge_participants_count = challenge_participants_count - 1
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_challenge_count_trigger
AFTER INSERT OR DELETE ON public.challenges
FOR EACH ROW EXECUTE FUNCTION update_article_challenge_count();

-- 15. 트리거: 사용자 챌린지 레벨 자동 업데이트
CREATE OR REPLACE FUNCTION update_user_challenge_level()
RETURNS TRIGGER AS $$
DECLARE
  total_challenges INTEGER;
  new_level TEXT;
BEGIN
  SELECT challenges_count INTO total_challenges
  FROM public.user_profiles
  WHERE id = NEW.user_id;

  IF total_challenges IS NULL THEN
    total_challenges := 0;
  END IF;

  total_challenges := total_challenges + 1;

  IF total_challenges <= 10 THEN
    new_level := 'newcomer';
  ELSIF total_challenges <= 30 THEN
    new_level := 'growing';
  ELSIF total_challenges <= 100 THEN
    new_level := 'tree';
  ELSIF total_challenges <= 300 THEN
    new_level := 'expert';
  ELSE
    new_level := 'master';
  END IF;

  UPDATE public.user_profiles
  SET challenges_count = total_challenges,
      challenge_level = new_level,
      updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_challenge_level_trigger
AFTER INSERT ON public.challenges
FOR EACH ROW EXECUTE FUNCTION update_user_challenge_level();
