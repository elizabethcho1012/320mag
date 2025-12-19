#!/usr/bin/env tsx
// 추가 대체 RSS 소스 테스트 (부족한 카테고리 집중)
import Parser from 'rss-parser';

const parser = new Parser();

// 부족한 카테고리 집중 검색
const moreFeeds = [
  // ============================================
  // 뷰티 - 더 많은 소스 필요
  // ============================================
  { category: '뷰티', name: 'Elle Beauty', url: 'https://www.elle.com/beauty/rss/' },
  { category: '뷰티', name: 'Harper\'s Bazaar Beauty', url: 'https://www.harpersbazaar.com/beauty/rss/' },
  { category: '뷰티', name: 'Vogue Beauty', url: 'https://www.vogue.com/beauty/rss' },
  { category: '뷰티', name: 'Marie Claire Beauty', url: 'https://www.marieclaire.com/beauty/rss/' },
  { category: '뷰티', name: 'Beautylish Blog', url: 'https://www.beautylish.com/articles.rss' },
  { category: '뷰티', name: 'Into The Gloss', url: 'https://intothegloss.com/feed/' },

  // ============================================
  // 여행 - 더 많은 소스 필요
  // ============================================
  { category: '여행', name: 'National Geographic Travel', url: 'https://www.nationalgeographic.com/travel/rss/' },
  { category: '여행', name: 'Forbes Travel', url: 'https://www.forbes.com/travel/feed/' },
  { category: '여행', name: 'Budget Travel', url: 'https://www.budgettravel.com/rss' },
  { category: '여행', name: 'Atlas Obscura', url: 'https://www.atlasobscura.com/feeds/latest' },
  { category: '여행', name: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/travel-blog/rss' },

  // ============================================
  // 라이프스타일 - 더 많은 소스 필요
  // ============================================
  { category: '라이프스타일', name: 'Apartment Therapy Lifestyle', url: 'https://www.apartmenttherapy.com/life.rss' },
  { category: '라이프스타일', name: 'The Kitchn', url: 'https://www.thekitchn.com/main.rss' },
  { category: '라이프스타일', name: 'Cup of Jo', url: 'https://cupofjo.com/feed/' },
  { category: '라이프스타일', name: 'A Beautiful Mess', url: 'https://abeautifulmess.com/feed' },
  { category: '라이프스타일', name: 'Goop', url: 'https://goop.com/feed/' },
  { category: '라이프스타일', name: 'MyDomaine', url: 'https://www.mydomaine.com/rss' },

  // ============================================
  // 섹슈얼리티 - NEW SEXY 핵심! 우선순위 높음
  // ============================================
  { category: '섹슈얼리티', name: 'Good Therapy Relationships', url: 'https://www.goodtherapy.org/blog/rss.xml' },
  { category: '섹슈얼리티', name: 'Relate Institute', url: 'https://www.relate.org.uk/rss.xml' },
  { category: '섹슈얼리티', name: 'Sex and Psychology', url: 'https://www.sexandpsychology.com/feed/' },
  { category: '섹슈얼리티', name: 'The Good Men Project', url: 'https://goodmenproject.com/feed/' },
  { category: '섹슈얼리티', name: 'Scarleteen', url: 'https://www.scarleteen.com/rss.xml' },
  { category: '섹슈얼리티', name: 'Go Ask Alice', url: 'https://goaskalice.columbia.edu/rss.xml' },

  // ============================================
  // 운동 - NEW SEXY 핵심, 더 많은 소스
  // ============================================
  { category: '운동', name: 'Fitness Blender', url: 'https://www.fitnessblender.com/blog/rss' },
  { category: '운동', name: 'Breaking Muscle', url: 'https://breakingmuscle.com/feed/' },
  { category: '운동', name: 'Girls Gone Strong', url: 'https://www.girlsgonestrong.com/feed/' },
  { category: '운동', name: 'Nerd Fitness', url: 'https://www.nerdfitness.com/feed/' },
  { category: '운동', name: 'Yoga Journal', url: 'https://www.yogajournal.com/rss/' },

  // ============================================
  // 건강푸드 - 추가 소스
  // ============================================
  { category: '건강푸드', name: 'Nutrition.gov', url: 'https://www.nutrition.gov/rss.xml' },
  { category: '건강푸드', name: 'Academy of Nutrition', url: 'https://www.eatright.org/rss' },
  { category: '건강푸드', name: 'Precision Nutrition', url: 'https://www.precisionnutrition.com/feed' },
];

async function testFeed(feed: typeof moreFeeds[0]) {
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
  console.log('\n🔍 추가 대체 RSS 소스 테스트 (부족한 카테고리 집중)\n');
  console.log('='.repeat(80));

  const results: { success: boolean; count: number; feed: typeof moreFeeds[0] }[] = [];

  for (const feed of moreFeeds) {
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
  console.log(`   📈 성공률: ${((successResults.length / moreFeeds.length) * 100).toFixed(1)}%`);

  // 카테고리별 성공한 소스 출력
  console.log('\n✅ 카테고리별 작동하는 RSS 소스:\n');
  const categories = [...new Set(successResults.map(r => r.feed.category))];

  categories.forEach(category => {
    const categoryFeeds = successResults.filter(r => r.feed.category === category);
    console.log(`\n🎯 [${category}] - ${categoryFeeds.length}개 소스`);
    categoryFeeds.forEach(r => {
      console.log(`  ✓ ${r.feed.name}`);
      console.log(`    ${r.feed.url}`);
    });
  });

  // 특히 섹슈얼리티와 운동 (NEW SEXY 핵심) 강조
  const sexualityFeeds = successResults.filter(r => r.feed.category === '섹슈얼리티');
  const exerciseFeeds = successResults.filter(r => r.feed.category === '운동');

  console.log('\n' + '='.repeat(80));
  console.log('\n🔥 NEW SEXY 핵심 카테고리 결과:');
  console.log(`   💖 섹슈얼리티: ${sexualityFeeds.length}개 소스 ${sexualityFeeds.length > 0 ? '✅' : '❌'}`);
  console.log(`   💪 운동: ${exerciseFeeds.length}개 소스 ${exerciseFeeds.length > 0 ? '✅' : '❌'}`);

  console.log('\n' + '='.repeat(80));
}

testAllFeeds();
