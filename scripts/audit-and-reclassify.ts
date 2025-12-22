// 기존 기사 재점검 및 재분류 스크립트
import { createClient } from '@supabase/supabase-js';
import { inferCategory } from '../src/services/categoryInference';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Article {
  id: string;
  title: string;
  content: string;
  featured_image_url: string | null;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface DuplicateGroup {
  title?: string;
  image?: string;
  articles: Article[];
}

async function auditAndReclassify() {
  console.log('🔍 기존 기사 재점검 및 재분류 시작...\n');

  // 1. 카테고리 정보 가져오기
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (!categories || categories.length === 0) {
    console.error('❌ 카테고리를 찾을 수 없습니다.');
    return;
  }

  const categoryMap = new Map<string, Category>();
  categories.forEach(cat => categoryMap.set(cat.id, cat));

  console.log('📂 카테고리 목록:');
  categories.forEach(cat => {
    console.log(`   - ${cat.name} (${cat.slug})`);
  });
  console.log();

  // 2. 모든 기사 가져오기
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, featured_image_url, category_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 기사 조회 실패:', error);
    return;
  }

  console.log(`📊 총 ${articles?.length || 0}개 기사 검사 중...\n`);

  // 3. 중복 기사 찾기 (제목 또는 이미지)
  console.log('🔍 1단계: 중복 기사 찾기...\n');

  const titleGroups = new Map<string, Article[]>();
  const imageGroups = new Map<string, Article[]>();

  articles?.forEach(article => {
    // 제목 중복 체크
    if (titleGroups.has(article.title)) {
      titleGroups.get(article.title)!.push(article);
    } else {
      titleGroups.set(article.title, [article]);
    }

    // 이미지 중복 체크 (이미지가 있는 경우만)
    if (article.featured_image_url) {
      if (imageGroups.has(article.featured_image_url)) {
        imageGroups.get(article.featured_image_url)!.push(article);
      } else {
        imageGroups.set(article.featured_image_url, [article]);
      }
    }
  });

  // 중복된 항목만 필터링
  const duplicateTitles = Array.from(titleGroups.entries())
    .filter(([_, arts]) => arts.length > 1);

  const duplicateImages = Array.from(imageGroups.entries())
    .filter(([_, arts]) => arts.length > 1);

  console.log(`   📝 제목 중복: ${duplicateTitles.length}개 그룹 (${duplicateTitles.reduce((sum, [_, arts]) => sum + arts.length - 1, 0)}개 중복)`);
  console.log(`   🖼️  이미지 중복: ${duplicateImages.length}개 그룹 (${duplicateImages.reduce((sum, [_, arts]) => sum + arts.length - 1, 0)}개 중복)`);
  console.log();

  // 중복 기사 상세 출력
  if (duplicateTitles.length > 0) {
    console.log('📝 제목 중복 기사:');
    duplicateTitles.forEach(([title, arts], idx) => {
      console.log(`\n${idx + 1}. "${title}" (${arts.length}개)`);
      arts.forEach((art, i) => {
        const cat = categoryMap.get(art.category_id);
        console.log(`   ${i + 1}) ID: ${art.id.substring(0, 8)} | 카테고리: ${cat?.name || '알 수 없음'}`);
      });
    });
    console.log();
  }

  if (duplicateImages.length > 0) {
    console.log('🖼️  이미지 중복 기사:');
    duplicateImages.forEach(([imageUrl, arts], idx) => {
      console.log(`\n${idx + 1}. 이미지: ${imageUrl.substring(0, 60)}... (${arts.length}개)`);
      arts.forEach((art, i) => {
        const cat = categoryMap.get(art.category_id);
        console.log(`   ${i + 1}) "${art.title.substring(0, 40)}..." | ${cat?.name || '알 수 없음'}`);
      });
    });
    console.log();
  }

  // 4. 중복 기사 삭제 (첫 번째만 남기고 나머지 삭제)
  const articlesToDelete: string[] = [];

  duplicateTitles.forEach(([_, arts]) => {
    // 첫 번째 기사는 유지, 나머지는 삭제 대상
    arts.slice(1).forEach(art => {
      if (!articlesToDelete.includes(art.id)) {
        articlesToDelete.push(art.id);
      }
    });
  });

  duplicateImages.forEach(([_, arts]) => {
    // 첫 번째 기사는 유지, 나머지는 삭제 대상
    arts.slice(1).forEach(art => {
      if (!articlesToDelete.includes(art.id)) {
        articlesToDelete.push(art.id);
      }
    });
  });

  if (articlesToDelete.length > 0) {
    console.log(`\n🗑️  중복 기사 삭제 중... (${articlesToDelete.length}개)`);

    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .in('id', articlesToDelete);

    if (deleteError) {
      console.error('❌ 삭제 실패:', deleteError);
    } else {
      console.log(`✅ ${articlesToDelete.length}개 중복 기사 삭제 완료`);
    }
  } else {
    console.log('✅ 중복 기사 없음');
  }

  // 5. 남은 기사들 카테고리 재검증
  console.log('\n🔍 2단계: 카테고리 재검증...\n');

  const { data: remainingArticles } = await supabase
    .from('articles')
    .select('id, title, content, category_id')
    .order('created_at', { ascending: false });

  if (!remainingArticles || remainingArticles.length === 0) {
    console.log('✅ 검증할 기사가 없습니다.');
    return;
  }

  console.log(`📊 총 ${remainingArticles.length}개 기사 카테고리 검증 중...\n`);

  const reclassifications: Array<{
    id: string;
    title: string;
    oldCategory: string;
    newCategory: string;
    reason: string;
  }> = [];

  for (let i = 0; i < remainingArticles.length; i++) {
    const article = remainingArticles[i];
    const currentCat = categoryMap.get(article.category_id);

    console.log(`[${i + 1}/${remainingArticles.length}] "${article.title.substring(0, 50)}..."`);
    console.log(`   현재 카테고리: ${currentCat?.name || '알 수 없음'}`);

    try {
      // AI로 카테고리 재추론
      const inferredCategory = await inferCategory(article.title, article.content);

      // 카테고리 이름으로 ID 찾기
      const newCat = Array.from(categoryMap.values()).find(c => c.name === inferredCategory);

      if (newCat && newCat.id !== article.category_id) {
        console.log(`   ⚠️  재분류 필요: ${currentCat?.name} → ${newCat.name}`);
        reclassifications.push({
          id: article.id,
          title: article.title,
          oldCategory: currentCat?.name || '알 수 없음',
          newCategory: newCat.name,
          reason: 'AI 분석 결과'
        });
      } else {
        console.log(`   ✅ 현재 카테고리 유지`);
      }
    } catch (error) {
      console.error(`   ❌ 카테고리 추론 실패:`, error);
    }

    // API rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 6. 재분류 결과 요약
  console.log('\n\n📊 재분류 요약:');
  console.log(`   총 기사: ${remainingArticles.length}개`);
  console.log(`   재분류 필요: ${reclassifications.length}개`);
  console.log(`   유지: ${remainingArticles.length - reclassifications.length}개\n`);

  if (reclassifications.length > 0) {
    console.log('재분류 대상 기사:');
    reclassifications.forEach((item, idx) => {
      console.log(`\n${idx + 1}. "${item.title.substring(0, 60)}..."`);
      console.log(`   ${item.oldCategory} → ${item.newCategory}`);
      console.log(`   이유: ${item.reason}`);
    });

    // 7. 실제 재분류 실행
    console.log('\n🔧 재분류 실행 중...\n');

    let successCount = 0;
    let failCount = 0;

    for (const item of reclassifications) {
      const newCat = Array.from(categoryMap.values()).find(c => c.name === item.newCategory);

      if (!newCat) {
        console.log(`⚠️  "${item.newCategory}" 카테고리를 찾을 수 없음`);
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

    console.log('\n\n📊 최종 결과:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${failCount}개`);
    console.log(`   합계: ${reclassifications.length}개`);
  }

  // 8. 최종 카테고리별 통계
  console.log('\n\n📈 카테고리별 기사 현황:');

  const { data: finalArticles } = await supabase
    .from('articles')
    .select('category_id')
    .order('created_at', { ascending: false });

  const categoryCounts = new Map<string, number>();
  categories.forEach(cat => categoryCounts.set(cat.id, 0));

  finalArticles?.forEach(art => {
    const count = categoryCounts.get(art.category_id) || 0;
    categoryCounts.set(art.category_id, count + 1);
  });

  categories.forEach(cat => {
    const count = categoryCounts.get(cat.id) || 0;
    console.log(`   ${cat.name}: ${count}개`);
  });

  console.log(`\n   총 기사: ${finalArticles?.length || 0}개`);
  console.log('\n✅ 재점검 및 재분류 완료!');
}

auditAndReclassify();
