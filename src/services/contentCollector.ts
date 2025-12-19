// 콘텐츠 수집 및 AI 리라이팅 서비스
// RSS, API, 웹 스크래핑을 통해 콘텐츠를 수집하고 AI 에디터가 리라이팅합니다.

import { supabase } from '@/lib/supabase';
import { getEditorByCategory } from '@/data/editors';
import { rewriteContent, generateImage, generateChallengeQuestion } from '@/lib/openai';
import type { ContentSourceConfig } from '@/data/content-sources';
import type { RawContentCache } from '@/types/ai-editor';

interface CollectedContent {
  title: string;
  content: string;
  url: string;
  publishedDate: Date;
  author?: string;
}

/**
 * RSS 피드에서 콘텐츠 수집
 */
async function fetchFromRSS(sourceUrl: string): Promise<CollectedContent[]> {
  try {
    // RSS 파서 라이브러리 사용 (예: rss-parser)
    // 실제 구현시 rss-parser 설치 필요: npm install rss-parser
    const Parser = await import('rss-parser');
    const parser = new Parser.default();

    const feed = await parser.parseURL(sourceUrl);

    return feed.items.slice(0, 10).map((item) => ({
      title: item.title || '',
      content: item.contentSnippet || item.content || '',
      url: item.link || '',
      publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      author: item.creator || item.author,
    }));
  } catch (error) {
    console.error('Error fetching RSS:', error);
    return [];
  }
}

/**
 * 웹 페이지에서 콘텐츠 스크래핑 (간단한 예시)
 */
async function fetchFromWeb(sourceUrl: string): Promise<CollectedContent[]> {
  try {
    // 실제 구현시 웹 스크래핑 라이브러리 필요 (예: cheerio, puppeteer)
    // 또는 서버사이드에서 처리

    // 여기서는 플레이스홀더 데이터 반환
    console.log(`Web scraping from ${sourceUrl} - 실제 구현 필요`);
    return [];
  } catch (error) {
    console.error('Error fetching from web:', error);
    return [];
  }
}

/**
 * 특정 소스에서 콘텐츠 수집
 */
export async function collectFromSource(
  source: ContentSourceConfig
): Promise<CollectedContent[]> {
  console.log(`Collecting from ${source.name} (${source.type})...`);

  let contents: CollectedContent[] = [];

  switch (source.type) {
    case 'rss':
      contents = await fetchFromRSS(source.url);
      break;
    case 'web':
      contents = await fetchFromWeb(source.url);
      break;
    case 'api':
      // API 수집 로직 (소스별로 다름)
      break;
  }

  return contents;
}

/**
 * 수집한 원본 콘텐츠를 DB에 캐싱
 */
async function cacheRawContent(
  sourceId: string,
  content: CollectedContent,
  category: string
): Promise<string> {
  try {
    // 중복 체크
    const { data: existing } = await supabase
      .from('raw_content_cache')
      .select('id')
      .eq('original_url', content.url)
      .single();

    if (existing) {
      console.log(`Content already cached: ${content.url}`);
      return existing.id;
    }

    // 새 콘텐츠 저장
    const { data, error } = await supabase
      .from('raw_content_cache')
      .insert({
        source_id: sourceId,
        original_url: content.url,
        title: content.title,
        content: content.content,
        published_date: content.publishedDate.toISOString(),
        author: content.author,
        category,
        is_processed: false,
      })
      .select()
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Error caching raw content:', error);
    throw error;
  }
}

/**
 * 원본 콘텐츠를 AI 에디터 스타일로 리라이팅하여 발행
 */
export async function processAndPublishContent(
  rawContent: RawContentCache
): Promise<string | null> {
  try {
    const editor = getEditorByCategory(rawContent.category);

    if (!editor) {
      console.error(`No editor found for category: ${rawContent.category}`);
      return null;
    }

    console.log(`Processing content with ${editor.name} (${editor.category})...`);

    // 1. AI 리라이팅
    const rewritten = await rewriteContent({
      originalContent: rawContent.content,
      editorPromptTemplate: editor.promptTemplate,
      title: rawContent.title,
    });

    // 2. AI 이미지 생성
    let aiImageUrl: string | null = null;
    try {
      aiImageUrl = await generateImage({
        title: rewritten.title,
        content: rewritten.content,
        category: editor.category,
      });
    } catch (error) {
      console.error('Error generating image:', error);
      // 이미지 생성 실패해도 계속 진행
    }

    // 3. 챌린지 질문 생성
    const challengeQuestion = await generateChallengeQuestion(
      rewritten.title,
      rewritten.content
    );

    // 4. 아티클 발행
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title: rewritten.title,
        slug: generateSlug(rewritten.title),
        excerpt: rewritten.excerpt,
        content: rewritten.content,
        author_name: editor.name,
        ai_editor_id: editor.id,
        source_urls: [rawContent.original_url],
        ai_generated_image: aiImageUrl,
        challenge_question: challengeQuestion,
        is_ai_generated: true,
        status: 'published',
        published_at: new Date().toISOString(),
        category_id: getCategoryId(editor.category), // 카테고리 ID 매핑 필요
      })
      .select()
      .single();

    if (error) throw error;

    // 5. 원본 콘텐츠를 처리 완료로 표시
    await supabase
      .from('raw_content_cache')
      .update({
        is_processed: true,
        ai_rewritten_article_id: article.id,
      })
      .eq('id', rawContent.id);

    console.log(`✅ Published: ${rewritten.title} by ${editor.name}`);
    return article.id;
  } catch (error) {
    console.error('Error processing content:', error);
    return null;
  }
}

/**
 * 전체 자동화 프로세스: 수집 → 처리 → 발행
 */
export async function runDailyContentPipeline(
  sources: ContentSourceConfig[]
): Promise<void> {
  console.log('🚀 Starting daily content pipeline...');

  for (const source of sources) {
    try {
      // 1. 콘텐츠 수집
      const contents = await collectFromSource(source);
      console.log(`Collected ${contents.length} items from ${source.name}`);

      // 2. 원본 캐싱
      const cachedIds: string[] = [];
      for (const content of contents) {
        const id = await cacheRawContent(source.id, content, source.category);
        cachedIds.push(id);
      }

      // 3. 미처리 콘텐츠 가져오기
      const { data: unprocessed, error } = await supabase
        .from('raw_content_cache')
        .select('*')
        .eq('is_processed', false)
        .eq('category', source.category)
        .limit(5); // 카테고리당 하루 5개까지

      if (error) throw error;

      // 4. AI 처리 및 발행
      for (const raw of unprocessed || []) {
        await processAndPublishContent(raw);
        // API 레이트 리밋 고려하여 딜레이
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error processing source ${source.name}:`, error);
      continue;
    }
  }

  console.log('✅ Daily content pipeline completed!');
}

// 유틸리티 함수들
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getCategoryId(categoryName: string): string {
  // 실제로는 DB에서 카테고리 ID를 조회해야 함
  // 여기서는 플레이스홀더
  return categoryName;
}
