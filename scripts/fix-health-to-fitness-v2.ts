// DB 카테고리 slug 수정: health → fitness (v2 - by name)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixHealthToFitness() {
  console.log('🔍 DB 카테고리 점검 시작 (v2)...\n');

  try {
    // 1. 한국어 이름 "건강"으로 찾기
    const { data: healthCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', '건강')
      .single();

    if (fetchError) {
      console.error('❌ 카테고리 조회 실패:', fetchError);

      // 모든 카테고리 출력
      const { data: allCategories } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');

      console.log('\n📊 전체 카테고리:');
      allCategories?.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug}) [order: ${cat.order_index}]`);
      });
      return;
    }

    if (!healthCategory) {
      console.log('⚠️  "건강" 카테고리를 찾을 수 없습니다.');
      return;
    }

    console.log('📌 발견된 카테고리:');
    console.log(`   ID: ${healthCategory.id}`);
    console.log(`   이름: ${healthCategory.name}`);
    console.log(`   Slug: ${healthCategory.slug}`);
    console.log(`   Order: ${healthCategory.order_index}`);
    console.log();

    // 2. 이름을 "운동"으로, slug를 "fitness"로 변경
    console.log('🔄 업데이트 중: "건강" → "운동", "health" → "fitness"...');

    const { data: updateData, error: updateError } = await supabase
      .from('categories')
      .update({
        name: '운동',
        slug: 'fitness',
        description: '피트니스, 운동, 건강 관리',
      })
      .eq('id', healthCategory.id)
      .select();

    if (updateError) {
      console.error('❌ 업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 카테고리 업데이트 성공!');
    if (updateData && updateData.length > 0) {
      console.log('   업데이트된 데이터:', updateData[0]);
    }
    console.log();

    // 3. 최종 확인
    console.log('📊 최종 카테고리 목록 (order_index 순):');
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('name, slug, order_index')
      .order('order_index');

    finalCategories?.forEach(cat => {
      const mark = cat.slug === 'fitness' ? ' ✅ (수정됨)' : '';
      console.log(`  ${cat.order_index}. ${cat.name} (${cat.slug})${mark}`);
    });

    console.log('\n✅ DB 수정 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

fixHealthToFitness();
