import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

console.log('🔍 최신 모델명으로 테스트\n');

const testModels = [
  'claude-sonnet-4-5-20250929',      // 최신 Sonnet 4.5
  'claude-3-5-sonnet-20241022',      // 이전 Sonnet 3.5
  'claude-haiku-4-5-20251001',       // 최신 Haiku 4.5
  'claude-3-5-haiku-20241022',       // 현재 사용 중인 Haiku
];

async function testModel(modelName: string) {
  const client = new Anthropic({ apiKey: apiKey?.trim() });

  try {
    const message = await client.messages.create({
      model: modelName,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    });

    console.log(`✅ ${modelName}: 사용 가능`);
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      console.log(`❌ ${modelName}: 접근 불가 (404)`);
    } else {
      console.log(`⚠️  ${modelName}: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  for (const model of testModels) {
    await testModel(model);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ 확인 완료');
}

main();
