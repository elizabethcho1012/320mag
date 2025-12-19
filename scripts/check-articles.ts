// Supabase에 저장된 아티클 확인 스크립트
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env 파일을 직접 읽어서 환경 변수 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

// 환경 변수에 설정
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

import { supabase } from '../src/integrations/supabase/client';

console.log('\n📊 Supabase 아티클 확인\n');
console.log('='.repeat(60));

async function checkArticles() {
  try {
    // 1. 전체 아티클 수 확인
    const { count: totalCount, error: countError } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    console.log(`\n📝 전체 아티클: ${totalCount}개`);

    // 2. 최근 아티클 10개 조회
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        category_id,
        creator_id,
        published_at,
        status,
        categories (name, slug),
        creators (name, profession)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (articlesError) throw articlesError;

    if (articles && articles.length > 0) {
      console.log('\n📰 최근 아티클 10개:\n');
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title}`);
        console.log(`   ID: ${article.id}`);
        console.log(`   카테고리: ${article.categories?.name || 'N/A'}`);
        console.log(`   크리에이터: ${article.creators?.name || 'N/A'} (${article.creators?.profession || 'N/A'})`);
        console.log(`   발행일: ${new Date(article.published_at).toLocaleString('ko-KR')}`);
        console.log(`   상태: ${article.status}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  아티클이 없습니다.');
    }

    // 3. 카테고리별 통계
    const { data: categoryStats, error: statsError } = await supabase
      .from('articles')
      .select('category_id, categories(name)');

    if (statsError) throw statsError;

    const categoryCounts: Record<string, number> = {};
    categoryStats?.forEach(article => {
      const categoryName = article.categories?.name || 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });

    console.log('='.repeat(60));
    console.log('\n📊 카테고리별 통계:\n');
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count}개`);
      });

    // 4. 크리에이터별 통계
    const { data: creatorStats, error: creatorError } = await supabase
      .from('articles')
      .select('creator_id, creators(name)');

    if (creatorError) throw creatorError;

    const creatorCounts: Record<string, number> = {};
    creatorStats?.forEach(article => {
      const creatorName = article.creators?.name || 'Unknown';
      creatorCounts[creatorName] = (creatorCounts[creatorName] || 0) + 1;
    });

    console.log('\n👥 크리에이터별 통계:\n');
    Object.entries(creatorCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([creator, count]) => {
        console.log(`   ${creator}: ${count}개`);
      });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 확인 완료!\n');

  } catch (error: any) {
    console.error('\n❌ 확인 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkArticles();
