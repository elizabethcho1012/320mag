#!/usr/bin/env tsx
/**
 * RSS 자동 복구 시스템
 *
 * 1단계: RSS 건강 체크 → 죽은 소스 비활성화
 * 2단계: AI로 새 RSS 소스 검색 → 검증 및 추가
 * 3단계: 웹 스크래핑 백업 준비
 *
 * 관리자 개입 없이 완전 자동으로 실행
 */

import dotenv from 'dotenv';
dotenv.config();

import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';
import { contentSources, type ContentSourceConfig } from '../src/data/content-sources';
import * as fs from 'fs';
import * as path from 'path';

const parser = new Parser();

interface RSSHealthStatus {
  id: string;
  url: string;
  name: string;
  category: string;
  isHealthy: boolean;
  statusCode?: number;
  error?: string;
  itemCount?: number;
}

/**
 * 1단계: RSS 건강 체크
 */
async function step1_CheckRSSHealth(): Promise<{
  healthy: RSSHealthStatus[];
  unhealthy: RSSHealthStatus[];
}> {
  console.log('🔍 1단계: RSS 건강 체크 시작\n');

  const activeSources = contentSources.filter(s => s.isActive && s.type === 'rss');
  console.log(`   📋 활성 소스: ${activeSources.length}개\n`);

  const results: RSSHealthStatus[] = [];

  for (const source of activeSources) {
    console.log(`   검사: ${source.name} (${source.category})`);

    const status: RSSHealthStatus = {
      id: source.id,
      url: source.url,
      name: source.name,
      category: source.category,
      isHealthy: false,
    };

    try {
      const feed = await parser.parseURL(source.url);
      status.isHealthy = true;
      status.itemCount = feed.items.length;
      status.statusCode = 200;
      console.log(`      ✅ 정상 (기사 ${status.itemCount}개)`);
    } catch (error: any) {
      status.isHealthy = false;
      status.error = error.message;

      const statusMatch = error.message.match(/Status code (\d+)/);
      if (statusMatch) {
        status.statusCode = parseInt(statusMatch[1]);
      }
      console.log(`      ❌ 실패 - ${status.error}`);
    }

    results.push(status);

    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  const healthy = results.filter(r => r.isHealthy);
  const unhealthy = results.filter(r => !r.isHealthy);

  console.log(`\n📊 1단계 결과:`);
  console.log(`   ✅ 정상: ${healthy.length}개`);
  console.log(`   ❌ 비정상: ${unhealthy.length}개`);
  console.log(`   📈 성공률: ${((healthy.length / results.length) * 100).toFixed(1)}%\n`);

  return { healthy, unhealthy };
}

/**
 * 죽은 RSS 소스 자동 비활성화
 */
async function autoDisableUnhealthySources(unhealthy: RSSHealthStatus[]): Promise<number> {
  if (unhealthy.length === 0) {
    console.log('   ✅ 비활성화할 소스 없음\n');
    return 0;
  }

  console.log(`\n🔧 죽은 RSS 소스 자동 비활성화 (${unhealthy.length}개)\n`);

  const contentSourcesPath = path.join(process.cwd(), 'src/data/content-sources.ts');
  let fileContent = fs.readFileSync(contentSourcesPath, 'utf-8');

  let updatedCount = 0;

  for (const source of unhealthy) {
    const today = new Date().toISOString().split('T')[0];
    const comment = `// ${today}: ${source.statusCode || 'ERROR'} 에러로 자동 비활성화`;

    // URL 정규식 이스케이프
    const escapedUrl = source.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // id로 찾기 (더 정확함)
    const idPattern = new RegExp(
      `id: '${source.id}',[\\s\\S]*?isActive: true`,
      'g'
    );

    if (idPattern.test(fileContent)) {
      fileContent = fileContent.replace(
        new RegExp(`(id: '${source.id}',[\\s\\S]*?isActive: )true`, 'g'),
        `$1false, ${comment}`
      );
      console.log(`   ✅ ${source.name} 비활성화`);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(contentSourcesPath, fileContent, 'utf-8');
    console.log(`\n💾 ${updatedCount}개 소스 비활성화 저장 완료\n`);
  }

  return updatedCount;
}

/**
 * 2단계: AI로 새로운 RSS 소스 찾기 및 검증
 */
async function step2_FindNewSources(
  categoriesNeedingSources: string[],
  anthropicApiKey: string
): Promise<ContentSourceConfig[]> {
  console.log(`\n🔍 2단계: AI로 새 RSS 소스 검색\n`);

  const allNewSources: ContentSourceConfig[] = [];

  for (const category of categoriesNeedingSources) {
    console.log(`\n📂 [${category}] 새 소스 검색 중...\n`);

    const newSources = await findNewRSSSources(category, 2, anthropicApiKey);

    if (newSources.length > 0) {
      allNewSources.push(...newSources);
      console.log(`   ✅ ${newSources.length}개 소스 발견`);
    } else {
      console.log(`   ⚠️  소스를 찾지 못함`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log(`\n📊 2단계 결과: 총 ${allNewSources.length}개 새 소스 발견\n`);

  return allNewSources;
}

/**
 * AI를 사용하여 RSS 소스 찾기
 */
async function findNewRSSSources(
  category: string,
  count: number,
  anthropicApiKey: string
): Promise<ContentSourceConfig[]> {
  const client = new Anthropic({ apiKey: anthropicApiKey });

  const categoryDescriptions: Record<string, string> = {
    '뷰티': 'beauty, skincare, makeup, anti-aging for women aged 40-50',
    '운동': 'fitness, exercise, yoga, strength training for adults aged 40-50',
    '패션': 'fashion, style, designer brands for mature women',
    '여행': 'travel, hotels, tourism, destinations',
    '푸드': 'food, restaurants, nutrition, healthy eating',
    '심리': 'psychology, mental health, mindfulness, relationships',
    '하우징': 'interior design, architecture, home decor',
    '섹슈얼리티': 'sexuality, intimacy, relationships, sexual health for mature adults',
  };

  const prompt = `Find ${count} high-quality RSS feed URLs for "${category}" (${categoryDescriptions[category]}) content.

Requirements:
- Target: 40-50 year old adults (AGene generation)
- Reputable, well-known publications only
- Active RSS feeds (tested and working)
- English language
- Major media outlets, not blogs

Return ONLY valid RSS feed URLs in this exact JSON format:
[
  {
    "name": "Publication Name",
    "url": "https://example.com/feed.xml",
    "description": "Brief description"
  }
]

IMPORTANT: Return ONLY working RSS feeds from major publications like Vogue, Elle, Harper's Bazaar, Health.com, WebMD, Prevention, etc.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // JSON 추출
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.log(`   ⚠️  JSON 형식을 찾을 수 없음`);
      return [];
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    const validSources: ContentSourceConfig[] = [];

    // 검증
    for (const suggestion of suggestions) {
      console.log(`   🧪 검증: ${suggestion.name}`);

      try {
        const feed = await parser.parseURL(suggestion.url);

        const source: ContentSourceConfig = {
          id: `${category.toLowerCase()}-${suggestion.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: suggestion.name,
          url: suggestion.url,
          type: 'rss',
          category,
          description: suggestion.description || 'AI 추천 소스',
          fetchFrequency: 'daily',
          isActive: true,
        };

        validSources.push(source);
        console.log(`      ✅ 작동 확인 (기사 ${feed.items.length}개)`);

      } catch (error: any) {
        console.log(`      ❌ 작동 안함: ${error.message}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return validSources;

  } catch (error) {
    console.error(`   ❌ AI 검색 실패:`, error);
    return [];
  }
}

/**
 * 새 소스를 content-sources.ts에 자동 추가
 */
async function autoAddNewSources(newSources: ContentSourceConfig[]): Promise<number> {
  if (newSources.length === 0) {
    console.log('   ✅ 추가할 소스 없음\n');
    return 0;
  }

  console.log(`\n➕ 새 소스 자동 추가 (${newSources.length}개)\n`);

  const contentSourcesPath = path.join(process.cwd(), 'src/data/content-sources.ts');
  let fileContent = fs.readFileSync(contentSourcesPath, 'utf-8');

  let addedCount = 0;

  for (const source of newSources) {
    // 중복 체크
    if (fileContent.includes(source.url)) {
      console.log(`   ⚠️  이미 존재: ${source.name}`);
      continue;
    }

    // 카테고리 섹션 찾기
    const categoryPattern = `category: '${source.category}'`;
    const lastIndex = fileContent.lastIndexOf(categoryPattern);

    if (lastIndex === -1) {
      console.log(`   ⚠️  카테고리 섹션 없음: ${source.category}`);
      continue;
    }

    // 해당 카테고리의 마지막 항목 뒤에 추가
    const nextBracket = fileContent.indexOf('},', lastIndex);
    const insertPosition = nextBracket + 2;

    const sourceCode = `\n  {
    id: '${source.id}',
    name: '${source.name}',
    url: '${source.url}',
    type: 'rss',
    category: '${source.category}',
    description: '${source.description}',
    fetchFrequency: 'daily',
    isActive: true,
  },`;

    fileContent = fileContent.slice(0, insertPosition) + sourceCode + fileContent.slice(insertPosition);

    console.log(`   ✅ ${source.name} 추가`);
    addedCount++;
  }

  if (addedCount > 0) {
    fs.writeFileSync(contentSourcesPath, fileContent, 'utf-8');
    console.log(`\n💾 ${addedCount}개 소스 추가 저장 완료\n`);
  }

  return addedCount;
}

/**
 * 카테고리별 활성 소스 개수 확인
 */
function getCategorySourceCounts(): Record<string, number> {
  const categories = ['패션', '뷰티', '여행', '푸드', '하우징', '심리', '섹슈얼리티', '운동'];
  const counts: Record<string, number> = {};

  for (const category of categories) {
    const active = contentSources.filter(s => s.category === category && s.isActive && s.type === 'rss');
    counts[category] = active.length;
  }

  return counts;
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 RSS 자동 복구 시스템 시작\n');
  console.log('='.repeat(60));
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);
  console.log('='.repeat(60));
  console.log('\n');

  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    console.error('❌ Anthropic API 키가 설정되지 않았습니다.');
    process.exit(1);
  }

  // 1단계: RSS 건강 체크
  const { healthy, unhealthy } = await step1_CheckRSSHealth();

  // 1-A: 죽은 소스 자동 비활성화
  if (unhealthy.length > 0) {
    await autoDisableUnhealthySources(unhealthy);
  }

  // 카테고리별 소스 개수 확인
  const sourceCounts = getCategorySourceCounts();
  console.log('📊 카테고리별 활성 RSS 소스:\n');
  for (const [category, count] of Object.entries(sourceCounts)) {
    const icon = count >= 3 ? '✅' : count >= 1 ? '⚠️' : '❌';
    console.log(`   ${icon} ${category}: ${count}개`);
  }
  console.log('');

  // 소스가 부족한 카테고리 찾기
  const categoriesNeedingSources = Object.entries(sourceCounts)
    .filter(([_, count]) => count < 3)
    .map(([category]) => category);

  if (categoriesNeedingSources.length > 0) {
    console.log(`\n⚠️  소스 부족 카테고리: ${categoriesNeedingSources.join(', ')}\n`);

    // 2단계: 새 소스 찾기
    const newSources = await step2_FindNewSources(categoriesNeedingSources, anthropicKey);

    // 2-A: 새 소스 자동 추가
    if (newSources.length > 0) {
      await autoAddNewSources(newSources);
    }
  } else {
    console.log('\n✅ 모든 카테고리에 충분한 소스가 있습니다.\n');
  }

  // 최종 결과
  const finalCounts = getCategorySourceCounts();
  console.log('\n' + '='.repeat(60));
  console.log('🎉 RSS 자동 복구 완료');
  console.log('='.repeat(60));
  console.log('\n📊 최종 상태:\n');
  for (const [category, count] of Object.entries(finalCounts)) {
    const before = sourceCounts[category];
    const change = count - before;
    const changeStr = change > 0 ? `(+${change})` : change < 0 ? `(${change})` : '';
    console.log(`   ${category}: ${count}개 ${changeStr}`);
  }
  console.log('');

  process.exit(0);
}

main();
