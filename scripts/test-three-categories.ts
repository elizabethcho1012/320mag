#!/usr/bin/env tsx
// 뷰티, 패션, 운동 카테고리 각 1개씩 테스트

import 'dotenv/config';
import { collectAndRewriteCategory } from '../src/services/contentPipeline';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

async function main() {
  console.log('🚀 3개 카테고리 테스트 수집');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('📂 카테고리: 패션, 뷰티, 운동');
  console.log('='.repeat(60));

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키 필요');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ Anthropic API 키 필요');
    process.exit(1);
  }

  console.log('✅ API 키 확인 완료\n');

  const categories = ['패션', '뷰티', '운동'];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const category of categories) {
    console.log(`\n🔄 [${category}] 1개 수집 중...`);
    console.log('='.repeat(60));

    try {
      const result = await collectAndRewriteCategory(
        category,
        1, // 각 카테고리당 1개씩
        OPENAI_API_KEY,
        ANTHROPIC_API_KEY
      );

      totalSuccess += result.success;
      totalFailed += result.failed;

      console.log(`\n✅ [${category}] 완료`);
      console.log(`   성공: ${result.success}개`);
      console.log(`   실패: ${result.failed}개`);

      if (result.errors.length > 0) {
        console.log(`   오류:`);
        result.errors.forEach(err => console.log(`      - ${err}`));
      }
    } catch (error) {
      console.error(`\n❌ [${category}] 실패:`, error);
      totalFailed++;
    }

    // API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 결과:');
  console.log(`   총 성공: ${totalSuccess}개`);
  console.log(`   총 실패: ${totalFailed}개`);
  console.log(`   예상 비용: 약 ₩${totalSuccess * 84} (하이브리드)`);
  console.log('='.repeat(60));

  process.exit(totalFailed > 0 ? 1 : 0);
}

main();
