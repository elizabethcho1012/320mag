import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteWrongArticle() {
  console.log('\n🗑️  잘못 분류된 기사 삭제\n');

  // 운동 카테고리의 모든 기사 조회
  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      categories!inner(name, slug)
    `)
    .eq('categories.slug', 'exercise')
    .eq('status', 'published');

  if (error) {
    console.error('❌ 기사 조회 실패:', error.message);
    return;
  }

  console.log(`📊 운동 카테고리 기사: ${articles?.length || 0}개\n`);

  if (!articles || articles.length === 0) {
    console.log('✅ 삭제할 기사 없음');
    return;
  }

  // Wesley Memorial Monument 찾기
  const wrongArticle = articles.find(article =>
    article.title.includes('Wesley Memorial Monument') ||
    article.title.includes('Wesley') ||
    article.slug.includes('wesley')
  );

  if (!wrongArticle) {
    console.log('⚠️  Wesley Memorial Monument 기사를 찾을 수 없음');
    console.log('\n현재 운동 카테고리 기사 목록:');
    articles.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title}`);
    });
    return;
  }

  console.log(`🎯 발견: ${wrongArticle.title}\n`);

  // 삭제
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('id', wrongArticle.id);

  if (deleteError) {
    console.error('❌ 삭제 실패:', deleteError.message);
    return;
  }

  console.log('✅ 삭제 완료!\n');

  // 최종 확인
  const { data: remainingArticles } = await supabase
    .from('articles')
    .select(`
      id,
      categories!inner(slug)
    `)
    .eq('categories.slug', 'exercise')
    .eq('status', 'published');

  console.log(`📊 운동 카테고리 남은 기사: ${remainingArticles?.length || 0}개`);
}

deleteWrongArticle();
