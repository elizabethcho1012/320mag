// 패션 카테고리만 집중 수집 (테스트용)
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

import { collectAndRewriteCategory } from '../src/services/contentPipeline';

console.log('\n🚀 패션 카테고리 집중 수집\n');
console.log('='.repeat(60));

async function collectFashion() {
  try {
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    const anthropicApiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!openaiApiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    if (!anthropicApiKey) {
      throw new Error('Anthropic API 키가 설정되지 않았습니다.');
    }

    console.log('✅ OpenAI API 키 로드 완료');
    console.log('✅ Anthropic API 키 로드 완료');
    console.log('📊 수집할 아티클 수: 5개\n');

    const result = await collectAndRewriteCategory('패션', 5, openaiApiKey, anthropicApiKey);

    console.log('\n' + '='.repeat(60));
    console.log('📊 수집 결과');
    console.log('='.repeat(60));
    console.log(`✅ 성공: ${result.success}개`);
    console.log(`❌ 실패: ${result.failed}개`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  에러 목록:');
      result.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    if (result.articles.length > 0) {
      console.log('\n📰 저장된 아티클:');
      result.articles.forEach((article, i) => {
        console.log(`\n   ${i + 1}. ${article.title}`);
        console.log(`      ID: ${article.id}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 수집 완료!\n');

  } catch (error: any) {
    console.error('\n❌ 수집 실패:', error.message);
    console.error(error);
    process.exit(1);
  }
}

collectFashion();
