// RSS 피드만 테스트 (AI 리라이팅 없이)
import { fetchAllRSSByCategory } from '../src/lib/rss-fetcher';

const category = process.argv[2] || '패션';

console.log(`\n📡 RSS 피드 수집 테스트 (AI 리라이팅 없음)\n`);
console.log(`카테고리: ${category}\n`);

fetchAllRSSByCategory(category)
  .then((articles) => {
    console.log(`\n✅ 수집 완료: ${articles.length}개 아티클\n`);

    articles.slice(0, 3).forEach((article, index) => {
      console.log(`\n[${index + 1}] ${article.title}`);
      console.log(`   소스: ${article.sourceName}`);
      console.log(`   링크: ${article.link}`);
      console.log(`   내용: ${article.content.substring(0, 150)}...`);
      console.log(`   이미지: ${article.imageUrl || '없음'}`);
    });

    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 에러:', error);
    process.exit(1);
  });
