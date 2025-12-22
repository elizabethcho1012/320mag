/**
 * Automatic Recovery Mechanism
 *
 * RSS 소스 실패 시 자동으로 대체 소스로 fallback
 * - 실패 로깅 및 추적
 * - 자동 재시도 로직
 * - 우선순위 기반 대체 소스 선택
 */

import Parser from 'rss-parser';
import { getAlternativesByCategory, AlternativeSource } from '../data/alternative-sources';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
});

interface FailureLog {
  sourceId: string;
  sourceName: string;
  url: string;
  category: string;
  error: string;
  timestamp: string;
  retryCount: number;
}

interface RecoveryAttempt {
  originalSourceId: string;
  alternativeSourceId: string;
  success: boolean;
  articlesCollected: number;
  error?: string;
  timestamp: string;
}

const FAILURE_LOG_PATH = join(process.cwd(), 'rss-failures.json');
const RECOVERY_LOG_PATH = join(process.cwd(), 'rss-recovery.json');

/**
 * 실패 로그 저장
 */
export function logFailure(
  sourceId: string,
  sourceName: string,
  url: string,
  category: string,
  error: string
): void {
  const failures: FailureLog[] = existsSync(FAILURE_LOG_PATH)
    ? JSON.parse(readFileSync(FAILURE_LOG_PATH, 'utf-8'))
    : [];

  // 기존 로그 찾기
  const existing = failures.find(f => f.sourceId === sourceId);

  if (existing) {
    existing.retryCount++;
    existing.error = error;
    existing.timestamp = new Date().toISOString();
  } else {
    failures.push({
      sourceId,
      sourceName,
      url,
      category,
      error,
      timestamp: new Date().toISOString(),
      retryCount: 1,
    });
  }

  writeFileSync(FAILURE_LOG_PATH, JSON.stringify(failures, null, 2));
}

/**
 * 복구 시도 로그 저장
 */
export function logRecovery(attempt: RecoveryAttempt): void {
  const recoveries: RecoveryAttempt[] = existsSync(RECOVERY_LOG_PATH)
    ? JSON.parse(readFileSync(RECOVERY_LOG_PATH, 'utf-8'))
    : [];

  recoveries.push(attempt);

  writeFileSync(RECOVERY_LOG_PATH, JSON.stringify(recoveries, null, 2));
}

/**
 * RSS 소스에서 기사 수집 (단일 시도)
 */
