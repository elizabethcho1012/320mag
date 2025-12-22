import dotenv from 'dotenv';
dotenv.config();

import { collectWithRetry, getFailureStats, getRecoveryStats } from '../src/services/recoveryService';

/**
 * Recovery System 테스트
 * - 정상 소스 테스트
 * - 실패 소스 테스트 (자동 fallback 확인)
 * - 통계 출력
 */
async function testRecoverySystem() {
  console.log('\n🔬 Recovery System 테스트\n');

  // 테스트 1: 정상 소스 (Who What Wear - 패션)
  console.log('📍 테스트 1: 정상 소스 (Who What Wear)\n');

  const test1 = await collectWithRetry({
    id: 'fashion-whowhatwear',
    name: 'Who What Wear',
    url: 'https://www.whowhatwear.com/rss',
    category: '패션',
  }, 5);

  console.log(`   결과: ${test1.success ? '✅ 성공' : '❌ 실패'}`);
  console.log(`   Fallback 사용: ${test1.usedFallback ? 'Yes' : 'No'}`);
  console.log(`   수집 기사: ${test1.articles.length}개`);

  // 테스트 2: 실패 소스 (Into The Gloss - 뷰티, 404 에러)
  console.log('\n\n📍 테스트 2: 실패 소스 with Fallback (Into The Gloss → Byrdie)\n');

  const test2 = await collectWithRetry({
    id: 'beauty-into-the-gloss',
    name: 'Into The Gloss',
    url: 'https://intothegloss.com/feed/',
    category: '뷰티',
  }, 5);

  console.log(`   결과: ${test2.success ? '✅ 성공' : '❌ 실패'}`);
  console.log(`   Fallback 사용: ${test2.usedFallback ? 'Yes (자동 복구됨!)' : 'No'}`);
  console.log(`   수집 기사: ${test2.articles.length}개`);

  // 테스트 3: 실패 소스 (Serious Eats - 글로벌푸드, 404 에러)
  console.log('\n\n📍 테스트 3: 실패 소스 with Fallback (Serious Eats → Food & Wine)\n');

  const test3 = await collectWithRetry({
    id: 'global-food-serious-eats',
    name: 'Serious Eats',
    url: 'https://www.seriouseats.com/feed',
    category: '글로벌푸드',
  }, 5);

  console.log(`   결과: ${test3.success ? '✅ 성공' : '❌ 실패'}`);
  console.log(`   Fallback 사용: ${test3.usedFallback ? 'Yes (자동 복구됨!)' : 'No'}`);
  console.log(`   수집 기사: ${test3.articles.length}개`);

  // 통계 출력
  console.log('\n\n📊 시스템 통계\n');

  const failureStats = getFailureStats();
  console.log(`실패 로그:`);
  console.log(`  총 ${failureStats.totalFailures}개 소스 실패`);
  console.log(`  카테고리별:`);
  Object.entries(failureStats.byCategory).forEach(([category, count]) => {
    console.log(`    - ${category}: ${count}회`);
  });

  const recoveryStats = getRecoveryStats();
  console.log(`\n복구 통계:`);
  console.log(`  총 ${recoveryStats.totalAttempts}회 복구 시도`);
  console.log(`  성공: ${recoveryStats.successfulRecoveries}회`);
  console.log(`  성공률: ${recoveryStats.successRate}%`);

  console.log('\n\n✨ 테스트 완료!\n');
  console.log('💾 로그 파일:');
  console.log('  - rss-failures.json (실패 로그)');
  console.log('  - rss-recovery.json (복구 시도 로그)');
  console.log('  - rss-health-report.json (건강 체크 리포트)\n');
}

testRecoverySystem();
