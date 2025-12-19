#!/usr/bin/env tsx
// 뷰티 카테고리 집중 RSS 소스 찾기
import Parser from 'rss-parser';

const parser = new Parser();

// 뷰티 관련 더 많은 RSS 소스 테스트
const beautySources = [
  // 주요 뷰티 매거진
  { name: 'Allure', url: 'https://www.allure.com/feed/rss' },
  { name: 'Allure Beauty', url: 'https://www.allure.com/beauty/rss' },
  { name: 'Elle Beauty', url: 'https://www.elle.com/beauty/feed/' },
  { name: 'Vogue Beauty', url: 'https://www.vogue.com/beauty/feed' },
  { name: 'Harper Bazaar Beauty', url: 'https://www.harpersbazaar.com/beauty/feed/' },
  { name: 'Marie Claire Beauty', url: 'https://www.marieclaire.com/beauty/feed/' },
  { name: 'Cosmopolitan Beauty', url: 'https://www.cosmopolitan.com/style-beauty/beauty/rss' },

  // 뷰티 전문 사이트
  { name: 'Byrdie', url: 'https://www.byrdie.com/feeds/all' },
  { name: 'Byrdie Skincare', url: 'https://www.byrdie.com/skincare-4427743/rss' },
  { name: 'Into The Gloss', url: 'https://intothegloss.com/feed' },
  { name: 'The Zoe Report', url: 'https://www.thezoereport.com/rss' },
  { name: 'Beautylish', url: 'https://www.beautylish.com/articles/rss' },
  { name: 'Temptalia', url: 'https://www.temptalia.com/feed/' },
  { name: 'Makeup.com', url: 'https://www.makeup.com/feed' },

  // 헬스 & 뷰티
  { name: 'Prevention Beauty', url: 'https://www.prevention.com/beauty/feed' },
  { name: 'Women\'s Health Beauty', url: 'https://www.womenshealthmag.com/beauty/feed/' },
  { name: 'Good Housekeeping Beauty', url: 'https://www.goodhousekeeping.com/beauty/feed/' },
  { name: 'Real Simple Beauty', url: 'https://www.realsimple.com/beauty-fashion/feed' },

  // 스킨케어 전문
  { name: 'Paula\'s Choice Blog', url: 'https://www.paulaschoice.com/expert-advice/feed' },
  { name: 'Dermstore Blog', url: 'https://blog.dermstore.com/feed/' },
  { name: 'SkinStore Blog', url: 'https://www.skinstore.com/blog/feed/' },
  { name: 'Sephora Stories', url: 'https://www.sephora.com/beauty/feed' },

  // 뷰티 뉴스
  { name: 'WWD Beauty', url: 'https://wwd.com/beauty-industry-news/feed/' },
  { name: 'Beauty Independent', url: 'https://www.beautyindependent.com/feed/' },
  { name: 'Glossy', url: 'https://www.glossy.co/feed/' },

  // 라이프스타일 + 뷰티
  { name: 'Refinery29 Beauty', url: 'https://www.refinery29.com/beauty/feed' },
  { name: 'Who What Wear Beauty', url: 'https://www.whowhatwear.com/beauty/feed' },
  { name: 'PureWow Beauty', url: 'https://www.purewow.com/beauty/feed' },
  { name: 'The Strategist Beauty', url: 'https://nymag.com/strategist/beauty/feed' },

  // 네이처럴 뷰티
  { name: 'Organic Spa', url: 'https://www.organicspamagazine.com/feed/' },
  { name: 'The Chalkboard Mag', url: 'https://thechalkboardmag.com/feed' },
  { name: 'Naturally Curly', url: 'https://www.naturallycurly.com/feed' },
];

async function testFeed(feed: typeof beautySources[0]) {
  try {
    const result = await parser.parseURL(feed.url);
    const itemCount = result.items?.length || 0;

    if (itemCount > 0) {
      console.log(`✅ ${feed.name}: ${itemCount}개 기사`);
      if (result.items[0]?.title) {
        console.log(`   📰 "${result.items[0].title.substring(0, 60)}..."`);
      }
      return { success: true, count: itemCount, feed };
    } else {
      console.log(`⚠️  ${feed.name}: RSS 피드가 비어있음`);
      return { success: false, count: 0, feed };
    }
  } catch (error: any) {
    console.log(`❌ ${feed.name}: ${error.message}`);
    return { success: false, count: 0, feed };
  }
}

async function testAllFeeds() {
  console.log('\n💄 뷰티 카테고리 RSS 소스 집중 테스트\n');
  console.log('='.repeat(80));

  const results: { success: boolean; count: number; feed: typeof beautySources[0] }[] = [];

  for (const feed of beautySources) {
    const result = await testFeed(feed);
    results.push(result);
    // API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));

  const successResults = results.filter(r => r.success);
  const failResults = results.filter(r => !r.success);

  console.log('\n📊 테스트 결과:');
  console.log(`   ✅ 성공: ${successResults.length}개`);
  console.log(`   ❌ 실패: ${failResults.length}개`);
  console.log(`   📈 성공률: ${((successResults.length / beautySources.length) * 100).toFixed(1)}%`);

  if (successResults.length > 0) {
    console.log('\n✅ 작동하는 뷰티 RSS 소스:\n');
    successResults.forEach(r => {
      console.log(`  ✓ ${r.feed.name} (${r.count}개 기사)`);
      console.log(`    ${r.feed.url}`);
    });
  } else {
    console.log('\n❌ 작동하는 뷰티 RSS 소스가 없습니다!');
    console.log('   대안: 웹 스크래핑 또는 뷰티 API 사용 필요');
  }

  console.log('\n' + '='.repeat(80));
}

testAllFeeds();
