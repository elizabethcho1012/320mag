// RSS 피드 헬스 모니터링 및 자동 복구 시스템
import Parser from 'rss-parser';
import { supabase } from '../integrations/supabase/client';

const parser = new Parser();

export interface RSSHealthStatus {
  sourceId: string;
  url: string;
  name: string;
  category: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastChecked: string;
  lastSuccessful: string | null;
  articleCount: number;
  errorMessage?: string;
  consecutiveFailures: number;
}

export interface HealthCheckResult {
  healthy: RSSHealthStatus[];
  degraded: RSSHealthStatus[];
  failed: RSSHealthStatus[];
  totalSources: number;
  healthScore: number; // 0-100
}

/**
 * 단일 RSS 피드 헬스 체크
 */
async function checkRSSHealth(source: {
  id: string;
  name: string;
  url: string;
  category: string;
}): Promise<RSSHealthStatus> {
  const now = new Date().toISOString();

  try {
    const feed = await parser.parseURL(source.url);
    const articleCount = feed.items?.length || 0;

    // 상태 판단
    let status: 'healthy' | 'degraded' | 'failed';
    if (articleCount === 0) {
      status = 'degraded'; // RSS는 작동하지만 콘텐츠가 없음
    } else if (articleCount < 3) {
      status = 'degraded'; // 콘텐츠가 너무 적음
    } else {
      status = 'healthy';
    }

    return {
      sourceId: source.id,
      url: source.url,
      name: source.name,
      category: source.category,
      status,
      lastChecked: now,
      lastSuccessful: now,
      articleCount,
      consecutiveFailures: 0,
    };
  } catch (error: any) {
    return {
      sourceId: source.id,
      url: source.url,
      name: source.name,
      category: source.category,
      status: 'failed',
      lastChecked: now,
      lastSuccessful: null,
      articleCount: 0,
      errorMessage: error.message,
      consecutiveFailures: 1,
    };
  }
}

/**
 * 모든 활성 RSS 소스 헬스 체크
 */
export async function checkAllRSSHealth(sources: any[]): Promise<HealthCheckResult> {
  console.log(`\n🏥 RSS 헬스 체크 시작 (${sources.length}개 소스)\n`);

  const results: RSSHealthStatus[] = [];

  for (const source of sources) {
    const health = await checkRSSHealth(source);
    results.push(health);

    const icon = health.status === 'healthy' ? '✅' : health.status === 'degraded' ? '⚠️' : '❌';
    console.log(`${icon} [${health.category}] ${health.name}: ${health.status} (${health.articleCount}개 기사)`);

    // API Rate Limit 방지
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const healthy = results.filter(r => r.status === 'healthy');
  const degraded = results.filter(r => r.status === 'degraded');
  const failed = results.filter(r => r.status === 'failed');

  const healthScore = Math.round((healthy.length / results.length) * 100);

  console.log(`\n📊 헬스 체크 결과:`);
  console.log(`   ✅ 정상: ${healthy.length}개`);
  console.log(`   ⚠️  저하: ${degraded.length}개`);
  console.log(`   ❌ 실패: ${failed.length}개`);
  console.log(`   📈 헬스 스코어: ${healthScore}%\n`);

  return {
    healthy,
    degraded,
    failed,
    totalSources: results.length,
    healthScore,
  };
}

/**
 * 헬스 체크 결과를 데이터베이스에 저장
 */
export async function saveHealthCheckResults(results: HealthCheckResult) {
  const allResults = [...results.healthy, ...results.degraded, ...results.failed];

  for (const result of allResults) {
    // RSS 헬스 로그 테이블에 저장 (테이블이 없으면 생성 필요)
    await supabase.from('rss_health_logs').insert({
      source_id: result.sourceId,
      source_name: result.name,
      source_url: result.url,
      category: result.category,
      status: result.status,
      article_count: result.articleCount,
      error_message: result.errorMessage || null,
      consecutive_failures: result.consecutiveFailures,
      checked_at: result.lastChecked,
    });
  }

  console.log('✅ 헬스 체크 결과를 데이터베이스에 저장했습니다.');
}

/**
 * 카테고리별 헬스 스코어 계산
 */
export function getCategoryHealthScores(results: HealthCheckResult): Record<string, number> {
  const allResults = [...results.healthy, ...results.degraded, ...results.failed];
  const categoryScores: Record<string, { healthy: number; total: number }> = {};

  for (const result of allResults) {
    if (!categoryScores[result.category]) {
      categoryScores[result.category] = { healthy: 0, total: 0 };
    }
    categoryScores[result.category].total++;
    if (result.status === 'healthy') {
      categoryScores[result.category].healthy++;
    }
  }

  const scores: Record<string, number> = {};
  for (const [category, data] of Object.entries(categoryScores)) {
    scores[category] = Math.round((data.healthy / data.total) * 100);
  }

  return scores;
}

/**
 * 실패한 소스에 대한 알림 생성
 */
export function generateHealthAlerts(results: HealthCheckResult): string[] {
  const alerts: string[] = [];

  // 전체 헬스 스코어가 낮음
  if (results.healthScore < 70) {
    alerts.push(`⚠️ 전체 RSS 헬스 스코어가 ${results.healthScore}%로 낮습니다. 확인이 필요합니다.`);
  }

  // 카테고리별 헬스 스코어 확인
  const categoryScores = getCategoryHealthScores(results);
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score < 50) {
      alerts.push(`❌ [${category}] 카테고리의 RSS 소스가 ${score}%만 작동합니다. 대체 소스가 필요합니다.`);
    }
  }

  // 실패한 소스 목록
  if (results.failed.length > 0) {
    alerts.push(`❌ ${results.failed.length}개 RSS 소스 실패:`);
    results.failed.forEach(f => {
      alerts.push(`   - [${f.category}] ${f.name}: ${f.errorMessage}`);
    });
  }

  return alerts;
}
