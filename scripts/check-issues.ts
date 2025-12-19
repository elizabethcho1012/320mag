import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkIssues() {
  console.log('🔍 문제점 분석 중...\n');

  // 1. 패션 카테고리 기사들의 이미지 확인
  console.log('=== 문제 1: 패션 카테고리 이미지 중복 확인 ===');
  const { data: fashionArticles } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  const fashionOnly = fashionArticles?.filter(a => (a.categories as any)?.name === '패션') || [];
  console.log(`패션 기사 ${fashionOnly.length}개:\n`);

  const imageUrlCount: Record<string, number> = {};
  fashionOnly.forEach(article => {
    const url = article.featured_image_url || 'null';
    imageUrlCount[url] = (imageUrlCount[url] || 0) + 1;
    console.log(`- ${article.title.substring(0, 50)}...`);
    console.log(`  이미지: ${url.substring(0, 80)}...`);
  });

  console.log('\n이미지 URL 중복 통계:');
  Object.entries(imageUrlCount).forEach(([url, count]) => {
    if (count > 1) {
      console.log(`⚠️  ${count}번 중복: ${url.substring(0, 80)}...`);
    }
  });

  // 2. 최신 5개 기사 확인 (메인 상단 이미지)
  console.log('\n\n=== 문제 2: 최신 기사 확인 ===');
  const latest = fashionArticles?.slice(0, 5) || [];
  console.log('최신 5개 기사:');
  latest.forEach((article, idx) => {
    console.log(`\n[${idx + 1}] ${article.title}`);
    console.log(`   이미지: ${article.featured_image_url?.substring(0, 80)}...`);
  });

  // 3. 박미경 작가 확인
  console.log('\n\n=== 문제 3: 박미경 작가 기사 확인 ===');
  const { data: parkArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      author_name,
      categories(name),
      creators(name, profession)
    `)
    .eq('status', 'published')
    .or('author_name.ilike.%박미경%,creators.name.ilike.%박미경%')
    .limit(10);

  if (parkArticles && parkArticles.length > 0) {
    console.log(`박미경 관련 기사 ${parkArticles.length}개 발견:\n`);
    parkArticles.forEach(article => {
      console.log(`- ${article.title}`);
      console.log(`  작성자: ${article.author_name || (article.creators as any)?.name || 'N/A'}`);
      console.log(`  카테고리: ${(article.categories as any)?.name || 'N/A'}`);
      console.log(`  크리에이터 직업: ${(article.creators as any)?.profession || 'N/A'}\n`);
    });
  } else {
    console.log('박미경 관련 기사를 찾을 수 없습니다.');
  }

  // 4. 전체 카테고리별 분포 확인
  console.log('\n\n=== 전체 기사 카테고리 분포 ===');
  const categoryCount: Record<string, number> = {};
  fashionArticles?.forEach(article => {
    const cat = (article.categories as any)?.name || 'N/A';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`${cat}: ${count}개`);
  });
}

checkIssues().catch(console.error);
