import dotenv from 'dotenv';

// Load environment variables FIRST before importing any modules that use them
dotenv.config();

import { collectAndRewriteCategory } from '../src/services/contentPipeline';

async function collectMissingCategories() {
  console.log('\n📰 부족한 카테고리 수집 시작 (섹슈얼리티, 운동, 여행, 글로벌푸드, 뷰티)\n');

  // API 키 확인
  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

  console.log('API 키 확인:', {
    anthropic: anthropicKey ? '설정됨' : '없음',
    openai: openaiKey ? '설정됨' : '없음'
  });

  // 부족한 카테고리 수집 (2025-12-20 업데이트)
  const categories = ['섹슈얼리티', '운동', '여행', '글로벌푸드', '뷰티'];
  const counts = [6, 6, 4, 3, 3]; // 중복 이미지 방지를 위해 여유있게 수집

  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const count = counts[i];

      console.log(`\n🔄 [${category}] ${count}개 수집 중...`);

      const categoryResult = await collectAndRewriteCategory(
        category,
        count,
        openaiKey,
        anthropicKey
      );

      result.success += categoryResult.success;
      result.failed += categoryResult.failed;
      result.errors.push(...categoryResult.errors);

      // 카테고리 간 간격
      if (i < categories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n\n📊 최종 결과:');
    console.log(`✅ 성공: ${result.success}개`);
    console.log(`❌ 실패: ${result.failed}개`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  에러 목록:');
      result.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }

    console.log('\n✨ 수집 완료!');
  } catch (error) {
    console.error('\n❌ 수집 중 오류 발생:', error);
    throw error;
  }
}

collectMissingCategories();
