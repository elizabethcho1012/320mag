#!/usr/bin/env tsx
// Latest 모델명 테스트

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const MODELS = [
  'claude-3-5-sonnet-latest',
  'claude-3-5-sonnet-20241022',
  'claude-3-5-haiku-latest',
  'claude-3-5-haiku-20241022',
  'claude-3-haiku-20240307',
];

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ API 키 없음');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: apiKey.trim() });

  console.log('🚀 사용 가능한 모델 찾기\n');

  for (const model of MODELS) {
    try {
      console.log(`🔄 테스트: ${model}`);

      const message = await client.messages.create({
        model: model,
        max_tokens: 50,
        messages: [{ role: 'user', content: '안녕' }],
      });

      console.log(`✅ ${model} - 성공!`);
      console.log(`   응답: ${message.content[0].type === 'text' ? message.content[0].text : '(텍스트 아님)'}\n`);

      console.log(`\n🎉 사용 가능한 모델 발견: ${model}`);
      process.exit(0);

    } catch (error: any) {
      console.log(`❌ ${model} - ${error.status} ${error.error?.type || error.message}\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('❌ 사용 가능한 모델이 없습니다.');
  console.log('\n💡 해결 방법:');
  console.log('1. https://console.anthropic.com/settings/plans 에서 플랜 확인');
  console.log('2. Free tier는 일부 모델 접근 제한이 있을 수 있습니다');
  console.log('3. API 키 권한 설정 확인: https://console.anthropic.com/settings/keys');
}

main();
