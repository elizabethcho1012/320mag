// 이미지 수집 서비스
// RSS에서 이미지 추출 + Unsplash 무료 이미지 폴백

// 카테고리별 Unsplash 검색 키워드
const categoryKeywords: Record<string, string[]> = {
  '패션': ['fashion', 'style', 'clothing', 'elegant woman', 'fashion portrait'],
  '뷰티': ['beauty', 'skincare', 'cosmetics', 'wellness', 'spa'],
  '컬처': ['culture', 'art', 'museum', 'theater', 'books'],
  '여행': ['travel', 'destination', 'landscape', 'vacation', 'adventure'],
  '시니어시장': ['senior lifestyle', 'retirement', 'active aging', 'mature adults'],
  '글로벌트렌드': ['global', 'business', 'technology', 'world', 'innovation'],
  '푸드': ['food', 'gourmet', 'cuisine', 'restaurant', 'cooking'],
  '하우징': ['interior design', 'home decor', 'architecture', 'living room', 'modern house'],
  '심리': ['mindfulness', 'meditation', 'wellness', 'mental health', 'peaceful'],
  '운동': ['fitness', 'exercise', 'workout', 'healthy lifestyle', 'yoga'],
};

/**
 * RSS/HTML 콘텐츠에서 모든 이미지 URL 추출 (중복 제거)
 * 원본 기사의 모든 이미지를 수집
 */
export function extractAllImagesFromRSS(item: any): string[] {
  const images: string[] = [];
  const seenUrls = new Set<string>();

  // 헬퍼 함수: 중복 제거하며 이미지 추가
  const addImage = (url: string | null) => {
    if (url && isValidImageUrl(url) && !seenUrls.has(url)) {
      seenUrls.add(url);
      images.push(url);
    }
  };

  // 1. media:content에서 모든 이미지 추출
  if (item.mediaContent) {
    const media = item.mediaContent;
    if (Array.isArray(media)) {
      media.forEach(m => {
        if (m.$ && m.$.url) addImage(m.$.url);
        else if (m.url) addImage(m.url);
      });
    } else {
      if (typeof media === 'string') addImage(media);
      else if (media.$ && media.$.url) addImage(media.$.url);
      else if (media.url) addImage(media.url);
    }
  }

  // 2. media:thumbnail
  if (item.mediaThumbnail) {
    const thumb = item.mediaThumbnail;
    if (typeof thumb === 'string') addImage(thumb);
    else if (thumb.$ && thumb.$.url) addImage(thumb.$.url);
    else if (thumb.url) addImage(thumb.url);
  }

  // 3. enclosure
  if (item.enclosure) {
    const enclosure = item.enclosure;
    let url = '';
    if (typeof enclosure === 'string') url = enclosure;
    else if (enclosure.url) url = enclosure.url;
    else if (enclosure.$ && enclosure.$.url) url = enclosure.$.url;

    if (url) {
      const type = enclosure.type || enclosure.$?.type || '';
      if (type.includes('image') || url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        addImage(url);
      }
    }
  }

  // 4. content:encoded, content, summary, description에서 모든 <img> 태그 추출
  const contentFields = [
    item.contentEncoded,
    item['content:encoded'],
    item.content_encoded,
    typeof item.content === 'string' ? item.content : item.content?._ || item.content?.['#'],
    typeof item.summary === 'string' ? item.summary : item.summary?._,
    item.description,
  ];

  contentFields.forEach(field => {
    if (field && typeof field === 'string') {
      // 모든 <img> 태그의 src 추출
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = imgRegex.exec(field)) !== null) {
        addImage(decodeHTMLEntities(match[1]));
      }
    }
  });

  // 5. image 필드
  if (item.image) {
    if (typeof item.image === 'string') addImage(item.image);
    else if (item.image.url) addImage(item.image.url);
  }

  return images;
}

/**
 * RSS 아이템에서 첫 번째 이미지 URL 추출 (기존 함수 유지)
 * 다양한 RSS 포맷을 지원하도록 확장
 */
