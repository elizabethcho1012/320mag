#!/usr/bin/env tsx
// 자동 콘텐츠 수집 스케줄러
// Cron job으로 실행하거나 GitHub Actions로 자동화 가능

import { scheduledCollection } from '../src/services/contentPipeline';

// API 키 (환경 변수에서 가져오기)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

async function main() {
  console.log('🚀 자동 콘텐츠 수집 시작...');
  console.log(`⏰ 시간: ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(80));

  if (!OPENAI_API_KEY && !ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: API 키가 설정되지 않았습니다.');
    console.error('환경 변수 OPENAI_API_KEY 또는 ANTHROPIC_API_KEY를 설정하세요.');
    process.exit(1);
  }

  try {
    const results = await scheduledCollection(OPENAI_API_KEY, ANTHROPIC_API_KEY);

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

    // 성공률이 50% 미만이면 경고
    const successRate = (totalSuccess / (totalSuccess + totalFailed)) * 100;
    if (successRate < 50) {
      console.warn(`⚠️  경고: 성공률이 ${successRate.toFixed(1)}%로 낮습니다.`);
      console.warn(`   API 키, RSS 피드 상태, 네트워크 연결을 확인하세요.`);
    }

    process.exit(totalFailed > totalSuccess ? 1 : 0);
  } catch (error) {
    console.error('\n❌ 치명적 오류 발생:', error);
    process.exit(1);
  }
}

// 실행
main();
