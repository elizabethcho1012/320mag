#!/usr/bin/env tsx
// Anthropic API 직접 테스트 (최소한의 코드)

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';

async function testAnthropicDirect() {
  console.log('🔍 Anthropic API 직접 테스트\n');

  // 환경 변수에서 API 키 가져오기
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

  console.log('📋 API 키 정보:');
  console.log(`   - 환경변수 설정: ${apiKey ? '✅' : '❌'}`);
  if (apiKey) {
    console.log(`   - 키 시작: ${apiKey.substring(0, 20)}...`);
    console.log(`   - 키 길이: ${apiKey.length}자`);
    console.log(`   - 공백 포함: ${apiKey !== apiKey.trim() ? '⚠️ 예' : '✅ 아니오'}`);
    console.log(`   - 따옴표 포함: ${/['"]/.test(apiKey) ? '⚠️ 예' : '✅ 아니오'}\n`);
  } else {
    console.error('❌ API 키를 찾을 수 없습니다.');
    process.exit(1);
  }

  // API 키 정리 (공백, 따옴표 제거)
  const cleanKey = apiKey.trim().replace(/^["']|["']$/g, '');

  if (cleanKey !== apiKey) {
    console.log('⚠️  API 키에서 공백/따옴표 제거됨\n');
  }

  try {
    console.log('🚀 Anthropic 클라이언트 생성 중...');
    const client = new Anthropic({
      apiKey: cleanKey,
    });
    console.log('✅ 클라이언트 생성 완료\n');

    console.log('📤 테스트 메시지 전송 중...');
    console.log('   모델: claude-3-5-sonnet-20241022');
    console.log('   내용: "안녕하세요" 응답 요청\n');

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Try latest version
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: '안녕하세요라고 한국어로 짧게 대답해주세요.',
        },
      ],
    });

    // If above fails, try alternative model names:
    // - claude-3-5-sonnet-20240620 (older version)
    // - claude-3-sonnet-20240229 (Claude 3 Sonnet)

    console.log('✅ API 호출 성공!\n');
    console.log('📥 응답 내용:');
    console.log('   - ID:', message.id);
    console.log('   - 모델:', message.model);
    console.log('   - Role:', message.role);
    console.log('   - 내용:', message.content[0].type === 'text' ? message.content[0].text : '(텍스트 아님)');
    console.log('\n✅ Anthropic API 인증 성공!');

  } catch (error: any) {
    console.error('\n❌ Anthropic API 호출 실패:\n');
    console.error('에러 타입:', error.constructor.name);
    console.error('에러 메시지:', error.message);

    if (error.status) {
      console.error('HTTP 상태:', error.status);
    }

    if (error.error) {
      console.error('상세 정보:', JSON.stringify(error.error, null, 2));
    }

    console.error('\n🔍 문제 해결 방법:');
    console.error('1. Anthropic Console 확인: https://console.anthropic.com/settings/keys');
    console.error('2. API 키가 활성화되어 있는지 확인');
    console.error('3. 크레딧 잔액 확인: https://console.anthropic.com/settings/billing');
    console.error('4. Workspace 설정 확인: https://console.anthropic.com/settings/workspaces');

    process.exit(1);
  }
}

testAnthropicDirect();
