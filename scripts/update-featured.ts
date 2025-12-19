import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function updateFeatured() {
  console.log('🔄 Featured 기사 업데이트 중...\n');

  // 1. 기존의 모든 featured 해제
  console.log('1️⃣ 기존 featured 기사 해제 중...');
  const { error: unfeaturedError } = await supabase
    .from('articles')
    .update({ featured: false })
    .eq('featured', true);

  if (unfeaturedError) {
    console.error('❌ Featured 해제 실패:', unfeaturedError);
    return;
  }
  console.log('✅ 기존 featured 해제 완료\n');

  // 2. 모든 최신 기사 조회
  console.log('2️⃣ 최신 기사 조회 중...');
  const { data: allArticles, error: fetchError } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      featured_image_url,
      categories(name),
      created_at
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(30);

  if (fetchError) {
    console.error('❌ 기사 조회 실패:', fetchError);
    return;
  }

  // 3. 패션, 뷰티, 컬처 카테고리에서 최신 기사 각 1개씩 선택
  const targetCategories = ['패션', '뷰티', '컬처'];
  const newFeatured: any[] = [];

  for (const category of targetCategories) {
    console.log(`3️⃣ "${category}" 카테고리에서 최신 기사 검색 중...`);

    // 해당 카테고리 기사 필터링
    const categoryArticles = allArticles?.filter(
      a => (a.categories as any)?.name === category
    ) || [];

    if (categoryArticles.length > 0) {
      const selected = categoryArticles[0];
      newFeatured.push(selected);
      console.log(`   ✅ 선택: "${selected.title.substring(0, 50)}..."`);
      console.log(`      생성일: ${new Date(selected.created_at).toLocaleString('ko-KR')}\n`);
    } else {
      console.log(`   ⚠️  "${category}" 카테고리 기사 없음\n`);
    }
  }

  // 4. 선택된 기사들을 featured로 설정
  console.log(`\n4️⃣ ${newFeatured.length}개 기사를 featured로 설정 중...`);

  for (const article of newFeatured) {
    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured: true })
      .eq('id', article.id);

    if (updateError) {
      console.error(`❌ Featured 설정 실패 (${article.id}):`, updateError);
    } else {
      console.log(`   ✅ "${article.title.substring(0, 50)}..." featured 설정 완료`);
    }
  }

  console.log(`\n🎉 완료! ${newFeatured.length}개 기사가 메인에 표시됩니다.`);

  // 4. 결과 확인
  console.log('\n📋 새로운 Featured 기사 목록:');
  const { data: finalFeatured } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      featured_image_url,
      categories(name),
      created_at
    `)
    .eq('featured', true)
    .order('created_at', { ascending: false });

  finalFeatured?.forEach((article, idx) => {
    console.log(`\n[${idx + 1}] ${article.title}`);
    console.log(`   카테고리: ${(article.categories as any)?.name}`);
    console.log(`   이미지: ${article.featured_image_url?.substring(0, 60)}...`);
    console.log(`   생성일: ${new Date(article.created_at).toLocaleString('ko-KR')}`);
  });
}

updateFeatured().catch(console.error);
