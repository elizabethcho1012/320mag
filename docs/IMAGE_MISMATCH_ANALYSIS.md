# 이미지-콘텐츠 불일치 문제 분석

## 🔍 문제 상황

**증상**:
- 뷰티 기사에 뷰티 관련 이미지가 아닌 다른 이미지 표시
- Tom Stoppard를 다루는 기사에 해당 인물 사진이 아닌 이미지 표시
- 매거진 신뢰성 저하

---

## 🐛 원인 분석

### 현재 이미지 선택 로직 (contentPipeline.ts:195-218)

```typescript
// 1순위: RSS 원본 이미지
let featuredImageUrl = article.imageUrl;

// 2순위: OG Image (원본 기사 URL)
if (!featuredImageUrl && article.sourceUrl) {
  const ogImage = await fetchOgImage(article.sourceUrl);
  if (ogImage && isValidImageUrl(ogImage)) {
    featuredImageUrl = ogImage;
  }
}

// 3순위: Unsplash 폴백 (리라이팅된 제목/내용 기반)
if (!featuredImageUrl) {
  featuredImageUrl = getSmartUnsplashUrl(
    rewritten.title,  // ⚠️ 리라이팅된 제목 (한국어)
    rewritten.content, // ⚠️ 리라이팅된 내용 (한국어)
    inferredCategory,
    800,
    600
  );
}
```

### 문제점

#### 1. **리라이팅 후 내용 불일치**
- **원본 기사**: "Anya Taylor-Joy Closes Her Marrakech Film Festival..."
- **원본 이미지**: Anya Taylor-Joy 드레스 사진 (정확함)
- **리라이팅 후**: Tom Stoppard 관련 내용으로 변경 (AI가 다른 각도로 해석)
- **결과**: 이미지(Anya)와 내용(Tom Stoppard) 불일치

#### 2. **RSS 이미지 우선 사용의 딜레마**
- ✅ **장점**: 원본 기사와 정확히 매칭됨
- ❌ **단점**: 리라이팅된 내용과 불일치 발생

#### 3. **Unsplash 폴백의 한계**
- 리라이팅된 한국어 제목으로 검색 → 부정확한 결과
- 예: "시니어를 위한 패션 팁" → 일반적인 패션 이미지 (특정 인물 X)

---

## 💡 해결 방안

### 옵션 1: **원본 기사 이미지 강제 사용** ⭐ 추천

**로직**:
```
RSS 이미지 → OG Image → Unsplash (원본 제목 기반)
```

**장점**:
- ✅ 이미지-원본 기사 정확한 매칭
- ✅ 저작권 안전 (원본 출처 명확)
- ✅ 고품질 이미지 보장

**단점**:
- ⚠️ 리라이팅된 내용과 약간 불일치 가능
- ⚠️ AI가 다른 각도로 해석한 경우 괴리 발생

**구현**:
- RSS/OG Image를 최우선으로 사용
- Unsplash 폴백 시 **원본 제목(영문)** 사용

---

### 옵션 2: **리라이팅 전후 매칭 검증**

**로직**:
```
1. 원본 이미지 추출 (RSS/OG)
2. AI 리라이팅 실행
3. 이미지-리라이팅 내용 매칭도 검증 (AI)
4. 매칭도 낮으면 → Unsplash 대체 또는 이미지 제거
```

**장점**:
- ✅ 이미지-내용 정확한 매칭
- ✅ 신뢰성 최대화

**단점**:
- ❌ AI 호출 1회 추가 (비용 증가)
- ❌ 처리 시간 증가
- ❌ 복잡도 증가

---

### 옵션 3: **이미지에 맞게 리라이팅 제약**

**로직**:
```
1. 원본 이미지 먼저 추출
2. 이미지 설명 생성 (Vision API)
3. 이미지 내용을 유지하도록 리라이팅 제약
```

**장점**:
- ✅ 완벽한 이미지-내용 매칭

