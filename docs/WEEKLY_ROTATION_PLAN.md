# Third Twenty 요일별 카테고리 순환 계획

## 📅 요일별 카테고리 배정 (매일 3개 기사)

### 월요일 - 패션 & 뷰티
- 패션 2개
- 뷰티 1개
- **테마**: 한 주를 시작하는 스타일링

### 화요일 - 컬처 & 여행
- 컬처 2개
- 여행 1개
- **테마**: 문화생활과 여행 영감

### 수요일 - 푸드 & 하우징
- 푸드 2개
- 하우징 1개
- **테마**: 집과 식탁

### 목요일 - 글로벌트렌드 & 시니어시장
- 글로벌트렌드 2개
- 시니어시장 1개
- **테마**: 세상 읽기

### 금요일 - 심리 & 섹슈얼리티
- 심리 2개
- 섹슈얼리티 1개
- **테마**: 관계와 내면

### 토요일 - 운동 & 의료
- 운동 2개
- 의료 1개
- **테마**: 건강한 주말

### 일요일 - 베스트 리뷰 & 라이프스타일
- 라이프스타일 3개
- **특별**: 한 주 베스트 기사 큐레이션

---

## 💰 비용 계산

### 기본 설정
- **운영**: 매일
- **기사**: 3개/일
- **월간 총 기사**: 3 × 30 = **90개**

### 월간 비용
- 1기사당 비용: ₩154
- 월간 비용: 90 × ₩154 = **₩13,860**
- 연간 비용: ₩13,860 × 12 = **₩166,320**

### 기사당 토큰 사용량
- Input: 2,400 tokens
- Output: 3,010 tokens
- API 비용/기사: $0.114

### 일일 비용
- 3개 × $0.114 = **$0.342** (약 ₩462)

---

## 📊 다른 방식과 비교

| 방식 | 월 기사 | 월 비용 (₩) | 연 비용 (₩) | 특징 |
|------|---------|------------|------------|------|
| **매일 3개 순환** ⭐⭐⭐ | 90개 | 13,860 | 166,000 | 가장 경제적! |
| 주3회 × 16개 | 208개 | 32,100 | 385,000 | 콘텐츠 많음 |
| 주3회 × 8개 | 104개 | 16,100 | 193,000 | 균형적 |
| 매일 × 16개 | 480개 | 74,100 | 889,000 | 비용 높음 |

---

## ✅ 장점

### 1. 비용 효율 최고
- **월 ₩13,860** - 가장 저렴!
- 카페 라떼 10잔 값
- 연간 ₩166,000 (기존 대비 -91%)

### 2. 독자 경험 최적화
- 매일 신선한 콘텐츠
- 요일별 테마로 기대감 형성
- "월요일은 패션, 금요일은 관계" 습관화
- 부담 없는 분량 (하루 3개)

### 3. 콘텐츠 품질 향상
- 카테고리당 집중도 높음
- 각 카테고리 주 1회 깊이 있게
- 중복 없는 다양성

### 4. 운영 효율
- 매일 일정한 루틴
- 예측 가능한 콘텐츠 흐름
- 독자 재방문 유도

---

## 🎯 권장 변형

### 옵션 A: 주중 5일 (월~금)
```
월: 패션 3개
화: 뷰티 3개
수: 컬처 3개
목: 푸드 3개
금: 글로벌트렌드 3개

월간: 65개 기사
월 비용: ₩10,010
연 비용: ₩120,000
```

**장점**: 주말 휴식, 더 저렴

### 옵션 B: 매일 5개 (풍부)
```
월: 패션 3 + 뷰티 2
화: 컬처 3 + 여행 2
... (동일 패턴)

월간: 150개 기사
월 비용: ₩23,100
연 비용: ₩277,000
```

**장점**: 콘텐츠 풍부, 여전히 저렴

---

## 🔧 기술 구현

### 1. 요일별 스케줄링 함수

