#!/usr/bin/env tsx
// 남은 카테고리 채우기: 뷰티(1개), 운동(1개), 하우징(4개)
import dotenv from 'dotenv';
dotenv.config();

import { collectAndRewriteCategory } from '../src/services/contentPipeline';

async function fillRemaining() {
  console.log('\n🚀 남은 카테고리 채우기 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}\n`);

  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  if (!anthropicKey || !openaiKey) {
    console.error('❌ API 키가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 남은 카테고리별 필요 개수
  const tasks = [
    { category: '뷰티', count: 1 },
    { category: '운동', count: 1 },
    { category: '하우징', count: 4 },
  ];

  let totalSuccess = 0;
  let totalFailed = 0;
  const allErrors: string[] = [];

  for (const task of tasks) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 [${task.category}] ${task.count}개 수집 중...`);
    console.log(`${'='.repeat(60)}`);

    try {
      const result = await collectAndRewriteCategory(
        task.category,
        task.count,
        openaiKey,
        anthropicKey
      );

      totalSuccess += result.success;
      totalFailed += result.failed;
      allErrors.push(...result.errors);

      console.log(`\n✅ [${task.category}] 완료`);
      console.log(`   성공: ${result.success}/${task.count}개`);
      console.log(`   실패: ${result.failed}개`);

      // 카테고리 간 간격 (rate limiting 방지)
      if (tasks.indexOf(task) < tasks.length - 1) {
        console.log('   ⏳ 5초 대기 중... (rate limiting 방지)');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error: any) {
      console.error(`\n❌ [${task.category}] 실패:`, error.message);
      totalFailed += task.count;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 수집 완료!');
  console.log('='.repeat(60));
  console.log(`✅ 총 성공: ${totalSuccess}개`);
  console.log(`❌ 총 실패: ${totalFailed}개`);
  console.log(`💰 비용: 약 ₩${totalSuccess * 154}`);

  if (allErrors.length > 0) {
    console.log(`\n⚠️  오류 목록 (${allErrors.length}개):`);
    allErrors.slice(0, 10).forEach((error, idx) => {
      console.log(`   ${idx + 1}. ${error}`);
    });
    if (allErrors.length > 10) {
      console.log(`   ... 외 ${allErrors.length - 10}개`);
    }
  }

  console.log('\n');
  process.exit(totalFailed > totalSuccess ? 1 : 0);
}

fillRemaining();
