import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  console.log('\n📊 데이터베이스 카테고리 확인\n');

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  if (error) {
    console.error('❌ 에러:', error.message);
    return;
  }

  console.log(`총 카테고리 개수: ${categories?.length || 0}개\n`);

  categories?.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat.name} (${cat.slug})`);
  });

  console.log('\n\n🎯 코드에 정의된 카테고리 (categories.ts):');
  const codeCategories = [
    '패션',
    '뷰티',
    '여행',
    '푸드',
    '심리',
    '건강',
    '라이프스타일',
    '하우징',
    '섹슈얼리티',
  ];

  console.log(`총 ${codeCategories.length}개\n`);
  codeCategories.forEach((cat, i) => {
    console.log(`${i + 1}. ${cat}`);
  });

  // 차이 확인
  const dbNames = categories?.map(c => c.name) || [];
  const inDbNotInCode = dbNames.filter(name => !codeCategories.includes(name));
  const inCodeNotInDb = codeCategories.filter(name => !dbNames.includes(name));

  if (inDbNotInCode.length > 0) {
    console.log('\n\n⚠️  DB에는 있지만 코드에 없는 카테고리:');
    inDbNotInCode.forEach(name => console.log(`  - ${name}`));
  }

  if (inCodeNotInDb.length > 0) {
    console.log('\n\n⚠️  코드에는 있지만 DB에 없는 카테고리:');
    inCodeNotInDb.forEach(name => console.log(`  - ${name}`));
  }

  if (inDbNotInCode.length === 0 && inCodeNotInDb.length === 0) {
    console.log('\n\n✅ DB와 코드의 카테고리가 일치합니다.');
  }
}

checkCategories();
