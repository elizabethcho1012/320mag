import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkFeaturedImages() {
  console.log('🖼️  Featured 이미지 확인 중...\n');

  // Featured 기사 조회
  const { data: featured, error: featuredError } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, categories(name), created_at')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  console.log('=== Featured 기사 ===');
  if (featured && featured.length > 0) {
    console.log(`총 ${featured.length}개의 featured 기사:\n`);
    featured.forEach((article, idx) => {
      console.log(`[${idx + 1}] ${article.title}`);
      console.log(`   카테고리: ${(article.categories as any)?.name || 'N/A'}`);
      console.log(`   이미지 URL: ${article.featured_image_url || 'NULL'}`);
      console.log(`   생성일: ${new Date(article.created_at).toLocaleString('ko-KR')}\n`);
    });
  } else {
    console.log('Featured 기사가 없습니다.\n');
  }

  // 최근 3개 기사 조회 (featured가 없을 경우 대체용)
  const { data: recent, error: recentError } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, categories(name), created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('\n=== 최근 3개 기사 (Featured 대체용) ===');
  if (recent && recent.length > 0) {
    recent.forEach((article, idx) => {
      console.log(`[${idx + 1}] ${article.title}`);
      console.log(`   카테고리: ${(article.categories as any)?.name || 'N/A'}`);
      console.log(`   이미지 URL: ${article.featured_image_url || 'NULL'}`);
      console.log(`   생성일: ${new Date(article.created_at).toLocaleString('ko-KR')}\n`);
    });
  }

  // 이미지 URL 중복 체크
  console.log('\n=== 이미지 URL 중복 체크 ===');
  const allImages = [...(featured || []), ...(recent || [])];
  const imageCount: Record<string, number> = {};

  allImages.forEach(article => {
    const url = article.featured_image_url || 'NULL';
    imageCount[url] = (imageCount[url] || 0) + 1;
  });

  Object.entries(imageCount).forEach(([url, count]) => {
    if (count > 1) {
      console.log(`⚠️  ${count}번 사용: ${url.substring(0, 80)}...`);
    }
  });

  if (Object.values(imageCount).every(c => c === 1)) {
    console.log('✅ 모든 이미지가 고유합니다!');
  }
}

checkFeaturedImages().catch(console.error);
