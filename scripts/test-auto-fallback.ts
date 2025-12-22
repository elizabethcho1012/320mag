import dotenv from 'dotenv';
dotenv.config();

import { collectAndRewriteCategory } from '../src/services/contentPipeline';

/**
 * 자동 Fallback 시스템 테스트
 * - 뷰티 카테고리 2개 수집
 * - 일부 소스 실패 시 자동으로 대체 소스 사용 확인
 */
async function testAutoFallback() {
  console.log('\n🧪 자동 Fallback 시스템 테스트\n');

  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  console.log('테스트 시나리오:');
  console.log('- 뷰티 카테고리에서 2개 기사 수집');
  console.log('- 기본 소스 중 일부가 404일 경우');
  console.log('- 자동으로 alternative-sources에서 fallback\n');

  const result = await collectAndRewriteCategory(
    '뷰티',
    2,
    openaiKey,
    anthropicKey
  );

  console.log('\n\n📊 테스트 결과:');
  console.log(`✅ 성공: ${result.success}개`);
  console.log(`❌ 실패: ${result.failed}개`);

  if (result.errors.length > 0) {
    console.log('\n⚠️  에러 목록:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  console.log('\n✨ 테스트 완료!\n');
}

testAutoFallback();
