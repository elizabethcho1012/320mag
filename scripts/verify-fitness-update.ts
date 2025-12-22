// DB 카테고리 업데이트 확인
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyUpdate() {
  console.log('🔍 DB 카테고리 최종 확인...\n');

  // 전체 카테고리 조회
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index');

  if (error) {
    console.error('❌ 조회 실패:', error);
    return;
  }

  console.log('📊 현재 DB 카테고리 (총 ' + (categories?.length || 0) + '개):\n');

  categories?.forEach((cat, index) => {
    const isFitness = cat.slug === 'fitness';
    const isHealth = cat.slug === 'health';
    const mark = isFitness ? ' ✅ FITNESS!' : (isHealth ? ' ⚠️  HEALTH 발견!' : '');

    console.log(`${index + 1}. [${cat.order_index}] ${cat.name} → "${cat.slug}"${mark}`);
    console.log(`   ID: ${cat.id}`);
    console.log(`   설명: ${cat.description || '(없음)'}`);
    console.log();
  });

  // fitness slug 확인
  const fitnessCategory = categories?.find(c => c.slug === 'fitness');
  const healthCategory = categories?.find(c => c.slug === 'health');

  if (fitnessCategory) {
    console.log('✅ "fitness" 카테고리 존재 확인!');
    console.log(`   이름: ${fitnessCategory.name}`);
  } else {
    console.log('❌ "fitness" 카테고리가 없습니다!');
  }

  if (healthCategory) {
    console.log('⚠️  "health" 카테고리가 여전히 존재합니다!');
    console.log(`   이름: ${healthCategory.name}`);
    console.log(`   ID: ${healthCategory.id}`);
  } else {
    console.log('✅ "health" 카테고리 제거됨 확인!');
  }
}

verifyUpdate();
