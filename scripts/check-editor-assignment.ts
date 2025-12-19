import { supabase } from '../src/integrations/supabase/client';

async function checkEditorAssignment() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      editor_id,
      editors(name, profession)
    `)
    .limit(5)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📰 최근 기사의 에디터 정보:\n');
  articles?.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
    console.log(`   Editor ID: ${article.editor_id || '❌ 없음'}`);
    console.log(`   Editor Name: ${article.editors?.name || '❌ 연결 안됨'}`);
    console.log(`   Profession: ${article.editors?.profession || '-'}`);
    console.log('');
  });
}

checkEditorAssignment();
