// 라이프스타일 카테고리 수동 제거 및 기사 재분류
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeLifestyleManual() {
  console.log('🔧 라이프스타일 카테고리 수동 제거 및 기사 재분류 시작...\n');

  // 1. 카테고리 정보 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug');

  const categoryMap = new Map<string, any>();
  categories?.forEach(cat => categoryMap.set(cat.slug, cat));

  const lifestyleCategory = categoryMap.get('lifestyle');
  if (!lifestyleCategory) {
    console.log('✅ 라이프스타일 카테고리가 이미 없습니다.');
    return;
  }

  // 2. 라이프스타일 카테고리의 기사 수동 분류
  const manualMappings: Record<string, string> = {
    // 여행지 관련 기사들은 "여행"으로
    'Wesley Memorial Monument': 'travel',
    // 술집/문화 공간은 "푸드" 또는 "여행"으로
    '애리조나의 전설적인 술집': 'food',
    // 건축/공간 디자인은 "하우징"으로
    '르아브르, 컨테이너': 'housing',
    // 샤넬 아트 라이브러리는 "하우징" (건축/공간)
    '샤넬과 건축가': 'housing'
  };

  // 3. 라이프스타일 카테고리의 모든 기사 가져오기
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, content, category_id')
    .eq('category_id', lifestyleCategory.id)
    .order('created_at', { ascending: false });

  console.log(`📊 라이프스타일 카테고리 기사: ${articles?.length || 0}개\n`);

  if (!articles || articles.length === 0) {
    console.log('✅ 재분류할 기사가 없습니다.');
  } else {
    // 4. 각 기사를 매핑에 따라 재분류
    console.log('🔄 기사 재분류 중...\n');

    let successCount = 0;
    let failCount = 0;

    for (const article of articles) {
      console.log(`"${article.title}"`);

      // 제목에서 키워드 찾기
      let targetSlug = 'travel'; // 기본값: 여행
      for (const [keyword, slug] of Object.entries(manualMappings)) {
        if (article.title.includes(keyword)) {
          targetSlug = slug;
          break;
        }
      }

      const targetCategory = categoryMap.get(targetSlug);
      if (!targetCategory) {
        console.log(`   ❌ "${targetSlug}" 카테고리를 찾을 수 없음`);
        failCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          category_id: targetCategory.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`   ❌ 업데이트 실패:`, updateError);
        failCount++;
      } else {
        console.log(`   ✅ → ${targetCategory.name}`);
        successCount++;
      }
    }

    console.log('\n📊 재분류 결과:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${failCount}개\n`);
  }

  // 5. 라이프스타일 카테고리가 비었는지 확인
  const { data: remainingArticles } = await supabase
    .from('articles')
    .select('id')
    .eq('category_id', lifestyleCategory.id);

  if (remainingArticles && remainingArticles.length > 0) {
    console.log(`⚠️  아직 ${remainingArticles.length}개 기사가 남아 있습니다.`);
    return;
  }

  // 6. 라이프스타일 카테고리 삭제
  console.log('🗑️  라이프스타일 카테고리 삭제 중...');

  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', lifestyleCategory.id);

  if (deleteError) {
    console.error('❌ 카테고리 삭제 실패:', deleteError);
  } else {
    console.log('✅ 라이프스타일 카테고리 삭제 완료!\n');
  }

  // 7. 최종 카테고리 목록
  const { data: finalCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  console.log('📂 최종 카테고리 목록 (8개):');
  finalCategories?.forEach((cat, idx) => {
    console.log(`   ${idx + 1}. ${cat.name} (${cat.slug})`);
  });

  // 8. 최종 카테고리별 통계
  const { data: allArticles } = await supabase
    .from('articles')
    .select('category_id');

  const categoryCounts = new Map<string, number>();
  finalCategories?.forEach(cat => categoryCounts.set(cat.id, 0));

  allArticles?.forEach(art => {
    const count = categoryCounts.get(art.category_id) || 0;
    categoryCounts.set(art.category_id, count + 1);
  });

  console.log('\n📈 카테고리별 기사 현황:');
  finalCategories?.forEach(cat => {
    const count = categoryCounts.get(cat.id) || 0;
    console.log(`   ${cat.name}: ${count}개`);
  });
  console.log(`\n   총 기사: ${allArticles?.length || 0}개`);

  console.log('\n✅ 라이프스타일 카테고리 제거 완료!');
}

removeLifestyleManual();
