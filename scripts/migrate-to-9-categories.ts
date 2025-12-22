import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { CATEGORIES } from '../src/data/categories';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 9개 카테고리로 마이그레이션
 *
 * 제거할 카테고리: 건강푸드, 글로벌트렌드, 글로벌푸드, 운동
 * 추가할 카테고리: 푸드 (food), 건강 (health)
 *
 * 마이그레이션 전략:
 * - 건강푸드 → 푸드로 기사 이동
 * - 글로벌푸드 → 푸드로 기사 이동
 * - 운동 → 건강으로 기사 이동
 * - 글로벌트렌드 기사는 삭제 (시니어 특화 카테고리 제거)
 */

async function migrateTo9Categories() {
  console.log('\n📊 9개 카테고리로 마이그레이션 시작\n');

  // 1단계: 새로운 카테고리 추가
  console.log('1️⃣  새로운 카테고리 추가...\n');

  const newCategories = CATEGORIES.filter(cat =>
    cat.name === '푸드' || cat.name === '건강'
  );

  for (const category of newCategories) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category.slug)
      .single();

    if (existing) {
      console.log(`  ✅ "${category.name}" 이미 존재`);
      continue;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        slug: category.slug,
        description: category.description,
        order_index: category.order_index,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ "${category.name}" 생성 실패:`, error.message);
    } else {
      console.log(`  ✅ "${category.name}" 생성 완료 (ID: ${data.id})`);
    }
  }

  // 2단계: 기사 마이그레이션
  console.log('\n\n2️⃣  기사 마이그레이션...\n');

  // 푸드 카테고리 ID 가져오기
  const { data: foodCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'food')
    .single();

  // 건강 카테고리 ID 가져오기
  const { data: healthCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'health')
    .single();

  if (!foodCategory || !healthCategory) {
    console.error('❌ 새로운 카테고리를 찾을 수 없습니다');
    return;
  }

  // 건강푸드 → 푸드로 기사 이동
  const { data: healthFoodCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'health-food')
    .single();

  if (healthFoodCat) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('category_id', healthFoodCat.id);

    console.log(`  🔄 건강푸드 → 푸드: ${articles?.length || 0}개 기사 이동`);

    for (const article of articles || []) {
      await supabase
        .from('articles')
        .update({ category_id: foodCategory.id })
        .eq('id', article.id);
    }
  }

  // 글로벌푸드 → 푸드로 기사 이동
  const { data: globalFoodCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'global-food')
    .single();

  if (globalFoodCat) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('category_id', globalFoodCat.id);

    console.log(`  🔄 글로벌푸드 → 푸드: ${articles?.length || 0}개 기사 이동`);

    for (const article of articles || []) {
      await supabase
        .from('articles')
        .update({ category_id: foodCategory.id })
        .eq('id', article.id);
    }
  }

  // 운동 → 건강으로 기사 이동
  const { data: exerciseCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'exercise')
    .single();

  if (exerciseCat) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('category_id', exerciseCat.id);

    console.log(`  🔄 운동 → 건강: ${articles?.length || 0}개 기사 이동`);

    for (const article of articles || []) {
      await supabase
        .from('articles')
        .update({ category_id: healthCategory.id })
        .eq('id', article.id);
    }
  }

  // 글로벌트렌드 기사 삭제
  const { data: globalTrendsCat } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'global-trends')
    .single();

  if (globalTrendsCat) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, category_id')
      .eq('category_id', globalTrendsCat.id);

    console.log(`  🗑️  글로벌트렌드: ${articles?.length || 0}개 기사 삭제`);

    for (const article of articles || []) {
      await supabase
        .from('articles')
        .delete()
        .eq('id', article.id);
    }
  }

  // 3단계: 구 카테고리 삭제
  console.log('\n\n3️⃣  구 카테고리 삭제...\n');

  const oldCategories = ['health-food', 'global-food', 'global-trends', 'exercise'];

  for (const slug of oldCategories) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error(`  ❌ "${slug}" 삭제 실패:`, error.message);
    } else {
      console.log(`  ✅ "${slug}" 삭제 완료`);
    }
  }

  // 4단계: 최종 확인
  console.log('\n\n4️⃣  최종 확인...\n');

  const { data: finalCategories } = await supabase
    .from('categories')
    .select('name, slug')
    .order('name');

  console.log(`총 카테고리 개수: ${finalCategories?.length || 0}개\n`);

  for (const cat of finalCategories || []) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id')
      .eq('category_id', cat.id!)
      .eq('status', 'published');

    console.log(`  ✅ ${cat.name} (${cat.slug}): ${articles?.length || 0}개 기사`);
  }

  console.log('\n✨ 마이그레이션 완료!\n');
}

migrateTo9Categories();
