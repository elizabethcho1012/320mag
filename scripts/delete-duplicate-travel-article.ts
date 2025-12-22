import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicateArticle() {
  console.log('\n🗑️  중복 이미지 기사 삭제\n');

  const imagePattern = '%media.self.com/photos/64c3d5e263eebff1c9ad5183%';

  // 중복 이미지를 사용하는 기사들 조회
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, created_at, featured_image_url')
    .like('featured_image_url', imagePattern)
    .order('created_at', { ascending: true }); // 오래된 것부터

  if (!articles || articles.length === 0) {
    console.log('❌ 중복 이미지를 사용하는 기사를 찾을 수 없습니다.');
    return;
  }

  console.log(`📰 중복 이미지를 사용하는 기사: ${articles.length}개`);
  articles.forEach((article, index) => {
    console.log(`  ${index + 1}. ${article.title} (${article.created_at})`);
  });

  if (articles.length <= 1) {
    console.log('\n✅ 중복이 아닙니다. 삭제할 필요 없음.');
    return;
  }

  // 두 번째 기사 삭제 (더 최근 것을 삭제, 오래된 것은 유지)
  const articleToDelete = articles[1];

  console.log(`\n🗑️  삭제할 기사: "${articleToDelete.title}"`);

  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', articleToDelete.id);

  if (error) {
    console.error('❌ 삭제 실패:', error);
    return;
  }

  console.log('✅ 삭제 완료!');
  console.log(`\n남은 기사: "${articles[0].title}"`);
}

deleteDuplicateArticle();
