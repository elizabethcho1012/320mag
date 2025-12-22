import dotenv from 'dotenv';

// Load environment variables FIRST before importing any modules that use them
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function trimExcessCategories() {
  console.log('\n✂️  초과 카테고리 정리 (4개로)\n');

  // 데이터베이스에서 모든 카테고리 조회
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');

  if (catError) {
    console.error('❌ 카테고리 조회 실패:', catError.message);
    return;
  }

  let totalDeleted = 0;

  for (const category of categories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        published_at,
        categories!inner(slug)
      `)
      .eq('categories.slug', category.slug)
      .eq('status', 'published')
      .order('published_at', { ascending: true }); // 오래된 순

    const count = articles?.length || 0;

    if (count > 4) {
      const excess = count - 4;
      console.log(`\n📂 ${category.name} (${category.slug}): ${count}개 → 4개 (${excess}개 삭제)`);

      const toDelete = articles?.slice(0, excess) || [];

      for (const article of toDelete) {
        console.log(`  ❌ 삭제: ${article.title.substring(0, 60)}...`);

        const { error: deleteError } = await supabase
          .from('articles')
          .delete()
          .eq('id', article.id);

        if (deleteError) {
          console.error(`     실패: ${deleteError.message}`);
        } else {
          console.log(`     ✅ 삭제 완료`);
          totalDeleted++;
        }
      }
    } else if (count === 4) {
      console.log(`✅ ${category.name}: ${count}/4 (유지)`);
    } else {
      console.log(`⚠️  ${category.name}: ${count}/4 (부족)`);
    }
  }

  console.log(`\n\n📊 정리 완료: 총 ${totalDeleted}개 기사 삭제됨`);
}

trimExcessCategories();
