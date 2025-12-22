// 라이프스타일 카테고리 제거 및 기사 재분류
import { createClient } from '@supabase/supabase-js';
import { inferCategory } from '../src/services/categoryInference';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function removeLifestyleCategory() {
  console.log('🔧 라이프스타일 카테고리 제거 및 기사 재분류 시작...\n');

  // 1. 라이프스타일 카테고리 ID 가져오기
  const { data: lifestyleCategory } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', 'lifestyle')
    .single();

  if (!lifestyleCategory) {
    console.log('✅ 라이프스타일 카테고리가 이미 없습니다.');
    return;
  }

  console.log(`📂 라이프스타일 카테고리 ID: ${lifestyleCategory.id}\n`);

  // 2. 라이프스타일 카테고리의 모든 기사 가져오기
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, content, category_id')
    .eq('category_id', lifestyleCategory.id)
    .order('created_at', { ascending: false });

  const articleCount = articles?.length || 0;
  console.log(`📊 라이프스타일 카테고리 기사: ${articleCount}개\n`);

  if (!articles || articleCount === 0) {
    console.log('✅ 재분류할 기사가 없습니다. 카테고리 삭제로 이동...');
  } else {
    // 3. 각 기사를 Claude로 재분류
    console.log('🤖 Claude 3.5 Haiku로 기사 재분류 중...\n');

    const reclassifications: Array<{
      id: string;
      title: string;
      newCategory: string;
    }> = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`[${i + 1}/${articles.length}] "${article.title.substring(0, 50)}..."`);

      try {
        const newCategory = await inferCategory(article.title, article.content);

        // 라이프스타일로 다시 분류되는 것 방지
        if (newCategory === '라이프스타일') {
          console.log(`   ⚠️  라이프스타일 재선택됨 → 기본값 "문화" 사용`);
          reclassifications.push({
            id: article.id,
            title: article.title,
            newCategory: '문화'
          });
        } else {
          console.log(`   ✅ 새 카테고리: ${newCategory}`);
          reclassifications.push({
            id: article.id,
            title: article.title,
            newCategory
          });
        }
      } catch (error) {
        console.error(`   ❌ 분류 실패:`, error);
        // 실패 시 기본 카테고리로
        reclassifications.push({
          id: article.id,
          title: article.title,
          newCategory: '문화'
        });
      }

      // API rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 4. 카테고리 정보 가져오기 (라이프스타일 제외)
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .neq('slug', 'lifestyle');

    const categoryMap = new Map<string, any>();
    categories?.forEach(cat => categoryMap.set(cat.name, cat));

    // 5. 재분류 실행
    console.log('\n\n🔄 기사 재분류 실행 중...\n');

    let successCount = 0;
    let failCount = 0;

    for (const item of reclassifications) {
      const newCat = categoryMap.get(item.newCategory);

      if (!newCat) {
        console.log(`⚠️  "${item.newCategory}" 카테고리를 찾을 수 없음 - 건너뜀`);
        failCount++;
        continue;
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update({
          category_id: newCat.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (updateError) {
        console.error(`❌ "${item.title.substring(0, 40)}..." 업데이트 실패:`, updateError);
        failCount++;
      } else {
        console.log(`✅ "${item.title.substring(0, 40)}..." → ${item.newCategory}`);
        successCount++;
      }
    }

    console.log('\n\n📊 재분류 결과:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${failCount}개`);
    console.log(`   합계: ${reclassifications.length}개\n`);
  }

  // 6. 라이프스타일 카테고리가 더 이상 사용되지 않는지 확인
  const { data: remainingArticles } = await supabase
    .from('articles')
    .select('id')
    .eq('category_id', lifestyleCategory.id);

  const remainingCount = remainingArticles?.length || 0;
  if (remainingCount > 0) {
    console.log(`⚠️  아직 ${remainingCount}개 기사가 라이프스타일 카테고리에 남아 있습니다.`);
    console.log('카테고리 삭제를 중단합니다.');
    return;
  }

  // 7. 라이프스타일 카테고리 삭제
  console.log('\n🗑️  라이프스타일 카테고리 삭제 중...');

  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('id', lifestyleCategory.id);

  if (deleteError) {
    console.error('❌ 카테고리 삭제 실패:', deleteError);
  } else {
    console.log('✅ 라이프스타일 카테고리 삭제 완료!\n');
  }

  // 8. 최종 카테고리 목록
  const { data: finalCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  console.log('\n📂 최종 카테고리 목록 (8개):');
  finalCategories?.forEach((cat, idx) => {
    console.log(`   ${idx + 1}. ${cat.name} (${cat.slug})`);
  });

  console.log('\n✅ 라이프스타일 카테고리 제거 완료!');
}

removeLifestyleCategory();
