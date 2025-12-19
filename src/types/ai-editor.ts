// AI 에디터 시스템 관련 타입 정의

export interface AIEditorDB {
  id: string;
  editor_id: string;
  name: string;
  name_en: string;
  age: number;
  category: string;
  profession: string;
  background: string | null;
  personality: string | null;
  tone: string | null;
  writing_style: string | null;
  catchphrase: string | null;
  expertise: string[];
  avatar: string | null;
  prompt_template: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  article_id: string;
  user_id: string;
  participation_type: 'voice' | 'text';
  voice_url: string | null;
  text_content: string;
  voice_duration: number | null;
  likes_count: number;
  replies_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  // 조인 데이터
  user_profile?: UserProfile;
}

export interface ChallengeReply {
  id: string;
  challenge_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // 조인 데이터
  user_profile?: UserProfile;
}

export interface ChallengeLike {
  id: string;
  challenge_id: string;
  user_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  age: number | null;
  bio: string | null;
  avatar_url: string | null;
  challenge_level: 'newcomer' | 'growing' | 'tree' | 'expert' | 'master';
  challenges_count: number;
  likes_received: number;
  created_at: string;
  updated_at: string;
}

export interface PushSettings {
  id: string;
  user_id: string;
  fcm_token: string | null;
  subscribed_editors: string[];
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  community_notifications: boolean;
  weekly_digest: boolean;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentSource {
  id: string;
  source_type: 'rss' | 'api' | 'web_scraping';
  source_url: string;
  source_name: string;
  category: string;
  is_active: boolean;
  fetch_frequency: 'hourly' | 'daily' | 'weekly';
  last_fetched_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RawContentCache {
  id: string;
  source_id: string;
  original_url: string;
  title: string;
  content: string;
  published_date: string | null;
  author: string | null;
  category: string;
  is_processed: boolean;
  ai_rewritten_article_id: string | null;
  created_at: string;
}

// 확장된 Article 타입
export interface AIArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  creator_id: string | null;
  author_name: string | null;
  featured_image_id: string | null;
  featured_image_url: string | null;
  read_time: string | null;
  featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  status: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  view_count: number | null;
  like_count: number | null;
  share_count: number | null;
  created_at: string | null;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  // AI 시스템 추가 필드
  ai_editor_id: string | null;
  source_urls: string[] | null;
  ai_generated_image: string | null;
  challenge_question: string | null;
  challenge_participants_count: number;
  is_ai_generated: boolean;
  // 조인 데이터
  ai_editor?: AIEditorDB;
  challenges?: Challenge[];
}

// 챌린지 생성 요청
export interface CreateChallengeRequest {
  article_id: string;
  participation_type: 'voice' | 'text';
  text_content: string;
  voice_url?: string;
  voice_duration?: number;
}

// 레벨 뱃지 정보
export const CHALLENGE_LEVELS = {
  newcomer: { label: '새싹', icon: '🌱', min: 0, max: 10 },
  growing: { label: '성장', icon: '🌿', min: 11, max: 30 },
  tree: { label: '나무', icon: '🌳', min: 31, max: 100 },
  expert: { label: '전문가', icon: '🏅', min: 101, max: 300 },
  master: { label: '마스터', icon: '👑', min: 301, max: Infinity },
} as const;
