import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTravelDuplicates() {
  console.log('\n🔧 여행 카테고리 중복 문제 해결\n');

  // 여행 카테고리 ID 조회
  const { data: travelCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('name', '여행')
    .single();

  if (!travelCategory) {
    console.error('❌ 여행 카테고리를 찾을 수 없습니다');
    return;
  }

  // 모든 여행 기사 조회
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, created_at')
    .eq('category_id', travelCategory.id)
    .order('created_at', { ascending: false });

  console.log(`📰 전체 여행 기사: ${articles?.length || 0}개\n`);

  if (!articles || articles.length === 0) {
    console.log('기사가 없습니다.');
    return;
  }

  // 이미지 중복 찾기
  const imageMap = new Map<string, typeof articles>();

  for (const article of articles) {
    if (article.featured_image_url) {
      const existing = imageMap.get(article.featured_image_url) || [];
      existing.push(article);
      imageMap.set(article.featured_image_url, existing);
    }
  }

  // 중복 이미지 처리
  let deletedCount = 0;

  for (const [imageUrl, duplicates] of imageMap) {
    if (duplicates.length > 1) {
      console.log(`\n⚠️  중복 이미지 발견 (${duplicates.length}개):`);
      console.log(`이미지: ${imageUrl}`);

      // 가장 오래된 것 유지, 나머지 삭제
      const toKeep = duplicates[duplicates.length - 1]; // 마지막 (가장 오래된)
      const toDelete = duplicates.slice(0, -1);

      console.log(`\n✅ 유지: "${toKeep.title}" (${toKeep.created_at})`);
      console.log(`\n삭제할 기사:`);

      for (const article of toDelete) {
        console.log(`  - "${article.title}" (${article.created_at})`);

        const { error } = await supabase
          .from('articles')
          .delete()
          .eq('id', article.id);

        if (error) {
          console.error(`    ❌ 삭제 실패:`, error);
        } else {
          console.log(`    ✅ 삭제 완료`);
          deletedCount++;
        }
      }
    }
  }

  console.log(`\n\n📊 결과: ${deletedCount}개의 중복 기사 삭제됨`);
}

fixTravelDuplicates();
