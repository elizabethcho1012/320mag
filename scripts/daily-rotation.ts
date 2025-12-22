#!/usr/bin/env tsx
// 매일 8개씩 전체 카테고리 수집
// 매일 모든 카테고리에서 1개씩 기사 생성 = 총 8개/일

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { dailyRotationCollection } from '../src/services/contentPipeline';
import { execSync } from 'child_process';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

async function main() {
  console.log('🚀 일일 전체 카테고리 수집 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('💡 매일 8개씩, 모든 카테고리에서 1개씩 수집\n');

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

  // 🔧 STEP 0: RSS 자동 복구 시스템 실행 (매일 1회)
  // 죽은 RSS 소스를 자동으로 비활성화하고 새 소스를 찾아서 추가
  try {
    console.log('='.repeat(60));
    console.log('🔧 RSS 자동 복구 시스템 실행');
    console.log('='.repeat(60));
    console.log('');
    execSync('npx tsx scripts/auto-rss-recovery.ts', {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });
    console.log('\n✅ RSS 자동 복구 완료\n');
  } catch (error) {
    console.error('⚠️  RSS 자동 복구 실패 (무시하고 계속)');
    console.error('   오류:', error);
    console.log('');
  }

  try {
    const result = await dailyRotationCollection(OPENAI_API_KEY, ANTHROPIC_API_KEY);

    console.log('\n📊 오늘의 결과:');
    console.log(`   총 ${result.success}개 기사 생성 (목표: 8개)`);
    console.log(`   실패: ${result.failed}개`);
    console.log(`   비용: 약 ₩${result.success * 154} (${result.success}개 × ₩154)`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  오류 목록:');
      result.errors.forEach((error, idx) => {
        console.log(`   ${idx + 1}. ${error}`);
      });
    }

    // 월간 예상 비용 표시 (GPT-4 + Claude 3.5 Haiku)
    const monthlyEstimate = 8 * 154 * 30; // 8개/일 × ₩154 × 30일
    console.log(`\n💰 월간 예상 비용: 약 ₩${monthlyEstimate.toLocaleString()} (GPT-4 + Haiku 하이브리드)`);

    process.exit(result.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ 치명적 오류:', error);
    process.exit(1);
  }
}

main();
