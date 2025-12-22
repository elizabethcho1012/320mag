import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDuplicateImages() {
  console.log('\n🗑️  중복 이미지 기사 삭제\n');

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('❌ 조회 실패:', error.message);
    return;
  }

  // 이미지 URL별로 그룹화
  const imageGroups = new Map<string, any[]>();
  articles?.forEach(article => {
    const imageUrl = article.featured_image_url;
    if (!imageUrl) return;

    if (!imageGroups.has(imageUrl)) {
      imageGroups.set(imageUrl, []);
    }
    imageGroups.get(imageUrl)!.push(article);
  });

  let totalDeleted = 0;

  // 중복 이미지 그룹 처리
  for (const [imageUrl, articlesWithSameImage] of imageGroups) {
    if (articlesWithSameImage.length <= 1) continue;

    console.log(`\n🔴 중복 이미지 (${articlesWithSameImage.length}개):`);
    console.log(`   ${imageUrl.substring(0, 80)}...`);

    // 최신 기사 하나만 남기고 나머지 삭제
    const sorted = articlesWithSameImage.sort((a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );

    const toKeep = sorted[0];
    const toDelete = sorted.slice(1);

    console.log(`   ✅ 유지: ${toKeep.title.substring(0, 50)}...`);

    for (const article of toDelete) {
      console.log(`   ❌ 삭제: ${article.title.substring(0, 50)}...`);

      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);

      if (deleteError) {
        console.error(`      실패: ${deleteError.message}`);
      } else {
        totalDeleted++;
      }
    }
  }

  console.log(`\n\n✅ 총 ${totalDeleted}개 기사 삭제 완료`);

  // 최종 결과 확인
  const { data: remaining } = await supabase
    .from('articles')
    .select('id')
    .eq('status', 'published');

  console.log(`📊 남은 기사: ${remaining?.length}개`);
}

deleteDuplicateImages();
