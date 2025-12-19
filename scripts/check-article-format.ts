import { supabase } from '../src/integrations/supabase/client';

async function checkArticle() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, content')
    .eq('id', '3efbae83-616f-4d34-bcf1-68c372ac43c5')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📰 기사 제목:', data.title);
  console.log('📏 본문 길이:', data.content.length, '자\n');
  console.log('📄 본문 내용:\n');
  console.log(data.content);
  console.log('\n');

  // 빈 줄 개수 확인
  const emptyLines = (data.content.match(/\n\n/g) || []).length;
  console.log('📐 문단 구분 (빈 줄):', emptyLines, '개');

  // ## 제목 개수 확인
  const headings = (data.content.match(/^## /gm) || []).length;
  console.log('📑 섹션 제목 (##):', headings, '개');
}

checkArticle();
