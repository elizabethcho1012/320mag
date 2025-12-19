// RSS 피드만 테스트 (Supabase 의존성 제거)
import Parser from 'rss-parser';
import { contentSources } from '../src/data/content-sources';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

const category = process.argv[2] || '패션';

console.log(`\n📡 RSS 피드 수집 테스트\n`);
console.log(`카테고리: ${category}\n`);

const sources = contentSources.filter(
  (s) => s.category === category && s.type === 'rss' && s.isActive
);

console.log(`RSS 소스 ${sources.length}개 발견:`);
sources.forEach((s) => console.log(`  - ${s.name}: ${s.url}`));
console.log('');

async function testRSS() {
  for (const source of sources) {
    try {
      console.log(`\n[${source.name}] 수집 중...`);
      const feed = await parser.parseURL(source.url);

      console.log(`  ✅ 성공! ${feed.items.length}개 아티클 발견`);
      console.log(`  피드 제목: ${feed.title}`);

      // 최신 3개만 출력
      feed.items.slice(0, 3).forEach((item, idx) => {
        console.log(`\n  [${idx + 1}] ${item.title}`);
        console.log(`      날짜: ${item.pubDate || item.isoDate || '날짜 없음'}`);
        console.log(`      링크: ${item.link}`);
        console.log(`      내용: ${(item.contentSnippet || item.content || '').substring(0, 100)}...`);
      });
    } catch (error: any) {
      console.log(`  ❌ 실패: ${error.message}`);
    }
  }
}

testRSS()
  .then(() => {
    console.log('\n\n✅ 테스트 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 에러:', error);
    process.exit(1);
  });
