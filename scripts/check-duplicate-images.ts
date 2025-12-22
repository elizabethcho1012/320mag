import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicateImages() {
  console.log('\n🔍 카테고리별 기사 및 이미지 중복 확인\n');

  // 데이터베이스에서 모든 카테고리 조회
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');

  if (catError) {
    console.error('❌ 카테고리 조회 실패:', catError.message);
    return;
  }

  if (!categories || categories.length === 0) {
    console.log('⚠️  카테고리가 없습니다.');
    return;
  }

  for (const category of categories) {
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        featured_image_url,
        categories!inner(name, slug)
      `)
      .eq('categories.slug', category.slug)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error(`❌ ${category.name} 조회 실패:`, error.message);
      continue;
    }

    console.log(`\n📂 ${category.name} (${category.slug}): ${articles?.length || 0}개`);

    if (!articles || articles.length === 0) {
      console.log('  ⚠️  기사 없음');
      continue;
    }

    // 이미지 URL별로 그룹화
    const imageGroups = new Map<string, any[]>();
    articles.forEach(article => {
      const imageUrl = article.featured_image_url || 'NO_IMAGE';
      if (!imageGroups.has(imageUrl)) {
        imageGroups.set(imageUrl, []);
      }
      imageGroups.get(imageUrl)!.push(article);
    });

    // 중복 이미지 표시
    imageGroups.forEach((articlesWithSameImage, imageUrl) => {
      if (articlesWithSameImage.length > 1) {
        console.log(`\n  🔴 중복 이미지 (${articlesWithSameImage.length}개 기사):`);
        console.log(`     ${imageUrl.substring(0, 80)}...`);
        articlesWithSameImage.forEach(article => {
          console.log(`     - ${article.title.substring(0, 50)}...`);
        });
      }
    });

    // 모든 기사 목록
    console.log(`\n  📋 전체 기사 목록:`);
    articles.forEach((article, i) => {
      const imagePreview = article.featured_image_url
        ? article.featured_image_url.substring(0, 60) + '...'
        : 'NO IMAGE';
      console.log(`     ${i + 1}. ${article.title.substring(0, 40)}...`);
      console.log(`        이미지: ${imagePreview}`);
    });
  }
}

checkDuplicateImages();
