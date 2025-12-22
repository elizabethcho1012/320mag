import dotenv from 'dotenv';

// Load environment variables FIRST before importing any modules that use them
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { collectAndRewriteCategory } from '../src/services/contentPipeline';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fillCategoriesToFour() {
  console.log('\n📊 모든 카테고리를 4개씩 채우기\n');

  // API 키 확인
  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  console.log('API 키 확인:', {
    anthropic: anthropicKey ? '설정됨' : '없음',
    openai: openaiKey ? '설정됨' : '없음'
  });

  // 1단계: 현재 각 카테고리별 기사 개수 확인
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');

  if (catError) {
    console.error('❌ 카테고리 조회 실패:', catError.message);
    return;
  }

  const categoryStatus: { [key: string]: { current: number; needed: number; slug: string } } = {};

  console.log('📋 현재 상태:\n');

  for (const category of categories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        categories!inner(slug)
      `)
      .eq('categories.slug', category.slug)
      .eq('status', 'published');

    const count = articles?.length || 0;
    const needed = Math.max(0, 4 - count);

    categoryStatus[category.name] = {
      current: count,
      needed,
      slug: category.slug
    };

    console.log(`  ${category.name} (${category.slug}): ${count}/4 (${needed > 0 ? `${needed}개 필요` : '완료'})`);
  }

  // 2단계: 패션 카테고리에서 2개 삭제 (6개 → 4개)
  const fashionStatus = categoryStatus['패션'];
  if (fashionStatus && fashionStatus.current > 4) {
    console.log(`\n🗑️  패션 카테고리 정리 (${fashionStatus.current}개 → 4개)\n`);

    const { data: fashionArticles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        published_at,
        categories!inner(slug)
      `)
      .eq('categories.slug', 'fashion')
      .eq('status', 'published')
      .order('published_at', { ascending: true }); // 오래된 순

    const toDelete = fashionArticles?.slice(0, fashionStatus.current - 4) || [];

    for (const article of toDelete) {
      console.log(`  ❌ 삭제: ${article.title.substring(0, 50)}...`);

      const { error: deleteError } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);

      if (deleteError) {
        console.error(`     실패: ${deleteError.message}`);
      } else {
        console.log(`     ✅ 삭제 완료`);
      }
    }

    // 패션 상태 업데이트
    categoryStatus['패션'].current = 4;
    categoryStatus['패션'].needed = 0;
  }

  // 3단계: 부족한 카테고리 채우기
  console.log('\n\n📡 부족한 카테고리 수집 시작\n');

  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const [categoryName, status] of Object.entries(categoryStatus)) {
    if (status.needed > 0) {
      console.log(`\n🔄 [${categoryName}] ${status.needed}개 수집 중...`);

      try {
        const categoryResult = await collectAndRewriteCategory(
          categoryName,
          status.needed,
          openaiKey,
          anthropicKey
        );

        result.success += categoryResult.success;
        result.failed += categoryResult.failed;
        result.errors.push(...categoryResult.errors);

        console.log(`  ✅ ${categoryName}: ${categoryResult.success}개 성공, ${categoryResult.failed}개 실패`);

        // 카테고리 간 간격
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`  ❌ ${categoryName} 수집 실패:`, error.message);
        result.errors.push(`${categoryName}: ${error.message}`);
      }
    }
  }

  // 4단계: 최종 결과 확인
  console.log('\n\n📊 최종 결과:\n');

  for (const category of categories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select(`
        id,
        categories!inner(slug)
      `)
      .eq('categories.slug', category.slug)
      .eq('status', 'published');

    const count = articles?.length || 0;
    const status = count >= 4 ? '✅' : '⚠️';

    console.log(`  ${status} ${category.name}: ${count}/4`);
  }

  console.log('\n\n📈 수집 통계:');
  console.log(`  ✅ 성공: ${result.success}개`);
  console.log(`  ❌ 실패: ${result.failed}개`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  에러 목록:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  console.log('\n✨ 완료!');
}

fillCategoriesToFour();
