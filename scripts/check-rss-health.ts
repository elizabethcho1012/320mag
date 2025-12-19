#!/usr/bin/env tsx
// RSS 헬스 체크 스크립트
import { contentSources } from '../src/data/content-sources';
import { checkAllRSSHealth, generateHealthAlerts, getCategoryHealthScores } from '../src/services/rssHealthMonitor';

async function main() {
  console.log('🏥 320MAG RSS 헬스 모니터링 시스템\n');
  console.log('='.repeat(80));

  // 모든 활성 소스 헬스 체크
  const activeSources = contentSources.filter(s => s.isActive);
  const healthResults = await checkAllRSSHealth(activeSources);

  // 카테고리별 헬스 스코어
  const categoryScores = getCategoryHealthScores(healthResults);

  console.log('\n📊 카테고리별 헬스 스코어:\n');
  for (const [category, score] of Object.entries(categoryScores)) {
    const icon = score >= 80 ? '✅' : score >= 50 ? '⚠️' : '❌';
    console.log(`${icon} [${category}]: ${score}%`);
  }

  // 알림 생성
  const alerts = generateHealthAlerts(healthResults);

  if (alerts.length > 0) {
    console.log('\n🚨 알림:\n');
    alerts.forEach(alert => console.log(alert));
  } else {
    console.log('\n✅ 모든 RSS 소스가 정상 작동 중입니다!');
  }

  // 실패한 소스에 대한 상세 정보
  if (healthResults.failed.length > 0) {
    console.log('\n❌ 실패한 소스 상세 정보:\n');
    healthResults.failed.forEach(f => {
      console.log(`[${f.category}] ${f.name}`);
      console.log(`   URL: ${f.url}`);
      console.log(`   Error: ${f.errorMessage}`);
      console.log('');
    });
  }

  // 저하된 소스에 대한 상세 정보
  if (healthResults.degraded.length > 0) {
    console.log('\n⚠️  품질이 저하된 소스:\n');
    healthResults.degraded.forEach(d => {
      console.log(`[${d.category}] ${d.name}`);
      console.log(`   URL: ${d.url}`);
      console.log(`   기사 수: ${d.articleCount}개 (권장: 3개 이상)`);
      console.log('');
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n최종 헬스 스코어: ${healthResults.healthScore}%`);

  if (healthResults.healthScore >= 90) {
    console.log('🎉 훌륭합니다! 시스템이 최상의 상태입니다.');
  } else if (healthResults.healthScore >= 70) {
    console.log('✅ 양호합니다. 일부 소스를 모니터링하세요.');
  } else if (healthResults.healthScore >= 50) {
    console.log('⚠️  주의 필요. 여러 소스에 문제가 있습니다.');
  } else {
    console.log('❌ 위험! 대부분의 소스가 작동하지 않습니다. 즉시 조치가 필요합니다.');
  }

  console.log('\n');
}

main();
