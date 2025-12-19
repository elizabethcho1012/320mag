import { supabase } from '../src/integrations/supabase/client';

async function deleteAllArticles() {
  console.log('🗑️  모든 기사 삭제 시작...\n');

  // 모든 기사 조회
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title');

  if (fetchError) {
    console.error('❌ 기사 조회 실패:', fetchError);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('📭 삭제할 기사가 없습니다.');
    return;
  }

  console.log(`📊 총 ${articles.length}개 기사 발견\n`);

  // 모든 기사 삭제
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 기사 삭제

  if (deleteError) {
    console.error('❌ 삭제 실패:', deleteError);
    return;
  }

  console.log(`✅ ${articles.length}개 기사 삭제 완료\n`);

  // 삭제된 기사 목록 출력
  console.log('삭제된 기사 목록:');
  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title}`);
  });
}

deleteAllArticles();
