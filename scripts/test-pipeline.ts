// RSS → AI 리라이팅 → Supabase 저장 통합 파이프라인 테스트
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

// 이제 서비스를 import
import { collectAndRewriteCategory } from '../src/services/contentPipeline';

console.log('\n🚀 통합 파이프라인 테스트 시작');
console.log('='.repeat(60));
console.log('📋 테스트 내용: RSS 수집 → AI 리라이팅 → Supabase 저장');
console.log('📂 테스트 카테고리: 패션');
console.log('📊 테스트 아티클 수: 2개');
console.log('='.repeat(60));

async function testPipeline() {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    console.log('\n✅ OpenAI API 키 로드:', apiKey ? `${apiKey.substring(0, 20)}...` : '❌ NOT FOUND');

    console.log('\n📡 파이프라인 실행 중...\n');

    const result = await collectAndRewriteCategory(
      '패션',
      2, // 2개만 테스트
      apiKey
    );

    console.log('\n' + '='.repeat(60));
    console.log('✅ 파이프라인 테스트 완료!');
    console.log('='.repeat(60));
    console.log(`\n📊 결과 통계:`);
    console.log(`   ✅ 성공: ${result.success}개`);
    console.log(`   ❌ 실패: ${result.failed}개`);
    console.log(`   📝 총 처리: ${result.success + result.failed}개`);

    if (result.articles.length > 0) {
      console.log(`\n📰 저장된 아티클:`);
      result.articles.forEach((article, i) => {
        console.log(`\n   ${i + 1}. ${article.title}`);
        console.log(`      - ID: ${article.id}`);
        console.log(`      - 에디터: ${article.editor_id}`);
        console.log(`      - 카테고리: ${article.category}`);
        console.log(`      - 원문: ${article.source_url}`);
      });
    }

    if (result.errors.length > 0) {
      console.log(`\n⚠️  에러 목록:`);
      result.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ 테스트 완료!\n');
  } catch (error: any) {
    console.error('\n❌ 파이프라인 테스트 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPipeline();