export function extractImageFromRSS(item: any): string | null {
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
      // HTML 엔티티 디코딩
      return decodeHTMLEntities(imgMatch[1]);
    }
  }

  // 5. content에서 이미지 추출 (Atom 피드)
  if (item.content) {
    // content가 객체인 경우 (Atom 피드)
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

  // 10. og:image 메타 태그에서 추출 (일부 피드에서 포함)
  const fullContent = contentEncoded || item.content || item.description || '';
  if (fullContent) {
    const ogMatch = fullContent.match(/og:image['"]\s*content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      return decodeHTMLEntities(ogMatch[1]);
    }
  }

  return null;
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#038;/g, '&');
}

/**
 * 문자열을 해시값으로 변환 (간단한 해시 함수)
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Unsplash에서 무료 이미지 가져오기
 * images.unsplash.com을 사용하여 더 안정적인 이미지 제공
 * articleId를 사용하여 deterministic하게 이미지 선택 (중복 방지)
 */
export function getUnsplashImageUrl(
  category: string,
  width: number = 800,
  height: number = 600,
  articleId?: string
): string {
  const keywords = categoryKeywords[category] || ['lifestyle', 'elegant'];

  // 카테고리별 고정 이미지 풀 (안정적인 Unsplash 이미지 ID 사용)
  // 각 카테고리별로 더 다양하고 관련성 높은 이미지 추가
  const categoryImages: Record<string, string[]> = {
    '패션': [
      'photo-1490481651871-ab68de25d43d', // 패션 모델
      'photo-1483985988355-763728e1935b', // 옷걸이 의류
      'photo-1469334031218-e382a71b716b', // 시크한 여성
      'photo-1558769132-cb1aea1c85bc', // 패션쇼
      'photo-1539109136881-3be0616acf4b', // 모던 패션
      'photo-1515886657613-9f3515b0c78f', // 액세서리
    ],
    '뷰티': [
      'photo-1596462502278-27bfdc403348', // 스킨케어
      'photo-1512496015851-a90fb38ba796', // 화장품
      'photo-1487412947147-5cebf100ffc2', // 뷰티 제품
      'photo-1522335789203-aabd1fc54bc9', // 립스틱
      'photo-1571875257727-256c39da42af', // 메이크업 브러시
      'photo-1570172619644-dfd03ed5d881', // 향수
    ],
    '컬처': [
      'photo-1518998053901-5348d3961a04', // 전시회
      'photo-1507003211169-0a1dd7228f2d', // 극장
      'photo-1481627834876-b7833e8f5570', // 책
      'photo-1514306191717-452ec28c7814', // 갤러리
      'photo-1460661419201-fd4cecdf8a8b', // 아트
      'photo-1536924940846-227afb31e2a5', // 공연
    ],
    '여행': [
      'photo-1559827260-dc66d52bef19', // 여행 풍경
      'photo-1506929562872-bb421503ef21', // 목적지
      'photo-1488646953014-85cb44e25828', // 해변
      'photo-1476514525535-07fb3b4ae5f1', // 호텔
      'photo-1503220317375-aaad61436b1b', // 럭셔리 여행
      'photo-1530789253388-582c481c54b0', // 리조트
    ],
    '푸드': [
      'photo-1504674900247-0877df9cc836', // 고급 요리
      'photo-1565299624946-b28f40a0ae38', // 맛있는 음식
      'photo-1482049016688-2d3e1b311543', // 레스토랑
      'photo-1414235077428-338989a2e8c0', // 파인다이닝
      'photo-1559339352-11d035aa65de', // 플레이팅
      'photo-1551024601-bec78aea704b', // 고급 레스토랑
    ],
    '하우징': [
      'photo-1556912173-3bb406ef7e77', // 인테리어
      'photo-1484101403633-562f891dc89a', // 거실
      'photo-1600585154340-be6161a56a0c', // 모던 하우스
      'photo-1600566753086-00f18fb6b3ea', // 침실
      'photo-1600607687939-ce8a6c25118c', // 주방
      'photo-1600210492486-724fe5c67fb0', // 욕실
    ],
    '글로벌트렌드': [
      'photo-1526304640581-d334cdbbf45e', // 비즈니스
      'photo-1451187580459-43490279c0fa', // 세계
      'photo-1488590528505-98d2b5aba04b', // 기술
      'photo-1559526324-4b87b5e36e44', // 혁신
      'photo-1486406146926-c627a92ad1ab', // 오피스
      'photo-1454165804606-c3d57bc86b40', // 글로벌
    ],
    '라이프스타일': [
      'photo-1523580494863-6f3031224c94', // 라이프스타일
      'photo-1517817748493-49ec54a32465', // 편안함
      'photo-1522410818928-5522dacd5066', // 여유
      'photo-1513151233558-d860c5398176', // 홈 라이프
      'photo-1506126613408-eca07ce68773', // 럭셔리
      'photo-1512295767273-ac109ac3acfa', // 모던 라이프
    ]
  };

  const images = categoryImages[category] || categoryImages['라이프스타일'];

  // articleId가 있으면 해시 기반으로 deterministic하게 선택, 없으면 랜덤
  let selectedImage: string;
  if (articleId) {
    const hash = simpleHash(articleId);
    const index = hash % images.length;
    selectedImage = images[index];
  } else {
    selectedImage = images[Math.floor(Math.random() * images.length)];
  }

  return `https://images.unsplash.com/${selectedImage}?w=${width}&h=${height}&fit=crop`;
}

/**
 * 제목/내용 기반으로 관련 키워드 추출 및 카테고리 판별
 */
export function extractKeywordsFromContent(title: string, content: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const keywords: string[] = [];

  // 패션 관련 - 브랜드명 포함
  if (text.match(/fashion|style|dress|outfit|wear|clothing|패션|스타일|hilfiger|tommy|어워드|런웨이|모델|디자이너/)) {
    keywords.push('fashion', 'style');
  }
  // 뷰티 관련 - 제품 카테고리 포함
  if (text.match(/beauty|skin|makeup|cosmetic|뷰티|피부|화장|립스틱|향수|브러시|스킨케어/)) {
    keywords.push('beauty', 'skincare');
  }
  // 음식 관련 - 레스토랑, 요리 스타일 포함
  if (text.match(/food|recipe|cook|restaurant|cuisine|음식|요리|레스토랑|카페|그릴|다이닝|두바이|맛집/)) {
    keywords.push('food', 'cuisine', 'restaurant');
  }
  // 여행 관련 - 도시, 장소명 포함
  if (text.match(/travel|trip|destination|여행|관광|호텔|리조트|명소|dubai|london|paris/)) {
    keywords.push('travel', 'destination');
  }
  // 인테리어/하우징 - 공간 유형 포함
  if (text.match(/home|interior|house|design|집|인테리어|디자인|주거|공간|카페|건축|폐허/)) {
    keywords.push('interior design', 'home', 'architecture');
  }
  // 건강/운동
  if (text.match(/health|fitness|exercise|workout|건강|운동|요가|웰니스/)) {
    keywords.push('fitness', 'wellness');
  }
  // 문화/아트
  if (text.match(/culture|art|music|exhibition|gallery|문화|예술|음악|전시|갤러리|공연/)) {
    keywords.push('culture', 'art');
  }
  // 쇼핑/세일
  if (text.match(/shopping|sale|black friday|블랙 ?프라이데이|세일|할인|쇼핑/)) {
    keywords.push('shopping', 'retail');
  }

  return keywords.length > 0 ? keywords : ['lifestyle'];
}

/**
 * 스마트 이미지 URL 생성 (제목/내용 기반)
 * 제목과 내용을 분석하여 더 관련성 높은 카테고리의 이미지 선택
 * articleId를 추가하여 중복 방지
 */
export function getSmartUnsplashUrl(
  title: string,
  content: string,
  category: string,
  width: number = 800,
  height: number = 600,
  articleId?: string
): string {
  const text = `${title} ${content}`.toLowerCase();

  // 제목/내용에서 더 구체적인 카테고리 추론
  // 우선순위: 패션/뷰티 > 푸드 > 문화 > 여행 > 하우징
  // (패션 관련이 제일 강하게 매칭되도록)
  let inferredCategory = category;

  // 패션 키워드가 있으면 최우선 (신발, 드레스, 브랜드명 등 포함)
  if (text.match(/fashion|style|tommy|hilfiger|어워드|런웨이|디자이너|모델|드레스|shoe|sneaker|신발|옷|의류|브랜드|매장.*fashion|store.*fashion|abercrombie|missoni|balenciaga|dior|victoria beckham/i)) {
    inferredCategory = '패션';
  }
  // 뷰티 키워드 (화장품, 스킨케어 등)
  else if (text.match(/beauty|cosmetic|makeup|뷰티|화장품|립스틱|스킨케어|블랙.*프라이데이.*뷰티|black.*friday.*beauty/i)) {
    inferredCategory = '뷰티';
  }
  // 문화/아트 키워드 (연극, 작가, 공연 등)
  else if (text.match(/culture|art|exhibition|gallery|museum|문화|예술|전시|연극|작가|공연|stoppard|atwood/i)) {
    inferredCategory = '컬처';
  }
  // 레스토랑/음식 키워드
  else if (text.match(/restaurant|food|cuisine|dining|그릴|레스토랑|맛집|음식|요리|tequila|테킬라/i)) {
    inferredCategory = '푸드';
  }
  // 여행/장소 키워드
  else if (text.match(/travel|destination|hotel|resort|dubai|london|paris|여행|호텔/i)) {
    inferredCategory = '여행';
  }
  // 인테리어/공간 키워드 (제일 마지막 우선순위)
  else if (text.match(/interior|house|home.*design|space.*design|카페|인테리어|주거|공간|폐허/i)) {
    inferredCategory = '하우징';
  }

  // 추론된 카테고리로 이미지 반환 (articleId 전달)
  return getUnsplashImageUrl(inferredCategory, width, height, articleId);
}

/**
 * 이미지 URL 유효성 검사 (간단히 확장자 체크)
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  // 기본 URL 형식 체크
  try {
    new URL(url);
  } catch {
    return false;
  }

  // 이미지 확장자 또는 이미지 서비스 URL인지 확인
  const imagePatterns = [
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i,
    /unsplash\.com/i,
    /images\.unsplash\.com/i,
    /source\.unsplash\.com/i,
    /pexels\.com/i,
    /imgur\.com/i,
    /cloudinary\.com/i,
  ];

  return imagePatterns.some(pattern => pattern.test(url));
}

/**
 * 원본 기사 URL에서 og:image 메타 태그 추출
 * RSS에 이미지가 없을 경우 사용
 */
export async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ThirdTwentyBot/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();

    // og:image 추출
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    if (ogImageMatch && ogImageMatch[1]) {
      return decodeHTMLEntities(ogImageMatch[1]);
    }

    // twitter:image 폴백
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

    if (twitterImageMatch && twitterImageMatch[1]) {
      return decodeHTMLEntities(twitterImageMatch[1]);
    }

    return null;
  } catch (error) {
    // 타임아웃이나 네트워크 에러 시 조용히 실패
    return null;
  }
}

