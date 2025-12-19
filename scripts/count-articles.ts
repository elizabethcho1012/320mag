import { supabase } from '../src/integrations/supabase/client';

async function countArticles() {
  const { data, error, count } = await supabase
    .from('articles')
    .select('id, title, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n📊 총 기사 수: ${count}개\n`);

  if (data && data.length > 0) {
    console.log('최근 20개 기사:');
    data.slice(0, 20).forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} (${article.created_at})`);
    });
  }
}

countArticles();