**단점**:
- ❌ Vision API 추가 비용
- ❌ 리라이팅 창의성 제한
- ❌ 복잡도 매우 높음

---

### 옵션 4: **이미지 없이 발행 (텍스트만)**

**로직**:
```
1. RSS/OG 이미지만 사용
2. 매칭 안 되면 → featured_image_url = null
3. 프론트엔드에서 기본 이미지 표시
```

**장점**:
- ✅ 불일치 문제 완전 해결
- ✅ 단순함

**단점**:
- ❌ 비주얼 매력 저하
- ❌ 매거진 품질 저하

---

## 🎯 최종 권장 사항

### **옵션 1 개선**: 원본 이미지 우선 + 제목 기반 폴백

#### 1단계: RSS/OG Image 사용 (우선순위 최고)
```typescript
// RSS 원본 이미지
if (article.imageUrl) {
  featuredImageUrl = article.imageUrl;
  console.log(`📷 RSS 원본 이미지 사용`);
}
// OG Image (원본 기사)
else if (article.sourceUrl) {
  const ogImage = await fetchOgImage(article.sourceUrl);
  if (ogImage) {
    featuredImageUrl = ogImage;
    console.log(`📷 OG Image 사용 (원본 기사)`);
  }
}
```

#### 2단계: Unsplash 폴백 (원본 제목 사용)
```typescript
// 원본 영문 제목으로 검색 (리라이팅 X)
if (!featuredImageUrl) {
  featuredImageUrl = getSmartUnsplashUrl(
    article.title,        // ⭐ 원본 제목 (영문)
    article.content,      // ⭐ 원본 내용 (영문)
    inferredCategory,
    800,
    600
  );
  console.log(`📷 Unsplash (원본 제목 기반)`);
}
```

#### 3단계: AI 리라이팅 제약 추가
```typescript
// 프롬프트에 이미지 정보 포함
const userPrompt = `...
${featuredImageUrl ? `\n⚠️ 이미지: 원본 기사의 이미지를 사용합니다. 원본 기사의 주제를 벗어나지 마세요.` : ''}
`;
```

---

## 📊 비교표

| 옵션 | 이미지-내용 매칭 | 비용 | 복잡도 | 품질 |
|------|-----------------|------|--------|------|
| **옵션 1** ⭐ | 80% | 변동 없음 | 낮음 | 높음 |
| 옵션 2 | 95% | +30% | 높음 | 매우 높음 |
| 옵션 3 | 99% | +50% | 매우 높음 | 최고 |
| 옵션 4 | 100% | 변동 없음 | 낮음 | 낮음 |

---

## 🔧 구현 계획

### Phase 1: 즉시 개선 (옵션 1)
1. Unsplash 폴백 시 **원본 제목** 사용
2. AI 프롬프트에 **이미지 제약** 추가
3. 로그 개선 (어떤 이미지 사용했는지 명확히)

### Phase 2: 검증 추가 (선택사항)
1. 리라이팅 후 제목 유사도 검증
2. 유사도 낮으면 경고 로그
3. 수동 검토 가능하도록

### Phase 3: Vision API (나중에)
1. Anthropic Claude Vision API 사용
2. 이미지 내용 분석 → 리라이팅 제약
3. 완벽한 매칭 달성

---

## 📝 실행 예시 (개선 후)

### Before (현재)
```
원본: "Anya Taylor-Joy dress at festival"
이미지: Anya Taylor-Joy 사진 ✅
리라이팅: "Tom Stoppard 연극 분석" ❌
→ 불일치!
```

### After (개선)
```
원본: "Anya Taylor-Joy dress at festival"
이미지: Anya Taylor-Joy 사진 ✅
리라이팅: "마라케시 영화제 레드카펫 패션" ✅
→ 매칭!

AI 프롬프트:
"⚠️ 원본 기사는 'Anya Taylor-Joy의 드레스'에 관한 것입니다.
이미지가 있으므로 주제를 벗어나지 마세요."
```

---

**다음 단계**: Phase 1 구현하시겠습니까?
