#!/usr/bin/env tsx
// Anthropic API 키 테스트
import dotenv from 'dotenv';
dotenv.config();

import Anthropic from '@anthropic-ai/sdk';

async function testApiKey() {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error('❌ API 키가 없습니다');
    process.exit(1);
  }

  console.log('🔑 API 키 형식 확인:');
  console.log(`   길이: ${apiKey.length}자`);
  console.log(`   시작: ${apiKey.substring(0, 20)}...`);
  console.log(`   끝: ...${apiKey.substring(apiKey.length - 10)}`);

  try {
    const client = new Anthropic({ apiKey });

    console.log('\n🧪 간단한 API 호출 테스트...');
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: '안녕하세요, 간단히 인사만 해주세요.'
      }]
    });

    console.log('✅ API 키 정상 작동!');
    console.log(`   응답: ${response.content[0].type === 'text' ? response.content[0].text : ''}`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Usage: ${JSON.stringify(response.usage)}`);

  } catch (error: any) {
    console.error('❌ API 호출 실패:');
    console.error(`   에러: ${error.message}`);
    console.error(`   상태: ${error.status}`);
    if (error.error) {
      console.error(`   상세: ${JSON.stringify(error.error, null, 2)}`);
    }
    process.exit(1);
  }
}

testApiKey();
