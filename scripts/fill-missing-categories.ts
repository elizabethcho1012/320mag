import dotenv from 'dotenv';

// Load environment variables FIRST before importing any modules that use them
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { collectAndRewriteCategory } from '../src/services/contentPipeline';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fillMissingCategories() {
  console.log('\n📊 부족한 카테고리 채우기 (초과 기사는 그대로 유지)\n');

  // API 키 확인
  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  console.log('API 키 확인:', {
    anthropic: anthropicKey ? '✅ 설정됨' : '❌ 없음',
    openai: openaiKey ? '✅ 설정됨' : '❌ 없음'
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
    const needed = Math.max(0, 13 - count);

    categoryStatus[category.name] = {
      current: count,
      needed,
      slug: category.slug
    };

    const emoji = count === 0 ? '❌' : count < 13 ? '⚠️' : '✅';
    console.log(`  ${emoji} ${category.name} (${category.slug}): ${count}/13 ${needed > 0 ? `(${needed}개 필요)` : count > 13 ? `(${count - 13}개 초과, 유지)` : '(완료)'}`);
  }

  // 2단계: 부족한 카테고리 채우기
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

        // 카테고리 간 간격 (API 레이트 리밋 방지)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`  ❌ ${categoryName} 수집 실패:`, error.message);
        result.errors.push(`${categoryName}: ${error.message}`);
      }
    }
  }

  // 3단계: 최종 결과 확인
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
    const emoji = count === 0 ? '❌' : count < 13 ? '⚠️' : '✅';

    console.log(`  ${emoji} ${category.name}: ${count}/13 ${count > 13 ? `(${count - 13}개 초과)` : ''}`);
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

fillMissingCategories();
