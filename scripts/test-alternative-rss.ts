#!/usr/bin/env tsx
// 대체 RSS 소스 테스트
import Parser from 'rss-parser';

const parser = new Parser();

// 실제로 RSS를 제공하는 40~50대 타겟 매체들
const alternativeFeeds = [
  // ============================================
  // 패션 - 성숙한 여성 스타일
  // ============================================
  { category: '패션', name: 'Who What Wear', url: 'https://www.whowhatwear.com/rss' },
  { category: '패션', name: 'Refinery29 Fashion', url: 'https://www.refinery29.com/en-us/fashion/rss' },
  { category: '패션', name: 'InStyle Fashion', url: 'https://www.instyle.com/fashion/rss' },

  // ============================================
  // 뷰티 - 안티에이징 & 성숙한 피부
  // ============================================
  { category: '뷰티', name: 'Byrdie Beauty', url: 'https://www.byrdie.com/rss' },
  { category: '뷰티', name: 'The Zoe Report Beauty', url: 'https://www.thezoereport.com/beauty/rss' },
  { category: '뷰티', name: 'Refinery29 Beauty', url: 'https://www.refinery29.com/en-us/beauty/rss' },

  // ============================================
  // 여행 - 프리미엄 여행
  // ============================================
  { category: '여행', name: 'Travel + Leisure', url: 'https://www.travelandleisure.com/syndication/feed' },
  { category: '여행', name: 'Lonely Planet', url: 'https://www.lonelyplanet.com/feed' },
  { category: '여행', name: 'Afar Travel', url: 'https://www.afar.com/rss' },

  // ============================================
  // 라이프스타일 - 성숙한 삶
  // ============================================
  { category: '라이프스타일', name: 'Real Simple', url: 'https://www.realsimple.com/syndication/feed' },
  { category: '라이프스타일', name: 'Good Housekeeping', url: 'https://www.goodhousekeeping.com/rss/' },
  { category: '라이프스타일', name: 'Better Homes & Gardens', url: 'https://www.bhg.com/feeds/rss.xml' },
  { category: '라이프스타일', name: 'Martha Stewart', url: 'https://www.marthastewart.com/rss' },

  // ============================================
  // 글로벌푸드 (이미 작동: Eater)
  // ============================================
  { category: '글로벌푸드', name: 'Bon Appétit', url: 'https://www.bonappetit.com/feed/rss' },
  { category: '글로벌푸드', name: 'Food & Wine', url: 'https://www.foodandwine.com/syndication/feed' },
  { category: '글로벌푸드', name: 'Serious Eats', url: 'https://www.seriouseats.com/feed' },

  // ============================================
  // 건강푸드 (이미 작동: Harvard Nutrition)
  // ============================================
  { category: '건강푸드', name: 'Nutrition Action', url: 'https://www.nutritionaction.com/feed/' },
  { category: '건강푸드', name: 'Medical News Today Nutrition', url: 'https://www.medicalnewstoday.com/rss/nutrition.xml' },
  { category: '건강푸드', name: 'Healthline Nutrition', url: 'https://www.healthline.com/nutrition/rss' },

  // ============================================
  // 하우징 (이미 작동: Dezeen)
  // ============================================
  { category: '하우징', name: 'Apartment Therapy', url: 'https://www.apartmenttherapy.com/main.rss' },
  { category: '하우징', name: 'Design Milk', url: 'https://design-milk.com/feed/' },
  { category: '하우징', name: 'Dwell', url: 'https://www.dwell.com/rss' },

  // ============================================
  // 글로벌트렌드 (이미 작동: MIT Tech Review)
  // ============================================
  { category: '글로벌트렌드', name: 'BBC News - Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { category: '글로벌트렌드', name: 'The Economist', url: 'https://www.economist.com/feeds/print-sections/latest/all.xml' },
  { category: '글로벌트렌드', name: 'Wired', url: 'https://www.wired.com/feed/rss' },

  // ============================================
  // 심리 (이미 작동: Mindful)
  // ============================================
  { category: '심리', name: 'Psychology Today General', url: 'https://www.psychologytoday.com/us/blog/feed' },
  { category: '심리', name: 'Tiny Buddha', url: 'https://tinybuddha.com/feed/' },
  { category: '심리', name: 'Psych Central', url: 'https://psychcentral.com/feed/' },

  // ============================================
  // 섹슈얼리티 (NEW SEXY 핵심)
  // ============================================
  { category: '섹슈얼리티', name: 'Healthline Health', url: 'https://www.healthline.com/health/rss' },
  { category: '섹슈얼리티', name: 'WebMD Sex & Relationships', url: 'https://www.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC' },
  { category: '섹슈얼리티', name: 'Everyday Health', url: 'https://www.everydayhealth.com/rss/' },

  // ============================================
  // 운동 (NEW SEXY 핵심)
  // ============================================
  { category: '운동', name: 'Shape Magazine', url: 'https://www.shape.com/rss' },
  { category: '운동', name: 'Self Magazine Fitness', url: 'https://www.self.com/feed/rss' },
  { category: '운동', name: 'Fitness Magazine', url: 'https://www.fitnessmagazine.com/rss/' },
  { category: '운동', name: 'Runner\'s World', url: 'https://www.runnersworld.com/rss/' },
];

async function testFeed(feed: typeof alternativeFeeds[0]) {
  try {
    const result = await parser.parseURL(feed.url);
    const itemCount = result.items?.length || 0;

    if (itemCount > 0) {
      console.log(`✅ [${feed.category}] ${feed.name}: ${itemCount}개 기사`);
      if (result.items[0]?.title) {
        console.log(`   📰 "${result.items[0].title.substring(0, 60)}..."`);
      }
      return { success: true, count: itemCount, feed };
    } else {
      console.log(`⚠️  [${feed.category}] ${feed.name}: RSS 피드가 비어있음`);
      return { success: false, count: 0, feed };
    }
  } catch (error: any) {
    console.log(`❌ [${feed.category}] ${feed.name}: ${error.message}`);
    return { success: false, count: 0, feed };
  }
}

async function testAllFeeds() {
  console.log('\n🔍 대체 RSS 소스 테스트 시작\n');
  console.log('='.repeat(80));

  const results: { success: boolean; count: number; feed: typeof alternativeFeeds[0] }[] = [];

  for (const feed of alternativeFeeds) {
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
  console.log(`   📈 성공률: ${((successResults.length / alternativeFeeds.length) * 100).toFixed(1)}%`);

  // 카테고리별 성공한 소스 출력
  console.log('\n✅ 카테고리별 작동하는 RSS 소스:\n');
  const categories = [...new Set(successResults.map(r => r.feed.category))];

  categories.forEach(category => {
    const categoryFeeds = successResults.filter(r => r.feed.category === category);
    console.log(`\n[${category}] - ${categoryFeeds.length}개 소스`);
    categoryFeeds.forEach(r => {
      console.log(`  ✓ ${r.feed.name}`);
      console.log(`    ${r.feed.url}`);
    });
  });

  console.log('\n' + '='.repeat(80));
}

testAllFeeds();
