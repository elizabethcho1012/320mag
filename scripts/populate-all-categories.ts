#!/usr/bin/env tsx
// 모든 카테고리에 최소 1개씩 기사 수집
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { collectAllCategories } from '../src/services/contentPipeline';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

async function main() {
  console.log('🚀 전체 카테고리 초기화');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('💡 모든 카테고리에 최소 1개씩 기사 수집\n');

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키가 설정되지 않았습니다.');
    console.error('환경 변수 VITE_OPENAI_API_KEY를 설정하세요.');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ Anthropic API 키가 설정되지 않았습니다.');
    console.error('환경 변수 VITE_ANTHROPIC_API_KEY를 설정하세요.');
    process.exit(1);
  }

  try {
    const results = await collectAllCategories(1, OPENAI_API_KEY, ANTHROPIC_API_KEY);

    console.log('\n' + '='.repeat(80));
    console.log('📊 수집 결과 요약:');
    console.log('='.repeat(80));

    let totalSuccess = 0;
    let totalFailed = 0;

    Object.entries(results).forEach(([category, result]) => {
      const { success, failed, errors } = result;
      totalSuccess += success;
      totalFailed += failed;

      console.log(`\n📂 ${category}:`);
      console.log(`   ✅ 성공: ${success}개`);
      console.log(`   ❌ 실패: ${failed}개`);

      if (errors.length > 0) {
        console.log(`   오류 목록:`);
        errors.forEach((error, idx) => {
          console.log(`      ${idx + 1}. ${error}`);
        });
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log(`🎉 전체 수집 완료!`);
    console.log(`   총 성공: ${totalSuccess}개`);
    console.log(`   총 실패: ${totalFailed}개`);
    console.log('='.repeat(80));

    process.exit(totalFailed > totalSuccess ? 1 : 0);
  } catch (error) {
    console.error('\n❌ 치명적 오류:', error);
    process.exit(1);
  }
}

main();
