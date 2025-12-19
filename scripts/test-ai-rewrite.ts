// AI 에디터 리라이팅 테스트 스크립트
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env 파일을 직접 읽어서 환경 변수 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');
const envConfig = dotenv.parse(readFileSync(envPath));

// 환경 변수에 설정
Object.keys(envConfig).forEach(key => {
  process.env[key] = envConfig[key];
});

// 이제 서비스를 import
import { rewriteContent } from '../src/services/aiRewriteService';

const testArticle = {
  category: '패션',
  originalTitle: 'American Eagle Turns to Martha Stewart for Its Holiday Campaign',
  content: `American Eagle is bridging generations this holiday season by featuring Martha Stewart in its latest campaign. The 82-year-old lifestyle icon appears in videos for the Gen Z-focused brand, modeling cozy holiday sweaters and sharing her favorite gift ideas. The unexpected collaboration aims to appeal to both younger shoppers and their parents during the crucial holiday shopping period. Stewart's involvement brings a touch of timeless style to American Eagle's traditionally youth-oriented marketing, while introducing the brand to her substantial following of style-conscious consumers across age groups.`,
  originalUrl: 'https://wwd.com/business-news/retail/american-eagle-martha-stewart-holiday-campaign-1238356265/',
};

console.log('\n🤖 AI 에디터 리라이팅 테스트\n');
console.log('='.repeat(60));
console.log(`카테고리: ${testArticle.category}`);
console.log(`원문 제목: ${testArticle.originalTitle}`);
console.log('='.repeat(60));
console.log('\n원문 내용:');
console.log(testArticle.content);
console.log('\n' + '='.repeat(60));
console.log('\n🔄 AI 에디터 리라이팅 중...\n');

async function testRewrite() {
  try {
    // .env 파일에서 API 키 가져오기
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT FOUND');

    const result = await rewriteContent({
      content: testArticle.content,
      category: testArticle.category,
      originalTitle: testArticle.originalTitle,
      originalUrl: testArticle.originalUrl,
      apiKey, // API 키 직접 전달
    });

    console.log('✅ 리라이팅 성공!\n');
    console.log('='.repeat(60));
    console.log(`에디터: ${result.editorName} (${result.editorId})`);
    console.log('='.repeat(60));
    console.log(`\n📰 리라이팅된 제목:`);
    console.log(result.title);
    console.log(`\n📝 리라이팅된 내용:`);
    console.log(result.content);
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ 테스트 완료!');
  } catch (error: any) {
    console.error('\n❌ 리라이팅 실패:', error.message);
    process.exit(1);
  }
}

testRewrite();
