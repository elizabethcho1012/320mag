#!/usr/bin/env tsx
// RSS 소스 자동 검색 및 검증 시스템
// 작동하지 않는 RSS 피드를 자동으로 감지하고 새로운 소스를 찾습니다.

import dotenv from 'dotenv';
dotenv.config();

import Parser from 'rss-parser';
import Anthropic from '@anthropic-ai/sdk';

const parser = new Parser();

interface RSSSourceCandidate {
  url: string;
  name: string;
  category: string;
  score: number; // 0-100
  reason: string;
}

/**
 * Claude AI를 사용하여 특정 카테고리에 적합한 RSS 피드 URL 찾기
 */
async function findRSSSourcesWithAI(category: string, anthropicKey: string): Promise<string[]> {
  const client = new Anthropic({ apiKey: anthropicKey });

  const categoryDescriptions: Record<string, string> = {
    '뷰티': 'beauty, skincare, makeup, anti-aging, cosmetics focused on 40-50s women',
    '운동': 'fitness, exercise, yoga, strength training, wellness for 40-50s adults',
    '패션': 'fashion, style, designer brands for mature women',
    '여행': 'travel, hotels, tourism, destinations',
    '푸드': 'food, restaurants, nutrition, healthy eating',
    '심리': 'psychology, mental health, mindfulness, relationships',
    '하우징': 'interior design, architecture, home decor',
    '섹슈얼리티': 'sexuality, intimacy, relationships, sexual health for mature adults',
  };

  const prompt = `I need RSS feed URLs for ${category} (${categoryDescriptions[category]}) content.

Requirements:
- Target audience: 40-50 year old adults (AGene generation)
- High-quality, reputable sources
- English language publications
- Active RSS feeds (not dead links)
- Focus on mature, sophisticated content

Please suggest 5-7 RSS feed URLs. Format your response as a JSON array of URLs only.
Example format: ["https://example.com/rss", "https://another.com/feed"]

IMPORTANT: Only return valid RSS feed URLs that are likely to work. Check that they are from reputable sources.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // JSON 배열 추출
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const urls = JSON.parse(jsonMatch[0]);
      return urls.filter((url: string) => url.startsWith('http'));
    }

    return [];
  } catch (error) {
    console.error('❌ AI RSS 검색 실패:', error);
    return [];
  }
}

/**
 * RSS 피드 검증 (실제로 작동하는지 확인)
 */
async function validateRSSFeed(url: string): Promise<{ valid: boolean; itemCount: number; error?: string }> {
  try {
    const feed = await parser.parseURL(url);
    return {
      valid: true,
      itemCount: feed.items.length,
    };
  } catch (error: any) {
    return {
      valid: false,
      itemCount: 0,
      error: error.message,
    };
  }
}

/**
 * RSS 소스 품질 평가
 */
async function evaluateRSSQuality(
  url: string,
  category: string,
  anthropicKey: string
): Promise<{ score: number; reason: string }> {
  try {
    const feed = await parser.parseURL(url);
    const sampleItems = feed.items.slice(0, 5).map(item => ({
      title: item.title,
      contentSnippet: item.contentSnippet?.substring(0, 200),
    }));

    const client = new Anthropic({ apiKey: anthropicKey });

    const categoryDescriptions: Record<string, string> = {
      '뷰티': '뷰티, 스킨케어, 메이크업, 안티에이징 - 40~50대 여성 대상',
      '운동': '피트니스, 운동, 요가, 근력 운동, 웰니스 - 40~50대 성인 대상',
      '패션': '패션, 스타일, 디자이너 브랜드 - 성숙한 여성 대상',
      '여행': '여행, 호텔, 관광, 여행지',
      '푸드': '음식, 레스토랑, 영양, 건강 식단',
      '심리': '심리학, 정신 건강, 마음챙김, 관계',
      '하우징': '인테리어, 건축, 주거 공간',
      '섹슈얼리티': '섹슈얼리티, 친밀감, 관계, 성 건강 - 성인 대상',
    };

    const prompt = `Evaluate this RSS feed for "${category}" category (${categoryDescriptions[category]}).

Feed: ${feed.title}
Sample articles:
${JSON.stringify(sampleItems, null, 2)}

Rate from 0-100 based on:
1. Relevance to category (40 points)
2. Quality and depth of content (30 points)
3. Suitability for 40-50 year old audience (20 points)
4. Update frequency and freshness (10 points)

Respond with JSON only:
{
  "score": 85,
  "reason": "High-quality content relevant to mature audience..."
}`;

    const response = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const jsonMatch = text.match(/\{[\s\S]*?\}/);

    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.score || 0,
        reason: result.reason || 'No reason provided',
      };
    }

    return { score: 50, reason: 'Could not evaluate' };
  } catch (error) {
    console.error(`❌ 평가 실패 (${url}):`, error);
    return { score: 0, reason: 'Evaluation failed' };
  }
}

/**
 * 카테고리별 최적 RSS 소스 자동 검색
 */
async function autoFindBestSources(category: string, count: number = 3): Promise<RSSSourceCandidate[]> {
  const anthropicKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!anthropicKey) {
    console.error('❌ Anthropic API 키가 없습니다.');
    return [];
  }

  console.log(`\n🔍 [${category}] AI로 RSS 소스 검색 중...`);

  // 1단계: AI로 후보 URL 검색
  const candidateUrls = await findRSSSourcesWithAI(category, anthropicKey);
  console.log(`   📋 후보 ${candidateUrls.length}개 발견`);

  const validCandidates: RSSSourceCandidate[] = [];

  // 2단계: 각 URL 검증 및 평가
  for (const url of candidateUrls) {
    console.log(`   🧪 검증 중: ${url}`);

    const validation = await validateRSSFeed(url);

    if (!validation.valid) {
      console.log(`      ❌ 작동 안함: ${validation.error}`);
      continue;
    }

    console.log(`      ✅ 작동함 (기사 ${validation.itemCount}개)`);

    // 품질 평가
    console.log(`      📊 품질 평가 중...`);
    const quality = await evaluateRSSQuality(url, category, anthropicKey);
    console.log(`      🎯 점수: ${quality.score}/100`);

    if (quality.score >= 60) {
      const feed = await parser.parseURL(url);
      validCandidates.push({
        url,
        name: feed.title || 'Unknown',
        category,
        score: quality.score,
        reason: quality.reason,
      });
    }

    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // 점수순 정렬
  validCandidates.sort((a, b) => b.score - a.score);

  return validCandidates.slice(0, count);
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 RSS 소스 자동 검색 시스템 시작\n');

  const categories = ['뷰티', '운동'];

  for (const category of categories) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📂 [${category}] 새로운 RSS 소스 찾기`);
    console.log(`${'='.repeat(60)}`);

    const bestSources = await autoFindBestSources(category, 3);

    if (bestSources.length > 0) {
      console.log(`\n✅ [${category}] 추천 소스 ${bestSources.length}개:`);
      bestSources.forEach((source, idx) => {
        console.log(`\n${idx + 1}. ${source.name}`);
        console.log(`   URL: ${source.url}`);
        console.log(`   점수: ${source.score}/100`);
        console.log(`   평가: ${source.reason}`);
      });

      // TypeScript 코드 생성
      console.log(`\n📝 content-sources.ts에 추가할 코드:`);
      bestSources.forEach((source, idx) => {
        const id = `${category.toLowerCase()}-${source.name.toLowerCase().replace(/\s+/g, '-')}`;
        console.log(`  {
    id: '${id}',
    name: '${source.name}',
    url: '${source.url}',
    type: 'rss',
    category: '${category}',
    description: 'AI 추천 소스 (점수: ${source.score}/100)',
    fetchFrequency: 'daily',
    isActive: true,
  },`);
      });
    } else {
      console.log(`\n⚠️  [${category}] 적합한 소스를 찾지 못했습니다.`);
    }

    // 카테고리 간 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  console.log('\n\n🎉 검색 완료!');
}

main();
