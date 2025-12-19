#!/usr/bin/env tsx
// 카테고리 구조 전반적인 점검
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { subcategoryMap } from '../src/data/categories';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategoryStructure() {
  console.log('🔍 320MAG 카테고리 구조 점검\n');
  console.log('='.repeat(80));

  // 1. 프론트엔드 categories.ts의 카테고리 확인
  console.log('\n📂 1. 프론트엔드 카테고리 (categories.ts):');
  console.log('-'.repeat(80));
  for (const [category, subcategories] of Object.entries(subcategoryMap)) {
    console.log(`\n[${category}]`);
    console.log(`   서브카테고리: ${subcategories.join(', ')}`);
  }

  // 2. 데이터베이스의 categories 테이블 확인
  console.log('\n\n📊 2. 데이터베이스 카테고리 (categories 테이블):');
  console.log('-'.repeat(80));
  const { data: dbCategories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('order_index');

  if (catError) {
    console.error('❌ 카테고리 조회 실패:', catError.message);
  } else {
    console.log(`\n총 ${dbCategories?.length}개 카테고리:`);
    dbCategories?.forEach(cat => {
      console.log(`   - ${cat.name} (slug: ${cat.slug}, order: ${cat.order_index})`);
    });
  }

  // 3. 데이터베이스의 subcategories 테이블 확인
  console.log('\n\n📋 3. 데이터베이스 서브카테고리 (subcategories 테이블):');
  console.log('-'.repeat(80));
  const { data: dbSubcategories, error: subError } = await supabase
    .from('subcategories')
    .select('*, categories(name)')
    .order('category_id')
    .order('order_index');

  if (subError) {
    console.error('❌ 서브카테고리 조회 실패:', subError.message);
  } else {
    console.log(`\n총 ${dbSubcategories?.length}개 서브카테고리:`);

    // 카테고리별로 그룹화
    const groupedByCategory: Record<string, any[]> = {};
    dbSubcategories?.forEach(sub => {
      const catName = (sub.categories as any)?.name || 'Unknown';
      if (!groupedByCategory[catName]) {
        groupedByCategory[catName] = [];
      }
      groupedByCategory[catName].push(sub);
    });

    for (const [catName, subs] of Object.entries(groupedByCategory)) {
      console.log(`\n[${catName}] - ${subs.length}개`);
      subs.forEach(sub => {
        console.log(`   - ${sub.name} (slug: ${sub.slug}, order: ${sub.order_index})`);
      });
    }
  }

  // 4. 각 서브카테고리별 기사 수 확인
  console.log('\n\n📰 4. 서브카테고리별 기사 수:');
  console.log('-'.repeat(80));

  if (dbSubcategories) {
    for (const sub of dbSubcategories) {
      const { count, error } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('subcategory_id', sub.id)
        .eq('status', 'published');

      const catName = (sub.categories as any)?.name || 'Unknown';
      const articleCount = error ? 0 : (count || 0);
      const icon = articleCount > 0 ? '✅' : '⚠️';

      console.log(`${icon} [${catName}] ${sub.name}: ${articleCount}개`);
    }
  }

  // 5. 불일치 항목 체크
  console.log('\n\n⚠️  5. 불일치 항목 체크:');
  console.log('-'.repeat(80));

  const frontendCategories = Object.keys(subcategoryMap);
  const dbCategoryNames = dbCategories?.map(c => c.name) || [];

  // 프론트엔드에는 있지만 DB에 없는 카테고리
  const missingInDB = frontendCategories.filter(fc => !dbCategoryNames.includes(fc));
  if (missingInDB.length > 0) {
    console.log('\n❌ 프론트엔드에는 있지만 DB에 없는 카테고리:');
    missingInDB.forEach(cat => console.log(`   - ${cat}`));
  }

  // DB에는 있지만 프론트엔드에 없는 카테고리
  const missingInFrontend = dbCategoryNames.filter(dc => !frontendCategories.includes(dc));
  if (missingInFrontend.length > 0) {
    console.log('\n❌ DB에는 있지만 프론트엔드에 없는 카테고리:');
    missingInFrontend.forEach(cat => console.log(`   - ${cat}`));
  }

  // 서브카테고리 불일치 체크
  for (const [catName, frontendSubs] of Object.entries(subcategoryMap)) {
    const dbCat = dbCategories?.find(c => c.name === catName);
    if (!dbCat) continue;

    const dbSubs = dbSubcategories?.filter(s => s.category_id === dbCat.id).map(s => s.name) || [];
    const missingSubsInDB = frontendSubs.filter(fs => !dbSubs.includes(fs));
    const missingSubsInFrontend = dbSubs.filter(ds => !frontendSubs.includes(ds));

    if (missingSubsInDB.length > 0) {
      console.log(`\n❌ [${catName}] 프론트엔드에는 있지만 DB에 없는 서브카테고리:`);
      missingSubsInDB.forEach(sub => console.log(`   - ${sub}`));
    }

    if (missingSubsInFrontend.length > 0) {
      console.log(`\n❌ [${catName}] DB에는 있지만 프론트엔드에 없는 서브카테고리:`);
      missingSubsInFrontend.forEach(sub => console.log(`   - ${sub}`));
    }
  }

  if (missingInDB.length === 0 && missingInFrontend.length === 0) {
    console.log('\n✅ 모든 카테고리가 일치합니다!');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ 점검 완료!\n');
}

checkCategoryStructure();