```typescript
// contentPipeline.ts

// 요일별 카테고리 맵핑
const WEEKLY_SCHEDULE = {
  0: { // 일요일
    categories: ['라이프스타일'],
    counts: [3]
  },
  1: { // 월요일
    categories: ['패션', '뷰티'],
    counts: [2, 1]
  },
  2: { // 화요일
    categories: ['컬처', '여행'],
    counts: [2, 1]
  },
  3: { // 수요일
    categories: ['푸드', '하우징'],
    counts: [2, 1]
  },
  4: { // 목요일
    categories: ['글로벌트렌드', '시니어시장'],
    counts: [2, 1]
  },
  5: { // 금요일
    categories: ['심리', '섹슈얼리티'],
    counts: [2, 1]
  },
  6: { // 토요일
    categories: ['운동', '의료'],
    counts: [2, 1]
  }
};

export async function dailyRotationCollection(apiKey?: string) {
  const today = new Date().getDay(); // 0 = 일요일
  const schedule = WEEKLY_SCHEDULE[today];

  console.log(`\n📅 ${getDayName(today)} 콘텐츠 수집`);
  console.log(`📂 카테고리: ${schedule.categories.join(', ')}`);

  const result: CollectionResult = {
    success: 0,
    failed: 0,
    articles: [],
    errors: [],
  };

  for (let i = 0; i < schedule.categories.length; i++) {
    const category = schedule.categories[i];
    const count = schedule.counts[i];

    console.log(`\n🔄 [${category}] ${count}개 수집 중...`);

    const categoryResult = await collectAndRewriteCategory(
      category,
      count,
      apiKey
    );

    result.success += categoryResult.success;
    result.failed += categoryResult.failed;
    result.articles.push(...categoryResult.articles);
    result.errors.push(...categoryResult.errors);
  }

  console.log(`\n✅ ${getDayName(today)} 수집 완료`);
  console.log(`   성공: ${result.success}개`);
  console.log(`   실패: ${result.failed}개`);

  return result;
}

function getDayName(day: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[day];
}
```

### 2. Cron 설정

```bash
# 매일 오전 9시 실행
0 9 * * * cd /path/to/320mag && npm run collect:daily

# package.json
{
  "scripts": {
    "collect:daily": "tsx scripts/daily-rotation.ts"
  }
}
```

### 3. 스크립트 파일

```typescript
// scripts/daily-rotation.ts
import { dailyRotationCollection } from '../src/services/contentPipeline';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;

async function main() {
  console.log('🚀 일일 순환 수집 시작');
  console.log(`⏰ ${new Date().toLocaleString('ko-KR')}`);

  if (!OPENAI_API_KEY) {
    console.error('❌ OpenAI API 키 필요');
    process.exit(1);
  }

  const result = await dailyRotationCollection(OPENAI_API_KEY);

  console.log('\n📊 결과:');
  console.log(`   총 ${result.success}개 기사 생성`);
  console.log(`   비용: 약 ₩${result.success * 154}`);

  process.exit(result.failed > 0 ? 1 : 0);
}

main();
```

---

## 📈 예상 효과

### 독자 행동 패턴
```
월요일: "오늘은 패션 데이니까 새 스타일 보러 가야지"
금요일: "금요일엔 관계 얘기 나오니까 읽어봐야지"
일요일: "이번 주 베스트는 뭐였을까?"
```

### SEO 효과
- 요일별 키워드 최적화
- 규칙적 콘텐츠 발행 → 검색엔진 신뢰도 상승
- 독자 재방문 → 체류시간 증가

### 운영 효율
- 예측 가능한 워크플로우
- 카테고리별 성과 추적 용이
- 요일별 A/B 테스트 가능

---

## 💡 최종 추천

### 🏆 1순위: 매일 3개 순환 (현재 제안)
```
월간: 90개
월 비용: ₩13,860
연 비용: ₩166,000
```

**이유**:
- ✅ 가장 경제적 (월 1.4만원!)
- ✅ 매일 신선한 콘텐츠
- ✅ 요일별 테마로 습관 형성
- ✅ 독자 부담 없는 분량

### 🥈 2순위: 주중 5일 × 3개
```
월간: 65개
월 비용: ₩10,010
연 비용: ₩120,000
```

**이유**: 더 저렴, 주말 휴식

---

**결론**: 매일 3개씩 요일별 순환이 **비용, 독자 경험, 운영 효율** 모두 최고! 🎯
