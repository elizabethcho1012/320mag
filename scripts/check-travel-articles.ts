import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTravelArticles() {
  console.log('\n🔍 여행 카테고리 분석\n');

  // 1. 여행 카테고리 조회
  const { data: travelCategory } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', '여행')
    .single();

  if (!travelCategory) {
    console.error('❌ 여행 카테고리를 찾을 수 없습니다');
    return;
  }

  console.log('✅ 여행 카테고리:', travelCategory);

  // 2. 여행 카테고리의 서브카테고리 조회
  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('id, name, slug')
    .eq('category_id', travelCategory.id);

  console.log('\n📋 서브카테고리 목록:', subcategories);
  console.log(`총 ${subcategories?.length || 0}개의 서브카테고리`);

  // 3. 여행 카테고리의 모든 기사 조회
  const { data: allArticles } = await supabase
    .from('articles')
    .select('id, title, subcategory_id, featured_image_url, created_at')
    .eq('category_id', travelCategory.id)
    .order('created_at', { ascending: false });

  console.log('\n📰 여행 카테고리 전체 기사:', allArticles?.length || 0, '개');

  // 서브카테고리별 통계
  console.log('\n📊 서브카테고리별 기사 수:');
  const subcategoryStats = new Map();

  allArticles?.forEach(article => {
    const subId = article.subcategory_id || 'NULL';
    subcategoryStats.set(subId, (subcategoryStats.get(subId) || 0) + 1);
  });

  subcategoryStats.forEach((count, subId) => {
    if (subId === 'NULL') {
      console.log(`  - NULL (서브카테고리 미지정): ${count}개`);
    } else {
      const sub = subcategories?.find(s => s.id === subId);
      console.log(`  - ${sub?.name || subId}: ${count}개`);
    }
  });

  // 4. 최근 5개 기사 상세 정보
  console.log('\n📝 최근 5개 기사:');
  allArticles?.slice(0, 5).forEach((article, index) => {
    const sub = subcategories?.find(s => s.id === article.subcategory_id);
    console.log(`\n  ${index + 1}. ${article.title}`);
    console.log(`     - subcategory: ${sub?.name || 'NULL ⚠️'}`);
    console.log(`     - image: ${article.featured_image_url?.substring(0, 60)}...`);
  });

  // 5. 중복 이미지 체크
  console.log('\n🖼️  이미지 중복 체크:');
  const imageMap = new Map();
  allArticles?.forEach(article => {
    if (article.featured_image_url) {
      const existing = imageMap.get(article.featured_image_url) || [];
      existing.push(article.title);
      imageMap.set(article.featured_image_url, existing);
    }
  });

  let hasDuplicates = false;
  imageMap.forEach((titles, imageUrl) => {
    if (titles.length > 1) {
      hasDuplicates = true;
      console.log(`\n  ⚠️  중복 이미지 발견:`);
      console.log(`  이미지: ${imageUrl.substring(0, 60)}...`);
      console.log(`  사용 기사:`);
      titles.forEach(title => console.log(`    - ${title}`));
    }
  });

  if (!hasDuplicates) {
    console.log('  ✅ 중복 이미지 없음');
  }
}

checkTravelArticles();
