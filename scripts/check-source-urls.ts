import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSourceUrls() {
  console.log('\n🔍 중복 이미지 기사의 원본 URL 확인\n');

  // 패션 카테고리 중복 확인
  const { data: fashionArticles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      featured_image_url,
      source_url,
      categories!inner(name, slug)
    `)
    .eq('categories.slug', 'fashion')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ 조회 실패:', error.message);
    return;
  }

  console.log('📂 패션 카테고리:\n');

  // 이미지 URL별로 그룹화
  const imageGroups = new Map<string, any[]>();
  fashionArticles?.forEach(article => {
    const imageUrl = article.featured_image_url || 'NO_IMAGE';
    if (!imageGroups.has(imageUrl)) {
      imageGroups.set(imageUrl, []);
    }
    imageGroups.get(imageUrl)!.push(article);
  });

  // 중복 이미지만 표시
  imageGroups.forEach((articlesWithSameImage, imageUrl) => {
    if (articlesWithSameImage.length > 1) {
      console.log(`\n🔴 중복 이미지 (${articlesWithSameImage.length}개):`);
      console.log(`   이미지: ${imageUrl.substring(0, 80)}...\n`);

      articlesWithSameImage.forEach((article, i) => {
        console.log(`   ${i + 1}. 제목: ${article.title}`);
        console.log(`      원본 URL: ${article.source_url || 'N/A'}`);
        console.log(`      ID: ${article.id}\n`);
      });
    }
  });
}

checkSourceUrls();
