import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubcategories() {
  console.log('\n🔍 서브카테고리 테스트\n');

  // 1. 패션 카테고리 조회
  const { data: fashionCategory } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', '패션')
    .single();

  if (!fashionCategory) {
    console.error('❌ 패션 카테고리를 찾을 수 없습니다');
    return;
  }

  console.log('✅ 패션 카테고리:', fashionCategory);

  // 2. 패션 카테고리의 서브카테고리 조회
  const { data: subcategories, error } = await supabase
    .from('subcategories')
    .select('id, name, slug')
    .eq('category_id', fashionCategory.id)
    .neq('name', 'ALL');

  if (error) {
    console.error('❌ 서브카테고리 조회 실패:', error);
    return;
  }

  console.log('\n📋 서브카테고리 목록:', subcategories);
  console.log(`총 ${subcategories?.length || 0}개의 서브카테고리`);

  // 3. 최근 생성된 패션 기사 확인
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title, category_id, subcategory_id')
    .eq('category_id', fashionCategory.id)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n📰 최근 패션 기사:');
  recentArticles?.forEach((article, index) => {
    console.log(`  ${index + 1}. ${article.title}`);
    console.log(`     - subcategory_id: ${article.subcategory_id || 'NULL ⚠️'}`);
  });
}

testSubcategories();
