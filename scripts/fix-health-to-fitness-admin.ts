// DB 카테고리 slug 수정: health → fitness (관리자 권한 사용)
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // 관리자 권한 키 사용

// 관리자 권한으로 Supabase 클라이언트 생성 (RLS 우회)
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixHealthToFitness() {
  console.log('🔧 관리자 권한으로 DB 수정 시작...\n');

  try {
    // 1. 현재 "건강" 카테고리 확인
    const { data: healthCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('name', '건강')
      .single();

    if (fetchError) {
      console.error('❌ 카테고리 조회 실패:', fetchError);
      return;
    }

    console.log('📌 수정 대상 카테고리:');
    console.log(`   ID: ${healthCategory.id}`);
    console.log(`   이름: ${healthCategory.name}`);
    console.log(`   Slug: ${healthCategory.slug}`);
    console.log(`   Order: ${healthCategory.order_index}\n`);

    // 2. "건강" → "운동", "health" → "fitness" 업데이트
    console.log('🔄 업데이트 실행 중...');
    console.log('   "건강" → "운동"');
    console.log('   "health" → "fitness"\n');

    const { data: updateData, error: updateError } = await supabase
      .from('categories')
      .update({
        name: '운동',
        slug: 'fitness',
        description: '피트니스, 운동, 건강 관리',
        updated_at: new Date().toISOString(),
      })
      .eq('id', healthCategory.id)
      .select();

    if (updateError) {
      console.error('❌ 업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 업데이트 성공!');
    console.log('   업데이트된 데이터:', updateData);
    console.log();

    // 3. 최종 확인
    console.log('📊 최종 카테고리 상태 확인...\n');
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('name, slug, order_index')
      .order('order_index');

    finalCategories?.forEach(cat => {
      const mark = cat.slug === 'fitness' ? ' ✅ 수정 완료!' : '';
      console.log(`  ${cat.order_index}. ${cat.name} (${cat.slug})${mark}`);
    });

    console.log('\n✅ DB 수정 완료!');

    // 4. 검증
    const fitnessExists = finalCategories?.some(c => c.slug === 'fitness');
    const healthExists = finalCategories?.some(c => c.slug === 'health');

    console.log('\n🔍 검증 결과:');
    console.log(`   "fitness" 카테고리 존재: ${fitnessExists ? '✅ YES' : '❌ NO'}`);
    console.log(`   "health" 카테고리 존재: ${healthExists ? '⚠️  YES (문제!)' : '✅ NO (정상)'}`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

fixHealthToFitness();
