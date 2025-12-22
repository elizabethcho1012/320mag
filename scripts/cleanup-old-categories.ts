import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 구 카테고리 완전 정리
 * - subcategories 테이블과의 관계 때문에 삭제 실패했던 카테고리들을 정리
 */

async function cleanupOldCategories() {
  console.log('\n🗑️  구 카테고리 완전 정리 시작\n');

  const oldCategories = ['health-food', 'global-food', 'global-trends', 'exercise'];

  for (const slug of oldCategories) {
    console.log(`\n처리 중: ${slug}`);

    // 1. 카테고리 ID 찾기
    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', slug)
      .single();

    if (!category) {
      console.log(`  ✅ "${slug}" 이미 삭제됨`);
      continue;
    }

    console.log(`  📊 "${category.name}" (ID: ${category.id})`);

    // 2. 이 카테고리와 연결된 articles 확인
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title')
      .eq('category_id', category.id);

    console.log(`     연결된 기사: ${articles?.length || 0}개`);

    if (articles && articles.length > 0) {
      console.log(`  ⚠️  아직 ${articles.length}개 기사가 연결되어 있음!`);
      console.log(`     기사 목록:`);
      articles.forEach((article, i) => {
        console.log(`     ${i + 1}. ${article.title.substring(0, 50)}...`);
      });

      // 기사가 있으면 건너뜀
      console.log(`  ❌ 기사가 있어서 삭제 불가능`);
      continue;
    }

    // 3. 이 카테고리와 연결된 subcategories 찾기
    const { data: subcategories } = await supabase
      .from('subcategories')
      .select('id, name')
      .eq('category_id', category.id);

    if (subcategories && subcategories.length > 0) {
      console.log(`     서브카테고리: ${subcategories.length}개 처리 중...`);

      // 3-1. 각 서브카테고리에 연결된 기사의 subcategory_id를 NULL로 업데이트
      for (const subcat of subcategories) {
        const { error: updateError } = await supabase
          .from('articles')
          .update({ subcategory_id: null })
          .eq('subcategory_id', subcat.id);

        if (updateError) {
          console.error(`  ❌ 기사 업데이트 실패 (subcategory ${subcat.name}):`, updateError.message);
        }
      }

      // 3-2. 이제 서브카테고리 삭제
      const { error: subError } = await supabase
        .from('subcategories')
        .delete()
        .eq('category_id', category.id);

      if (subError) {
        console.error(`  ❌ 서브카테고리 삭제 실패:`, subError.message);
        continue;
      }

      console.log(`  ✅ 서브카테고리 ${subcategories.length}개 삭제 완료`);
    }

    // 4. 카테고리 삭제
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id);

    if (error) {
      console.error(`  ❌ 카테고리 삭제 실패:`, error.message);
    } else {
      console.log(`  ✅ "${category.name}" 카테고리 삭제 완료`);
    }
  }

  // 5. 최종 확인
  console.log('\n\n📊 최종 상태 확인...\n');

  const { data: remainingCategories } = await supabase
    .from('categories')
    .select('name, slug')
    .order('order_index');

  console.log(`총 카테고리 개수: ${remainingCategories?.length || 0}개\n`);

  for (const cat of remainingCategories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .eq('category_id', cat.id!)
      .eq('status', 'published');

    const { data: subcats } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', cat.id!);

    console.log(`  ✅ ${cat.name} (${cat.slug}): ${articles?.length || 0}개 기사, ${subcats?.length || 0}개 서브카테고리`);
  }

  console.log('\n✨ 정리 완료!\n');
}

cleanupOldCategories();
