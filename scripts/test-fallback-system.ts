#!/usr/bin/env tsx
// Fallback 시스템 테스트
import { testAllFallbackSources } from '../src/services/rssFallbackService';

async function main() {
  console.log('🔄 320MAG Fallback 시스템 테스트\n');
  console.log('='.repeat(80));

  const results = await testAllFallbackSources();

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 최종 결과:\n');

  let totalWorking = 0;
  let totalFallbacks = 0;

  for (const [category, sources] of Object.entries(results)) {
    totalWorking += sources.length;
    console.log(`[${category}]`);
    console.log(`   작동하는 대체 소스: ${sources.length}개`);

    if (sources.length > 0) {
      sources.forEach(s => {
        console.log(`   - ${s.name} (우선순위 ${s.priority})`);
      });
    } else {
      console.log(`   ⚠️  작동하는 대체 소스 없음`);
    }
    console.log('');
  }

  console.log('='.repeat(80));
  console.log(`\n총 작동하는 대체 소스: ${totalWorking}개`);

  if (totalWorking >= 20) {
    console.log('✅ 훌륭합니다! 충분한 대체 소스가 있습니다.');
  } else if (totalWorking >= 10) {
    console.log('⚠️  양호하지만 더 많은 대체 소스가 필요합니다.');
  } else {
    console.log('❌ 대체 소스가 부족합니다. 추가 소스를 확보하세요.');
  }

  console.log('\n');
}

main();
