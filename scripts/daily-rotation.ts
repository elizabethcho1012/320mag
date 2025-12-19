#!/usr/bin/env tsx
// 매일 3개씩 요일별 카테고리 순환 수집
// 가장 경제적이고 효율적인 콘텐츠 수집 방식

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { dailyRotationCollection } from '../src/services/contentPipeline';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

async function main() {
  console.log('🚀 일일 순환 수집 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('💡 매일 3개씩, 요일별 카테고리 순환 방식\n');

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키가 설정되지 않았습니다.');
    console.error('환경 변수 OPENAI_API_KEY를 설정하세요.');
    process.exit(1);
  }

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ Anthropic API 키가 설정되지 않았습니다.');
    console.error('환경 변수 ANTHROPIC_API_KEY를 설정하세요.');
    process.exit(1);
  }

  try {
    const result = await dailyRotationCollection(OPENAI_API_KEY, ANTHROPIC_API_KEY);

    console.log('\n📊 오늘의 결과:');
    console.log(`   총 ${result.success}개 기사 생성`);
    console.log(`   실패: ${result.failed}개`);
    console.log(`   비용: 약 ₩${result.success * 27} (${result.success}개 × ₩27)`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  오류 목록:');
      result.errors.forEach((error, idx) => {
        console.log(`   ${idx + 1}. ${error}`);
      });
    }

    // 월간 예상 비용 표시 (Claude 3.5 Haiku)
    const monthlyEstimate = result.success * 27 * 30;
    console.log(`\n💰 월간 예상 비용: 약 ₩${monthlyEstimate.toLocaleString()} (GPT-4 + Haiku 하이브리드)`);

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ 치명적 오류:', error);
    process.exit(1);
  }
}

main();
