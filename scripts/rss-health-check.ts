import dotenv from 'dotenv';
dotenv.config();

import Parser from 'rss-parser';
import { contentSources } from '../src/data/content-sources';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface HealthCheckResult {
  id: string;
  name: string;
  url: string;
  category: string;
  status: 'healthy' | 'error';
  statusCode?: number;
  error?: string;
  articleCount?: number;
  latestArticle?: string;
  checkedAt: string;
}

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

/**
 * RSS 소스 하나의 건강 상태 체크
 */
async function checkRSSSource(source: any): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    id: source.id,
    name: source.name,
    url: source.url,
    category: source.category,
    status: 'error',
    checkedAt: new Date().toISOString(),
  };

  try {
    // HTTP 상태 확인 먼저
    const response = await fetch(source.url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    result.statusCode = response.status;

    if (response.status !== 200) {
      result.error = `HTTP ${response.status}`;
      return result;
    }

    // RSS 파싱 시도
    const feed = await parser.parseURL(source.url);

    if (!feed.items || feed.items.length === 0) {
      result.error = 'No articles found';
      return result;
    }

    // 성공!
    result.status = 'healthy';
    result.articleCount = feed.items.length;
    result.latestArticle = feed.items[0]?.title || 'Unknown';

    return result;
  } catch (error: any) {
    result.error = error.message || 'Unknown error';
    return result;
  }
}

/**
 * 모든 RSS 소스 건강 체크
 */
async function runHealthCheck() {
  console.log('\n🏥 RSS Health Check System\n');
  console.log(`📊 총 ${contentSources.length}개 소스 검사 중...\n`);

  const results: HealthCheckResult[] = [];
  const errors: string[] = [];

  for (const source of contentSources) {
    if (source.type !== 'rss') continue;

    process.stdout.write(`🔍 ${source.name} (${source.category})... `);

    const result = await checkRSSSource(source);
    results.push(result);

    if (result.status === 'healthy') {
      console.log(`✅ OK (${result.articleCount} articles)`);
    } else {
      console.log(`❌ ${result.error}`);
      errors.push(`${source.name} (${source.category}): ${result.error}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 결과 요약
  const healthy = results.filter(r => r.status === 'healthy').length;
  const broken = results.filter(r => r.status === 'error').length;

  console.log('\n\n📋 Health Check 결과 요약\n');
  console.log(`✅ 정상: ${healthy}개`);
  console.log(`❌ 문제: ${broken}개`);
  console.log(`📊 성공률: ${Math.round((healthy / results.length) * 100)}%\n`);

  // 카테고리별 건강 상태
  console.log('\n📂 카테고리별 건강 상태:\n');

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const healthyCount = categoryResults.filter(r => r.status === 'healthy').length;
    const totalCount = categoryResults.length;

    const status = healthyCount === totalCount ? '✅' : healthyCount > 0 ? '⚠️ ' : '❌';
    console.log(`  ${status} ${category}: ${healthyCount}/${totalCount} 정상`);
  }

  // 문제 있는 소스 상세
  if (broken > 0) {
    console.log('\n\n⚠️  문제 있는 소스 상세:\n');

    errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }

  // JSON 리포트 저장
  const reportPath = join(process.cwd(), 'rss-health-report.json');
  const report = {
    checkedAt: new Date().toISOString(),
    summary: {
      total: results.length,
      healthy,
      broken,
      successRate: Math.round((healthy / results.length) * 100),
    },
    results,
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n\n💾 리포트 저장: ${reportPath}`);

  // 대체 소스 제안
  if (broken > 0) {
    console.log('\n\n💡 대체 소스 제안:\n');

    const brokenByCategory = results
      .filter(r => r.status === 'error')
      .reduce((acc, r) => {
        if (!acc[r.category]) acc[r.category] = [];
        acc[r.category].push(r.name);
        return acc;
      }, {} as Record<string, string[]>);

    for (const [category, sources] of Object.entries(brokenByCategory)) {
      console.log(`\n  📂 ${category}:`);
      sources.forEach(source => {
        console.log(`    ❌ ${source}`);
      });

      // 대체 소스 제안 (카테고리별)
      const suggestions = getSuggestions(category);
      if (suggestions.length > 0) {
        console.log(`    💡 대체 후보:`);
        suggestions.forEach(s => console.log(`       - ${s}`));
      }
    }
  }

  console.log('\n✨ Health Check 완료!\n');
}

/**
 * 카테고리별 대체 RSS 소스 제안
 */
function getSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    '패션': [
      'WWD (Women\'s Wear Daily) - https://wwd.com/feed/',
      'Fashionista - https://fashionista.com/feed',
      'The Fashion Spot - https://www.thefashionspot.com/feed/',
    ],
    '뷰티': [
      'Allure Magazine - https://www.allure.com/feed/rss',
      'Byrdie - https://www.byrdie.com/feeds/all',
      'Coveteur - https://coveteur.com/feed',
    ],
    '여행': [
      'Travel + Leisure - https://www.travelandleisure.com/rss',
      'Afar Magazine - https://www.afar.com/magazine/rss',
      'National Geographic Travel - https://www.nationalgeographic.com/travel/rss',
    ],
    '글로벌푸드': [
      'Eater - https://www.eater.com/rss/index.xml',
      'Food & Wine - https://www.foodandwine.com/rss',
      'Bon Appétit - https://www.bonappetit.com/feed/rss',
    ],
    '건강푸드': [
      'EatingWell - https://www.eatingwell.com/rss',
      'Nutrition Action - https://www.nutritionaction.com/rss',
      'Food Navigator - https://www.foodnavigator.com/rss',
    ],
    '운동': [
      'Men\'s Health Fitness - https://www.menshealth.com/fitness/rss',
      'Women\'s Health Fitness - https://www.womenshealthmag.com/fitness/rss',
      'Runner\'s World - https://www.runnersworld.com/rss',
    ],
    '섹슈얼리티': [
      'Good Therapy - https://www.goodtherapy.org/blog/feed/',
      'Healthline Sexual Health - https://www.healthline.com/health/healthy-sex/rss',
      'WebMD Sexual Health - https://www.webmd.com/sex-relationships/rss',
    ],
    '심리': [
      'Greater Good Magazine - https://greatergood.berkeley.edu/feed',
      'Mind Body Green Psychology - https://www.mindbodygreen.com/articles.rss',
      'Therapy Tribe - https://www.therapytribe.com/blog/feed/',
    ],
  };

  return suggestions[category] || [];
}

runHealthCheck();
