// 라이프스타일 카테고리 완전 제거
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeLifestyleFinal() {
  console.log('🔧 라이프스타일 카테고리 최종 제거...\n');

  // 1. 라이프스타일 카테고리 ID 가져오기
  const { data: lifestyleCategory } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', 'lifestyle')
    .single();

  if (!lifestyleCategory) {
    console.log('✅ 라이프스타일 카테고리가 이미 없습니다.');
    return;
  }

  console.log(`📂 라이프스타일 카테고리 ID: ${lifestyleCategory.id}\n`);

  // 2. 라이프스타일의 서브카테고리 ID 찾기
  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('id')
    .eq('category_id', lifestyleCategory.id);

  const subcategoryIds = subcategories?.map(s => s.id) || [];
  const subcategoryCount = subcategoryIds.length;
  console.log(`📝 서브카테고리: ${subcategoryCount}개\n`);

  // 3. 이 서브카테고리를 참조하는 기사의 subcategory_id를 NULL로
  if (subcategoryCount > 0) {
    console.log('🔄 기사의 subcategory_id NULL 처리 중...');
    const { error: updateSubError } = await supabase
      .from('articles')
      .update({ subcategory_id: null })
      .in('subcategory_id', subcategoryIds);

    if (updateSubError) {
      console.error('❌ 실패:', updateSubError);
      return;
    }
    console.log('✅ 완료\n');
  }

  // 4. 서브카테고리 삭제
  if (subcategoryCount > 0) {
    console.log('🗑️  서브카테고리 삭제 중...');
    const { error: deleteSubError } = await supabase
      .from('subcategories')
      .delete()
      .in('id', subcategoryIds);

    if (deleteSubError) {
      console.error('❌ 실패:', deleteSubError);
      return;
    }
    console.log('✅ 완료\n');
  }

  // 5. 라이프스타일 카테고리 삭제
  console.log('🗑️  라이프스타일 카테고리 삭제 중...');
  const { error: deleteCatError } = await supabase
    .from('categories')
    .delete()
    .eq('id', lifestyleCategory.id);

  if (deleteCatError) {
    console.error('❌ 실패:', deleteCatError);
    return;
  }
  console.log('✅ 완료!\n');

  // 6. 최종 카테고리 목록
  const { data: finalCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const finalCategoryCount = finalCategories?.length || 0;
  console.log(`📂 최종 카테고리 목록 (${finalCategoryCount}개):`);
  finalCategories?.forEach((cat, idx) => {
    console.log(`   ${idx + 1}. ${cat.name} (${cat.slug})`);
  });

  // 7. 카테고리별 통계
  const { data: allArticles } = await supabase
    .from('articles')
    .select('category_id');

  const categoryCounts = new Map<string, number>();
  finalCategories?.forEach(cat => categoryCounts.set(cat.id, 0));

  allArticles?.forEach(art => {
    const count = categoryCounts.get(art.category_id) || 0;
    categoryCounts.set(art.category_id, count + 1);
  });

  console.log('\n📈 카테고리별 기사 현황:');
  finalCategories?.forEach(cat => {
    const count = categoryCounts.get(cat.id) || 0;
    console.log(`   ${cat.name}: ${count}개`);
  });

  const totalArticles = allArticles?.length || 0;
  console.log(`\n   총 기사: ${totalArticles}개`);

  console.log('\n✅ 라이프스타일 카테고리 제거 완료!');
}

removeLifestyleFinal();
