import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getSmartUnsplashUrl } from '../src/services/imageService';

// .env 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function reapplyImages() {
  console.log('🔄 최근 기사 이미지 재적용 중...\n');

  // 최근 30개 기사 조회
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      excerpt,
      content,
      featured_image_url,
      categories(name)
    `)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('❌ 기사가 없습니다.');
    return;
  }

  console.log(`📝 최근 기사 ${articles.length}개 이미지 재적용\n`);

  let updated = 0;

  for (const article of articles) {
    const category = (article.categories as any)?.name || '라이프스타일';
    const title = article.title || '';
    const content = article.excerpt || article.content || '';

    // 스마트 이미지 URL 생성 (개선된 로직 + articleId로 중복 방지)
    const imageUrl = getSmartUnsplashUrl(title, content, category, 800, 600, article.id);

    // 현재 이미지와 새 이미지 비교
    if (article.featured_image_url !== imageUrl) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ featured_image_url: imageUrl })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ [${article.id}] 업데이트 실패:`, updateError.message);
      } else {
        updated++;
        console.log(`✅ [${updated}] "${article.title.substring(0, 50)}..."`);
        console.log(`   ${category} → ${imageUrl.substring(0, 70)}...\n`);
      }
    }
  }

  console.log(`\n🎉 완료! ${updated}개 기사 이미지 재적용됨`);
}

reapplyImages().catch(console.error);
