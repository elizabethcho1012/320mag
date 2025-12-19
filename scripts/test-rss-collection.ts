// RSS 수집 테스트 스크립트
// 사용법: npx ts-node scripts/test-rss-collection.ts [카테고리]

import { autoCollectAndProcess } from '../src/lib/rss-fetcher';

const category = process.argv[2] || '패션';
const maxArticles = parseInt(process.argv[3] || '2', 10);

console.log(`
┌─────────────────────────────────────────┐
│  써드트웬티 RSS 자동수집 테스트         │
└─────────────────────────────────────────┘

카테고리: ${category}
수집 개수: ${maxArticles}개
`);

autoCollectAndProcess(category, maxArticles)
  .then((result) => {
    console.log(`\n✅ 테스트 완료!`);
    console.log(`성공: ${result.success}개`);
    console.log(`실패: ${result.failed}개`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 에러 발생:', error);
    process.exit(1);
  });