async function collectFromSource(
  source: AlternativeSource,
  maxArticles: number = 10
): Promise<{ success: boolean; articles: any[]; error?: string }> {
  try {
    if (source.type !== 'rss') {
      return {
        success: false,
        articles: [],
        error: 'Only RSS sources supported in this version',
      };
    }

    const feed = await parser.parseURL(source.url!);

    if (!feed.items || feed.items.length === 0) {
      return {
        success: false,
        articles: [],
        error: 'No articles found',
      };
    }

    const articles = feed.items.slice(0, maxArticles).map(item => ({
      title: item.title || 'Untitled',
      link: item.link || '',
      contentSnippet: item.contentSnippet || item.content || '',
      pubDate: item.pubDate || new Date().toISOString(),
      rawItem: item,
    }));

    return {
      success: true,
      articles,
    };
  } catch (error: any) {
    return {
      success: false,
      articles: [],
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * 자동 복구 시스템 - 대체 소스로 fallback
 */
export async function attemptRecovery(
  originalSourceId: string,
  category: string,
  maxArticles: number = 10,
  maxRetries: number = 3
): Promise<{ success: boolean; articles: any[]; alternativeUsed?: AlternativeSource; error?: string }> {
  console.log(`\n🔄 자동 복구 시작: ${category} 카테고리`);

  // 대체 소스 목록 가져오기 (우선순위순)
  const alternatives = getAlternativesByCategory(category);

  if (alternatives.length === 0) {
    console.log(`   ❌ ${category}에 대한 대체 소스 없음`);
    return {
      success: false,
      articles: [],
      error: 'No alternative sources available',
    };
  }

  console.log(`   💡 ${alternatives.length}개 대체 소스 발견`);

  // 우선순위 순서대로 시도
  for (const alt of alternatives) {
    console.log(`   🔍 시도 중: ${alt.name} (우선순위 ${alt.priority})...`);

    const result = await collectFromSource(alt, maxArticles);

    if (result.success) {
      console.log(`   ✅ 성공! ${result.articles.length}개 기사 수집`);

      // 복구 로그 저장
      logRecovery({
        originalSourceId,
        alternativeSourceId: alt.id,
        success: true,
        articlesCollected: result.articles.length,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        articles: result.articles,
        alternativeUsed: alt,
      };
    } else {
      console.log(`   ❌ 실패: ${result.error}`);

      // 복구 실패 로그
      logRecovery({
        originalSourceId,
        alternativeSourceId: alt.id,
        success: false,
        articlesCollected: 0,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 모든 대체 소스 실패
  console.log(`   ❌ 모든 대체 소스 실패`);

  return {
    success: false,
    articles: [],
    error: 'All alternative sources failed',
  };
}

/**
 * RSS 소스 수집 with 자동 재시도
 */
export async function collectWithRetry(
  source: { id: string; name: string; url: string; category: string },
  maxArticles: number = 10,
  maxRetries: number = 3
): Promise<{ success: boolean; articles: any[]; usedFallback: boolean; error?: string }> {
  // 1차 시도
  const altSource: AlternativeSource = {
    id: source.id,
    name: source.name,
    type: 'rss',
    url: source.url,
    category: source.category,
    priority: 0,
    requiresAuth: false,
    description: '',
  };

  const firstAttempt = await collectFromSource(altSource, maxArticles);

  if (firstAttempt.success) {
    return {
      success: true,
      articles: firstAttempt.articles,
      usedFallback: false,
    };
  }

  // 실패 로그 저장
  logFailure(source.id, source.name, source.url, source.category, firstAttempt.error || 'Unknown');

  // 자동 복구 시도
  console.log(`⚠️  1차 시도 실패 (${source.name}): ${firstAttempt.error}`);

  const recovery = await attemptRecovery(source.id, source.category, maxArticles, maxRetries);

  if (recovery.success) {
    return {
      success: true,
      articles: recovery.articles,
      usedFallback: true,
    };
  }

  return {
    success: false,
    articles: [],
    usedFallback: false,
    error: recovery.error,
  };
}

/**
 * 실패 통계 조회
 */
export function getFailureStats(): {
  totalFailures: number;
  byCategory: Record<string, number>;
  mostFailed: FailureLog[];
} {
  if (!existsSync(FAILURE_LOG_PATH)) {
    return { totalFailures: 0, byCategory: {}, mostFailed: [] };
  }

  const failures: FailureLog[] = JSON.parse(readFileSync(FAILURE_LOG_PATH, 'utf-8'));

  const byCategory = failures.reduce((acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFailed = failures.sort((a, b) => b.retryCount - a.retryCount).slice(0, 10);

  return {
    totalFailures: failures.length,
    byCategory,
    mostFailed,
  };
}

/**
 * 복구 성공률 조회
 */
export function getRecoveryStats(): {
  totalAttempts: number;
  successfulRecoveries: number;
  successRate: number;
} {
  if (!existsSync(RECOVERY_LOG_PATH)) {
    return { totalAttempts: 0, successfulRecoveries: 0, successRate: 0 };
  }

  const recoveries: RecoveryAttempt[] = JSON.parse(readFileSync(RECOVERY_LOG_PATH, 'utf-8'));

  const successful = recoveries.filter(r => r.success).length;

  return {
    totalAttempts: recoveries.length,
    successfulRecoveries: successful,
    successRate: recoveries.length > 0 ? Math.round((successful / recoveries.length) * 100) : 0,
  };
}
