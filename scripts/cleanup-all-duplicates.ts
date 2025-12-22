import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupAllDuplicates() {
  console.log('\n🧹 전체 중복 이미지 정리 시작\n');

  // 모든 기사 조회
  const { data: allArticles } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, categories(name), created_at')
    .order('created_at', { ascending: false });

  if (!allArticles || allArticles.length === 0) {
    console.log('기사가 없습니다.');
    return;
  }

  console.log(`📰 전체 기사: ${allArticles.length}개\n`);

  // 이미지 URL별로 그룹화
  const imageMap = new Map<string, typeof allArticles>();

  for (const article of allArticles) {
    if (article.featured_image_url) {
      const existing = imageMap.get(article.featured_image_url) || [];
      existing.push(article);
      imageMap.set(article.featured_image_url, existing);
    }
  }

  // 중복 처리
  let totalDeleted = 0;
  let duplicateCount = 0;

  for (const [imageUrl, articles] of imageMap) {
    if (articles.length > 1) {
      duplicateCount++;
      console.log(`\n${duplicateCount}. 중복 이미지 (${articles.length}개 기사)`);
      console.log(`   이미지: ${imageUrl.substring(0, 80)}...`);
      console.log(`   카테고리: ${articles[0].categories?.name || 'Unknown'}`);

      // 가장 오래된 것(마지막) 유지, 나머지 삭제
      const toKeep = articles[articles.length - 1];
      const toDelete = articles.slice(0, -1);

      console.log(`\n   ✅ 유지: "${toKeep.title}" (${toKeep.created_at})`);
      console.log(`\n   삭제할 기사 (${toDelete.length}개):`);

      for (const article of toDelete) {
        console.log(`     - "${article.title}" (${article.created_at})`);

        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', article.id);

        if (error) {
          console.error(`       ❌ 삭제 실패:`, error.message);
        } else {
          console.log(`       ✅ 삭제 완료`);
          totalDeleted++;
        }
      }
    }
  }

  console.log(`\n\n📊 정리 완료!`);
  console.log(`   - 중복 이미지 그룹: ${duplicateCount}개`);
  console.log(`   - 삭제된 기사: ${totalDeleted}개`);
  console.log(`   - 남은 기사: ${allArticles.length - totalDeleted}개`);
}

cleanupAllDuplicates();
