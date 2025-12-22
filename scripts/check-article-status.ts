import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticleStatus() {
  console.log('\n📊 카테고리별 기사 현황\n');

  // 1. 9개 카테고리의 기사 개수 확인
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (!categories) {
    console.error('카테고리를 불러올 수 없습니다.');
    return;
  }

  console.log(`총 카테고리 개수: ${categories.length}개\n`);

  let totalArticles = 0;
  const categoryStats: any[] = [];

  for (const cat of categories) {
    const { data: articles, count } = await supabase
      .from('articles')
      .select('id, title', { count: 'exact' })
      .eq('category_id', cat.id)
      .eq('status', 'published');

    const articleCount = count || 0;
    totalArticles += articleCount;

    categoryStats.push({
      name: cat.name,
      slug: cat.slug,
      count: articleCount,
    });

    const status = articleCount >= 4 ? '✅' : '⚠️';
    console.log(`${status} ${cat.name} (${cat.slug}): ${articleCount}개 기사`);
  }

  console.log(`\n총 기사 개수: ${totalArticles}개`);

  // 2. 4개 미만인 카테고리 확인
  const underFilled = categoryStats.filter(c => c.count < 4);
  if (underFilled.length > 0) {
    console.log('\n⚠️  4개 미만 카테고리:');
    underFilled.forEach(c => {
      console.log(`   ${c.name}: ${c.count}개 (${4 - c.count}개 부족)`);
    });
  } else {
    console.log('\n✅ 모든 카테고리가 4개 이상의 기사를 보유하고 있습니다.');
  }

  // 3. 카테고리가 NULL인 기사 확인
  const { data: orphanedArticles, count: orphanedCount } = await supabase
    .from('articles')
    .select('id, title', { count: 'exact' })
    .is('category_id', null)
    .eq('status', 'published');

  if (orphanedCount && orphanedCount > 0) {
    console.log(`\n⚠️  카테고리가 없는 기사: ${orphanedCount}개`);
    orphanedArticles?.slice(0, 5).forEach((article, i) => {
      console.log(`   ${i + 1}. ${article.title.substring(0, 60)}...`);
    });
    if (orphanedCount > 5) {
      console.log(`   ... 외 ${orphanedCount - 5}개`);
    }
  } else {
    console.log('\n✅ 카테고리가 없는 기사가 없습니다.');
  }

  console.log('\n');
}

checkArticleStatus();
