import { supabase } from '../src/integrations/supabase/client';

async function checkArticle() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, content, editor_id, featured_image_url, additional_images')
    .eq('id', '6ad96406-8073-458d-a941-7f4570a40e6f')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('\n📰 기사 정보:');
  console.log('제목:', data.title);
  console.log('본문 길이:', data.content.length, '자');
  console.log('Editor ID:', data.editor_id);
  console.log('메인 이미지:', data.featured_image_url?.substring(0, 80) + '...');
  console.log('추가 이미지:', data.additional_images);
  console.log('\n📄 본문 전체:');
  console.log(data.content);
  console.log('\n');
}

checkArticle();
