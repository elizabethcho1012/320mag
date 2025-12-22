import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDBStatus() {
  console.log('\n📊 데이터베이스 현황\n');

  // 1. 에디터 수
  const { data: editors, count: editorCount } = await supabase
    .from('editors')
    .select('*', { count: 'exact' });

  console.log('👤 에디터:');
  console.log(`   총 ${editorCount}명\n`);
  editors?.forEach((editor, i) => {
    console.log(`   ${i + 1}. ${editor.name} (${editor.email || 'email 없음'})`);
  });

  // 2. 메인 카테고리 수
  const { data: categories, count: categoryCount } = await supabase
    .from('categories')
    .select('id, name, slug, subcategories(count)', { count: 'exact' })
    .order('name');

  console.log('\n\n📂 메인 카테고리:');
  console.log(`   총 ${categoryCount}개\n`);

  for (const category of categories || []) {
    const { count: subCount } = await supabase
      .from('subcategories')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id);

    console.log(`   - ${category.name} (slug: ${category.slug})`);
    console.log(`     서브카테고리: ${subCount}개`);
  }

  // 3. 전체 기사 수
  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log('\n\n📰 기사:');
  console.log(`   총 ${articleCount}개\n`);

  // 4. 카테고리별 기사 수
  const { data: articlesByCategory } = await supabase
    .from('articles')
    .select('categories(name)');

  const categoryStats = new Map<string, number>();
  articlesByCategory?.forEach(article => {
    const catName = (article as any).categories?.name || 'Unknown';
    categoryStats.set(catName, (categoryStats.get(catName) || 0) + 1);
  });

  console.log('   카테고리별 기사 수:');
  Array.from(categoryStats.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(`     - ${name}: ${count}개`);
    });
}

checkDBStatus();
