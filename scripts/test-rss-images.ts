// RSS 이미지 추출 테스트 스크립트
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['enclosure', 'enclosure'],
    ],
  },
});

// imageService.ts의 extractImageFromRSS 함수 복사
function extractImageFromRSS(item: any): string | null {
  // 1. media:content 확인 (다양한 형식 지원)
  if (item.mediaContent) {
    const media = item.mediaContent;
    if (typeof media === 'string') return media;
    if (media.$ && media.$.url) return media.$.url;
    if (media.url) return media.url;
    if (Array.isArray(media) && media[0]) {
      if (media[0].$.url) return media[0].$.url;
      if (media[0].url) return media[0].url;
    }
  }

  // 2. media:thumbnail 확인
  if (item.mediaThumbnail) {
    const thumb = item.mediaThumbnail;
    if (typeof thumb === 'string') return thumb;
    if (thumb.$ && thumb.$.url) return thumb.$.url;
    if (thumb.url) return thumb.url;
  }

  // 3. enclosure 확인 (팟캐스트/미디어 피드)
  if (item.enclosure) {
    const enclosure = item.enclosure;
    let url = '';

    if (typeof enclosure === 'string') {
      url = enclosure;
    } else if (enclosure.url) {
      url = enclosure.url;
    } else if (enclosure.$ && enclosure.$.url) {
      url = enclosure.$.url;
    }

    // 이미지 타입 또는 이미지 확장자 확인
    if (url) {
      const type = enclosure.type || enclosure.$?.type || '';
      if (type.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return url;
      }
    }
  }

  // 4. content:encoded에서 첫 번째 이미지 추출
  const contentEncoded = item.contentEncoded || item['content:encoded'] || item.content_encoded;
  if (contentEncoded) {
    const imgMatch = contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return decodeHTMLEntities(imgMatch[1]);
    }
  }

  // 5. content에서 이미지 추출 (Atom 피드)
  if (item.content) {
    let contentStr = '';
    if (typeof item.content === 'string') {
      contentStr = item.content;
    } else if (item.content._) {
      contentStr = item.content._;
    } else if (item.content['#']) {
      contentStr = item.content['#'];
    }

    if (contentStr) {
      const imgMatch = contentStr.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch && imgMatch[1]) {
        return decodeHTMLEntities(imgMatch[1]);
      }
    }
  }

  // 6. summary에서 이미지 추출 (Atom 피드)
  if (item.summary) {
    let summaryStr = typeof item.summary === 'string' ? item.summary : item.summary._ || '';
    const imgMatch = summaryStr.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return decodeHTMLEntities(imgMatch[1]);
    }
  }

  // 7. description에서 이미지 추출
  if (item.description) {
    const imgMatch = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      return decodeHTMLEntities(imgMatch[1]);
    }
  }

  // 8. itunes:image (팟캐스트)
  if (item['itunes:image']) {
    const itunesImg = item['itunes:image'];
    if (typeof itunesImg === 'string') return itunesImg;
    if (itunesImg.href) return itunesImg.href;
    if (itunesImg.$ && itunesImg.$.href) return itunesImg.$.href;
  }

  // 9. image 필드 직접 확인
  if (item.image) {
    if (typeof item.image === 'string') return item.image;
    if (item.image.url) return item.image.url;
  }

  return null;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#038;/g, '&');
}

// 테스트할 RSS 피드들
const testFeeds = [
  { name: 'Dezeen (하우징)', url: 'https://www.dezeen.com/feed/' },
  { name: 'Guardian Culture (컬처)', url: 'https://www.theguardian.com/culture/rss' },
  { name: 'Eater (푸드)', url: 'https://www.eater.com/rss/index.xml' },
  { name: 'ArchDaily (하우징)', url: 'https://www.archdaily.com/feed/' },
];

async function testFeed(name: string, url: string) {
  console.log(`\n📰 ${name}`);
  console.log(`   URL: ${url}`);
  console.log('-'.repeat(60));

  try {
    const feed = await parser.parseURL(url);
    const items = feed.items.slice(0, 3); // 처음 3개만 테스트

    let successCount = 0;
    for (const item of items) {
      const imageUrl = extractImageFromRSS(item);
      const title = item.title?.substring(0, 50) || 'No title';

      if (imageUrl) {
        console.log(`   ✅ "${title}..."`);
        console.log(`      📷 ${imageUrl.substring(0, 80)}...`);
        successCount++;
      } else {
        console.log(`   ❌ "${title}..." - 이미지 없음`);
        // 디버깅: 어떤 필드가 있는지 확인
        console.log(`      Available fields: ${Object.keys(item).filter(k => item[k]).join(', ')}`);
      }
    }

    console.log(`   📊 결과: ${successCount}/${items.length} 성공`);
    return successCount;
  } catch (error: any) {
    console.log(`   ⚠️ 피드 로드 실패: ${error.message}`);
    return 0;
  }
}

async function main() {
  console.log('🔍 RSS 이미지 추출 테스트');
  console.log('='.repeat(60));

  let totalSuccess = 0;
  let totalTests = 0;

  for (const feed of testFeeds) {
    const success = await testFeed(feed.name, feed.url);
    totalSuccess += success;
    totalTests += 3; // 각 피드에서 3개씩 테스트
  }

  console.log('\n' + '='.repeat(60));
  console.log(`📊 전체 결과: ${totalSuccess}/${totalTests} 성공 (${Math.round(totalSuccess/totalTests*100)}%)`);
}

main().catch(console.error);
