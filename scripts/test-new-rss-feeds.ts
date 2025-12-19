#!/usr/bin/env tsx
// NEW SEXY RSS 피드 테스트
import Parser from 'rss-parser';

const parser = new Parser();

// 테스트할 주요 RSS 피드들
const testFeeds = [
  // 패션
  { category: '패션', name: 'Vogue Fashion', url: 'https://www.vogue.com/fashion/rss' },

  // 뷰티
  { category: '뷰티', name: 'Prevention Beauty', url: 'https://www.prevention.com/beauty/rss' },

  // 여행
  { category: '여행', name: 'Condé Nast Traveler', url: 'https://www.cntraveler.com/rss' },
  { category: '여행', name: 'AARP Travel', url: 'https://www.aarp.org/travel/rss' },

  // 라이프스타일
  { category: '라이프스타일', name: 'AARP Magazine', url: 'https://www.aarp.org/magazine/rss' },
  { category: '라이프스타일', name: 'Next Avenue', url: 'https://www.nextavenue.org/feed/' },
  { category: '라이프스타일', name: 'Oprah Daily', url: 'https://www.oprahdaily.com/rss/' },

  // 글로벌푸드
  { category: '글로벌푸드', name: 'Saveur', url: 'https://www.saveur.com/rss' },
  { category: '글로벌푸드', name: 'Eater', url: 'https://www.eater.com/rss/index.xml' },

  // 건강푸드
  { category: '건강푸드', name: 'Harvard Nutrition', url: 'https://www.hsph.harvard.edu/nutritionsource/feed/' },
  { category: '건강푸드', name: 'EatingWell', url: 'https://www.eatingwell.com/rss' },
  { category: '건강푸드', name: 'Cleveland Clinic', url: 'https://health.clevelandclinic.org/category/nutrition/feed/' },

  // 하우징
  { category: '하우징', name: 'Dezeen', url: 'https://www.dezeen.com/feed/' },
  { category: '하우징', name: 'Architectural Digest', url: 'https://www.architecturaldigest.com/rss' },

  // 글로벌트렌드
  { category: '글로벌트렌드', name: 'World Economic Forum', url: 'https://www.weforum.org/rss/' },
  { category: '글로벌트렌드', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/' },

  // 시니어시장
  { category: '시니어시장', name: 'AARP Money', url: 'https://www.aarp.org/money/rss' },

  // 심리
  { category: '심리', name: 'Greater Good', url: 'https://greatergood.berkeley.edu/feed' },
  { category: '심리', name: 'Psychology Today - Aging', url: 'https://www.psychologytoday.com/us/basics/aging/feed' },
  { category: '심리', name: 'Mindful', url: 'https://www.mindful.org/feed/' },

  // 섹슈얼리티 (NEW SEXY 핵심)
  { category: '섹슈얼리티', name: 'Psychology Today - Sex', url: 'https://www.psychologytoday.com/us/basics/sex/feed' },
  { category: '섹슈얼리티', name: 'Healthline Sex', url: 'https://www.healthline.com/health/healthy-sex/feed' },
  { category: '섹슈얼리티', name: "Women's Health", url: 'https://www.womenshealthmag.com/sex-and-love/rss' },
  { category: '섹슈얼리티', name: 'AARP Relationships', url: 'https://www.aarp.org/home-family/sex-intimacy/rss' },

  // 운동 (NEW SEXY 핵심)
  { category: '운동', name: 'Prevention Fitness', url: 'https://www.prevention.com/fitness/rss' },
  { category: '운동', name: 'AARP Health', url: 'https://www.aarp.org/health/healthy-living/rss' },
  { category: '운동', name: "Women's Health Fitness", url: 'https://www.womenshealthmag.com/fitness/rss' },
];

async function testFeed(feed: typeof testFeeds[0]) {
  try {
    const result = await parser.parseURL(feed.url);
    const itemCount = result.items?.length || 0;

    if (itemCount > 0) {
      console.log(`✅ [${feed.category}] ${feed.name}: ${itemCount}개 기사`);
      // 최신 기사 제목 미리보기
      if (result.items[0]?.title) {
        console.log(`   📰 "${result.items[0].title.substring(0, 60)}..."`);
      }
      return { success: true, count: itemCount };
    } else {
      console.log(`⚠️  [${feed.category}] ${feed.name}: RSS 피드가 비어있음`);
      return { success: false, count: 0 };
    }
  } catch (error: any) {
    console.log(`❌ [${feed.category}] ${feed.name}: ${error.message}`);
    return { success: false, count: 0 };
  }
}

async function testAllFeeds() {
  console.log('\n🔍 NEW SEXY RSS 피드 테스트 시작\n');
  console.log('='.repeat(80));

  let successCount = 0;
  let failCount = 0;

  for (const feed of testFeeds) {
    const result = await testFeed(feed);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 테스트 결과:');
  console.log(`   ✅ 성공: ${successCount}개`);
  console.log(`   ❌ 실패: ${failCount}개`);
  console.log(`   📈 성공률: ${((successCount / testFeeds.length) * 100).toFixed(1)}%`);

  if (failCount > 0) {
    console.log('\n⚠️  실패한 피드는 URL을 수정하거나 대체 소스를 찾아야 합니다.');
  } else {
    console.log('\n🎉 모든 RSS 피드가 정상 작동합니다!');
  }

  console.log('\n' + '='.repeat(80));
}

testAllFeeds();
