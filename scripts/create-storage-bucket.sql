-- Storage 버킷 생성 스크립트
-- Supabase SQL Editor에서 실행하세요

-- voice-challenges 버킷 생성 (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-challenges',
  'voice-challenges',
  true,  -- public bucket (음성 파일 공개 액세스)
  52428800,  -- 50MB 파일 크기 제한
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']  -- 오디오 파일만 허용
)
ON CONFLICT (id) DO NOTHING;

-- 확인
SELECT id, name, public, created_at FROM storage.buckets WHERE id = 'voice-challenges';
