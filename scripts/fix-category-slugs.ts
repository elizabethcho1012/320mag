import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 카테고리 slug 문제 수정
 * 1. 심리 (psychology → mind)
 * 2. 트렌드 → 섹슈얼리티
 * 3. Health → Fitness
 */

async function fixCategorySlugs() {
  console.log('\n🔧 카테고리 slug 수정\n');

  // 1. 심리 카테고리 slug 확인 및 수정
  const { data: psychologyCategory } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('name', '심리')
    .single();

  if (psychologyCategory) {
    console.log(`📌 심리 카테고리: ${psychologyCategory.slug}`);

    if (psychologyCategory.slug === 'psychology') {
      const { error } = await supabase
        .from('categories')
        .update({ slug: 'mind' })
        .eq('id', psychologyCategory.id);

      if (error) {
        console.error('  ❌ 심리 slug 업데이트 실패:', error.message);
      } else {
        console.log('  ✅ 심리 slug psychology → mind 변경 완료');
      }
    } else {
      console.log(`  ✅ 심리 slug 이미 올바름: ${psychologyCategory.slug}`);
    }
  }

  // 2. 트렌드 카테고리가 있다면 섹슈얼리티로 변경
  const { data: trendsCategory } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'trends')
    .single();

  if (trendsCategory) {
    console.log(`\n📌 트렌드 카테고리 발견: ${trendsCategory.name}`);

    const { error } = await supabase
      .from('categories')
      .update({
        name: '섹슈얼리티',
        slug: 'sexuality',
        description: '친밀감, 관계, 성 건강'
      })
      .eq('id', trendsCategory.id);

    if (error) {
      console.error('  ❌ 트렌드 → 섹슈얼리티 업데이트 실패:', error.message);
    } else {
      console.log('  ✅ 트렌드 → 섹슈얼리티 변경 완료');
    }
  } else {
    console.log('\n📌 트렌드 카테고리 없음');
  }

  // 3. 건강 카테고리의 영문 표현 확인
  const { data: healthCategory } = await supabase
    .from('categories')
    .select('id, name, slug, description')
    .eq('name', '건강')
    .single();

  if (healthCategory) {
    console.log(`\n📌 건강 카테고리: ${healthCategory.slug}`);
    console.log(`   설명: ${healthCategory.description}`);

    // 건강은 health가 맞지만, 설명을 명확히 함
    if (healthCategory.description !== '피트니스, 운동, 건강 관리') {
      const { error } = await supabase
        .from('categories')
        .update({
          description: '피트니스, 운동, 건강 관리'
        })
        .eq('id', healthCategory.id);

      if (error) {
        console.error('  ❌ 건강 설명 업데이트 실패:', error.message);
      } else {
        console.log('  ✅ 건강 설명 업데이트 완료');
      }
    }
  }

  // 4. 최종 확인
  console.log('\n\n📊 최종 카테고리 목록:\n');

  const { data: allCategories } = await supabase
    .from('categories')
    .select('name, slug, description')
    .order('order_index');

  allCategories?.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.name} (${cat.slug})`);
    console.log(`   ${cat.description}`);
  });

  console.log('\n✨ 완료!\n');
}

fixCategorySlugs();
