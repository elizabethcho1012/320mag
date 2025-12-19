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

console.log('🔍 Anthropic API 모델 확인\n');

const testModels = [
  'claude-3-5-sonnet-20241022',
  'claude-3-5-sonnet-latest',
  'claude-3-5-haiku-20241022',
  'claude-3-5-haiku-latest',
  'claude-3-opus-20240229',
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
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit 방지
  }

  console.log('\n✅ 확인 완료');
}

main();
