import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAllDuplicates() {
  console.log('\n🔍 전체 데이터베이스 중복 이미지 검사\n');

  // 모든 기사 조회
  const { data: allArticles } = await supabase
    .from('articles')
    .select('id, title, featured_image_url, categories(name), created_at')
    .order('created_at', { ascending: false });

  if (!allArticles || allArticles.length === 0) {
    console.log('기사가 없습니다.');
    return;
  }

  console.log(`📰 전체 기사: ${allArticles.length}개\n`);

  // 이미지 URL별로 그룹화
  const imageMap = new Map<string, typeof allArticles>();

  for (const article of allArticles) {
    if (article.featured_image_url) {
      const existing = imageMap.get(article.featured_image_url) || [];
      existing.push(article);
      imageMap.set(article.featured_image_url, existing);
    }
  }

  // 중복 찾기
  const duplicates: Array<{ imageUrl: string; articles: typeof allArticles }> = [];

  for (const [imageUrl, articles] of imageMap) {
    if (articles.length > 1) {
      duplicates.push({ imageUrl, articles });
    }
  }

  console.log(`🖼️  중복 이미지: ${duplicates.length}개\n`);

  if (duplicates.length === 0) {
    console.log('✅ 중복 이미지가 없습니다!');
    return;
  }

  // 중복 상세 정보 출력
  duplicates.forEach((dup, index) => {
    console.log(`\n${index + 1}. 이미지: ${dup.imageUrl.substring(0, 80)}...`);
    console.log(`   중복 수: ${dup.articles.length}개`);
    console.log(`   카테고리: ${dup.articles[0].categories?.name || 'Unknown'}`);
    console.log(`   기사 목록:`);
    dup.articles.forEach((article, i) => {
      console.log(`     ${i + 1}. "${article.title}" (${article.created_at})`);
    });
  });

  console.log(`\n\n📊 총 ${duplicates.length}개의 중복 이미지 발견`);
  console.log(`📊 총 ${duplicates.reduce((sum, dup) => sum + dup.articles.length - 1, 0)}개의 기사를 삭제해야 함`);
}

findAllDuplicates();
