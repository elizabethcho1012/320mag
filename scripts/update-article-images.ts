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

async function updateArticleImages() {
  console.log('🖼️  이미지 없는 기사에 스마트 이미지 적용 중...\n');

  // 이미지가 없는 기사 조회
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
    .is('featured_image_url', null)
    .limit(20);

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ 모든 기사에 이미지가 있습니다!');
    return;
  }

  console.log(`📝 이미지가 없는 기사 ${articles.length}개 발견\n`);

  let updated = 0;

  for (const article of articles) {
    const category = (article.categories as any)?.name || '라이프스타일';
    const title = article.title || '';
    const content = article.excerpt || article.content || '';

    // 스마트 이미지 URL 생성 (제목/내용 기반으로 관련성 높은 이미지 선택)
    const imageUrl = getSmartUnsplashUrl(title, content, category, 800, 600);

    // 이미지 URL 업데이트
    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured_image_url: imageUrl })
      .eq('id', article.id);

    if (updateError) {
      console.error(`❌ [${article.id}] 업데이트 실패:`, updateError.message);
    } else {
      updated++;
      console.log(`✅ [${updated}/${articles.length}] "${article.title.substring(0, 40)}..."`);
      console.log(`   카테고리: ${category} → 이미지: ${imageUrl.substring(0, 60)}...\n`);
    }
  }

  console.log(`\n🎉 완료! ${updated}개 기사 이미지 업데이트됨`);
}

updateArticleImages().catch(console.error);
