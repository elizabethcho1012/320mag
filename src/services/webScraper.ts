// 웹 스크래핑 백업 시스템
// RSS 실패 시 직접 웹사이트에서 콘텐츠 수집

export interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  images?: string[];
  publishedDate?: Date;
}

/**
 * 웹사이트에서 기사 목록 스크래핑
 * RSS가 실패했을 때 사용하는 백업 방법
 */
export async function scrapeWebsite(url: string, category: string): Promise<ScrapedArticle[]> {
  console.log(`\n🕷️  웹 스크래핑 백업 시작: ${url}`);

  try {
    // 여기서는 간단한 fetch를 사용
    // 실제 구현에서는 cheerio나 jsdom 같은 라이브러리 필요
    const response = await fetch(url);
    const html = await response.text();

    // HTML 파싱 (기본적인 패턴 매칭)
    const articles: ScrapedArticle[] = [];

    // 간단한 article 태그 추출 (실제로는 더 정교한 파싱 필요)
    const articlePattern = /<article[\s\S]*?<\/article>/gi;
    const matches = html.match(articlePattern) || [];

    for (const match of matches.slice(0, 10)) {  // 최대 10개
      const titleMatch = match.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/i);
      const linkMatch = match.match(/href="([^"]+)"/i);
      const imgMatch = match.match(/src="([^"]+\.(?:jpg|jpeg|png|webp))"/i);

      if (titleMatch && linkMatch) {
        articles.push({
          title: titleMatch[1].replace(/<[^>]*>/g, '').trim(),
          url: linkMatch[1].startsWith('http') ? linkMatch[1] : new URL(linkMatch[1], url).href,
          content: '', // 개별 기사 페이지를 다시 스크래핑해야 함
          images: imgMatch ? [imgMatch[1]] : [],
        });
      }
    }

    console.log(`   ✅ ${articles.length}개 기사 스크래핑 성공`);
    return articles;

  } catch (error: any) {
    console.error(`   ❌ 웹 스크래핑 실패: ${error.message}`);
    return [];
  }
}

/**
 * RSS 대체 URL 매핑
 * RSS가 죽었을 때 스크래핑할 웹사이트 URL
 */
export const FALLBACK_URLS: Record<string, string[]> = {
  '뷰티': [
    'https://www.allure.com/beauty',
    'https://www.marieclaire.com/beauty/',
    'https://www.vogue.com/beauty',
  ],
  '운동': [
    'https://www.self.com/fitness',
    'https://www.womenshealthmag.com/fitness/',
    'https://www.yogajournal.com/poses/',
  ],
  '패션': [
    'https://www.whowhatwear.com/fashion',
    'https://www.vogue.com/fashion',
  ],
  '여행': [
    'https://www.lonelyplanet.com/articles',
    'https://www.atlasobscura.com/articles',
  ],
  '푸드': [
    'https://www.bonappetit.com/recipes',
    'https://www.seriouseats.com/',
  ],
  '심리': [
    'https://www.mindful.org/articles/',
    'https://tinybuddha.com/blog/',
  ],
  '하우징': [
    'https://www.dezeen.com/architecture/',
    'https://www.apartmenttherapy.com/',
  ],
  '섹슈얼리티': [
    'https://www.psychologytoday.com/us/blog',
    'https://www.gottman.com/blog/',
  ],
};

/**
 * 카테고리의 백업 URL에서 스크래핑
 */
export async function scrapeCategory(category: string): Promise<ScrapedArticle[]> {
  const urls = FALLBACK_URLS[category] || [];

  if (urls.length === 0) {
    console.log(`   ⚠️  ${category} 카테고리의 백업 URL 없음`);
    return [];
  }

  const allArticles: ScrapedArticle[] = [];

  for (const url of urls) {
    const articles = await scrapeWebsite(url, category);
    allArticles.push(...articles);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (allArticles.length >= 5) break;  // 충분한 기사 수집됨
  }

  return allArticles;
}
