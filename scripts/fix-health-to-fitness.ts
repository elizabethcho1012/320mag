// DB 카테고리 slug 수정: health → fitness
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixHealthToFitness() {
  console.log('🔍 DB 카테고리 점검 시작...\n');

  try {
    // 1. 현재 카테고리 상태 확인
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug, description, order_index')
      .order('order_index');

    if (fetchError) {
      console.error('❌ 카테고리 조회 실패:', fetchError);
      return;
    }

    console.log('📊 현재 카테고리 목록:');
    categories?.forEach((cat) => {
      const warning = cat.slug === 'health' ? ' ⚠️  문제 발견!' : '';
      console.log(`  ${cat.order_index}. ${cat.name} (${cat.slug})${warning}`);
    });
    console.log();

    // 2. 'health' slug 찾기
    const healthCategory = categories?.find((cat) => cat.slug === 'health');

    if (!healthCategory) {
      console.log('✅ "health" slug 없음. 이미 수정되었거나 문제 없음.');
      return;
    }

    console.log(`🔧 수정 대상 발견: "${healthCategory.name}" (${healthCategory.slug})`);
    console.log(`   ID: ${healthCategory.id}`);
    console.log();

    // 3. 'health' → 'fitness' 업데이트
    console.log('🔄 slug 업데이트 중: health → fitness...');
    const { data: updateData, error: updateError } = await supabase
      .from('categories')
      .update({
        slug: 'fitness',
        description: '피트니스, 운동, 건강 관리',
        updated_at: new Date().toISOString(),
      })
      .eq('slug', 'health')
      .select();

    if (updateError) {
      console.error('❌ 업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 카테고리 slug 업데이트 완료!');
    console.log('   업데이트된 레코드:', updateData);
    console.log();

    // 4. 서브카테고리 확인 및 업데이트
    console.log('🔍 서브카테고리 점검 중...');
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id, name, slug, category_id')
      .eq('category_id', healthCategory.id);

    if (subError) {
      console.error('❌ 서브카테고리 조회 실패:', subError);
      return;
    }

    console.log(`   서브카테고리 ${subcategories?.length || 0}개 발견`);

    if (subcategories && subcategories.length > 0) {
      // 서브카테고리 slug도 'health-*' → 'fitness-*'로 변경
      for (const sub of subcategories) {
        if (sub.slug.startsWith('health-')) {
          const newSlug = sub.slug.replace('health-', 'fitness-');
          console.log(`   🔄 서브카테고리 업데이트: ${sub.slug} → ${newSlug}`);

          const { error: subUpdateError } = await supabase
            .from('subcategories')
            .update({
              slug: newSlug,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

          if (subUpdateError) {
            console.error(`   ❌ 서브카테고리 업데이트 실패 (${sub.slug}):`, subUpdateError);
          } else {
            console.log(`   ✅ ${newSlug} 업데이트 완료`);
          }
        }
      }
    }

    console.log();

    // 5. 최종 확인
    console.log('📊 최종 카테고리 상태:');
    const { data: finalCategories, error: finalError } = await supabase
      .from('categories')
      .select('id, name, slug, description, order_index')
      .order('order_index');

    if (finalError) {
      console.error('❌ 최종 조회 실패:', finalError);
      return;
    }

    finalCategories?.forEach((cat) => {
      const check = cat.slug === 'fitness' ? ' ✅' : '';
      console.log(`  ${cat.order_index}. ${cat.name} (${cat.slug})${check}`);
    });

    console.log();
    console.log('✅ DB 수정 완료!');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

fixHealthToFitness();
