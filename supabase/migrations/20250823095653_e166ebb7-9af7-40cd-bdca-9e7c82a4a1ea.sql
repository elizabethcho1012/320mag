-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create creators table
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  profession VARCHAR,
  bio TEXT,
  image_url TEXT,
  email VARCHAR,
  verified BOOLEAN DEFAULT false,
  status VARCHAR DEFAULT 'active',
  age INTEGER,
  experience VARCHAR,
  specialty VARCHAR,
  social_links JSONB DEFAULT '{}',
  followers_count INTEGER DEFAULT 0,
  articles_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_id UUID,
  status VARCHAR DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  category_id UUID REFERENCES public.categories(id),
  subcategory_id UUID REFERENCES public.subcategories(id),
  creator_id UUID REFERENCES public.creators(id),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  read_time VARCHAR DEFAULT '5분',
  author_name VARCHAR,
  created_by UUID,
  updated_by UUID,
  seo_title VARCHAR,
  seo_description TEXT,
  seo_keywords TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily_news table
CREATE TABLE public.daily_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  published_date DATE NOT NULL,
  status VARCHAR DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tags table for article tagging
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  slug VARCHAR NOT NULL UNIQUE,
  color VARCHAR DEFAULT '#6366f1',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create media table for file management
CREATE TABLE public.media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR NOT NULL,
  original_name VARCHAR NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL PRIMARY KEY,
  full_name VARCHAR,
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR DEFAULT 'editor',
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR,
  status VARCHAR DEFAULT 'active',
  preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "articles_public_read" ON public.articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "articles_update_views" ON public.articles
  FOR UPDATE USING (true) 
  WITH CHECK (true);

CREATE POLICY "creators_public_read" ON public.creators
  FOR SELECT USING (status = 'active');

CREATE POLICY "daily_news_public_read" ON public.daily_news
  FOR SELECT USING (status = 'published');

CREATE POLICY "newsletter_admin_only" ON public.newsletter_subscribers
  FOR ALL USING (false);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update article views
CREATE OR REPLACE FUNCTION public.update_article_views(article_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = article_uuid AND status = 'published';
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creators_updated_at
  BEFORE UPDATE ON public.creators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_news_updated_at
  BEFORE UPDATE ON public.daily_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_category ON public.articles(category_id);
CREATE INDEX idx_articles_creator ON public.articles(creator_id);
CREATE INDEX idx_articles_published_at ON public.articles(published_at);
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_subcategories_category ON public.subcategories(category_id);
CREATE INDEX idx_creators_status ON public.creators(status);
CREATE INDEX idx_daily_news_status ON public.daily_news(status);
CREATE INDEX idx_daily_news_published_date ON public.daily_news(published_date);

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, order_index) VALUES
('기술', 'tech', '최신 기술 트렌드와 정보', 1),
('라이프스타일', 'lifestyle', '일상 생활과 문화 관련 내용', 2),
('비즈니스', 'business', '경영과 비즈니스 관련 정보', 3);

-- Insert sample subcategories
INSERT INTO public.subcategories (name, slug, category_id, order_index)
SELECT 
  subcategory_name,
  subcategory_slug,
  c.id,
  subcategory_order
FROM (
  VALUES 
    ('AI/머신러닝', 'ai-ml', '기술', 1),
    ('웹 개발', 'web-dev', '기술', 2),
    ('건강', 'health', '라이프스타일', 1),
    ('여행', 'travel', '라이프스타일', 2),
    ('스타트업', 'startup', '비즈니스', 1),
    ('마케팅', 'marketing', '비즈니스', 2)
) AS sub_data(subcategory_name, subcategory_slug, category_name, subcategory_order)
JOIN public.categories c ON c.name = sub_data.category_name;

-- Insert sample creators
INSERT INTO public.creators (name, profession, bio, verified, status) VALUES
('김테크', '개발자', '10년차 풀스택 개발자입니다.', true, 'active'),
('박라이프', '라이프스타일 에디터', '일상의 소소한 행복을 찾는 에디터입니다.', true, 'active'),
('이비즈', '비즈니스 컨설턴트', '스타트업과 중소기업을 위한 컨설팅을 합니다.', false, 'active');