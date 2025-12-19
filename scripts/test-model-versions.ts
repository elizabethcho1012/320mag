#!/usr/bin/env tsx
// 여러 Claude 모델 버전 테스트

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

const MODELS_TO_TEST = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-20240620',
  'claude-3-sonnet-20240229',
  'claude-3-opus-20240229',
];

async function testModel(client: Anthropic, modelName: string) {
  try {
    console.log(`\n🔄 테스트: ${modelName}`);

    const message = await client.messages.create({
      model: modelName,
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: '안녕하세요',
        },
      ],
    });

    console.log(`✅ ${modelName} - 성공!`);
    console.log(`   응답: ${message.content[0].type === 'text' ? message.content[0].text.substring(0, 50) : '(텍스트 아님)'}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${modelName} - 실패: ${error.status} ${error.error?.type || error.message}`);
    return false;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ API 키 없음');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey: apiKey.trim() });

  console.log('🚀 사용 가능한 Claude 모델 찾기\n');

  let successfulModel = null;
  for (const model of MODELS_TO_TEST) {
    const success = await testModel(client, model);
    if (success && !successfulModel) {
      successfulModel = model;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (successfulModel) {
    console.log(`\n✅ 권장 모델: ${successfulModel}`);
  } else {
    console.log('\n❌ 사용 가능한 모델을 찾지 못했습니다.');
  }
}

main();