/**
 * 통합 이미지 가져오기 함수
 * 1. RSS에서 이미지 추출 시도
 * 2. 원본 URL에서 og:image 추출 시도
 * 3. 실패하면 Unsplash에서 관련 이미지 가져오기
 */
export async function getArticleImage(
  rssItem: any,
  category: string,
  title: string,
  content: string,
  sourceUrl?: string
): Promise<string> {
  // 1. RSS에서 이미지 추출 시도
  const rssImage = extractImageFromRSS(rssItem);

  if (rssImage && isValidImageUrl(rssImage)) {
    console.log(`    📷 RSS 원본 이미지 사용: ${rssImage.substring(0, 50)}...`);
    return rssImage;
  }

  // 2. 원본 URL에서 og:image 추출 시도
  if (sourceUrl) {
    const ogImage = await fetchOgImage(sourceUrl);
    if (ogImage && isValidImageUrl(ogImage)) {
      console.log(`    📷 OG Image 사용: ${ogImage.substring(0, 50)}...`);
      return ogImage;
    }
  }

  // 3. Unsplash 폴백
  const unsplashUrl = getSmartUnsplashUrl(title, content, category);
  console.log(`    📷 Unsplash 이미지 사용: ${unsplashUrl.substring(0, 50)}...`);
  return unsplashUrl;
}

export default {
  extractImageFromRSS,
  extractAllImagesFromRSS,
  getUnsplashImageUrl,
  getSmartUnsplashUrl,
  getArticleImage,
  isValidImageUrl,
  fetchOgImage,
};
