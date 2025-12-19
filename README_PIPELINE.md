# Third Twenty (써드트웬티) - AI 콘텐츠 자동화 파이프라인

40-60대를 위한 시니어 매거진의 AI 기반 자동 콘텐츠 수집 및 리라이팅 시스템

## 🎯 프로젝트 개요

Third Twenty는 RSS 피드에서 콘텐츠를 수집하고, OpenAI GPT-4를 사용하여 AI 에디터 페르소나로 리라이팅한 후, Supabase에 자동으로 저장하는 통합 파이프라인을 갖춘 시니어 매거진 플랫폼입니다.

## ✨ 주요 기능

### 1. RSS → AI 리라이팅 → Supabase 저장 통합 파이프라인
- RSS 피드에서 최신 기사 자동 수집
- 12명의 AI 에디터 페르소나(45-60세)로 콘텐츠 리라이팅
- Supabase PostgreSQL에 자동 저장

### 2. 자동 콘텐츠 수집 스케줄러
- GitHub Actions를 통한 매일 자동 실행
- 8개 카테고리 동시 수집 (패션, 뷰티, 컬처, 여행, 시니어시장, 글로벌트렌드, 푸드, 하우징)
- OpenAI API Rate Limiting 자동 관리

### 3. AI 에디터 시스템
12명의 전문 AI 에디터가 각 분야의 콘텐츠를 담당:
- **소피아** (45세) - 패션 디렉터
- **제인** (46세) - 뷰티 전문가
- **마틴** (55세) - 문화 평론가
- **클라라** (50세) - 여행 작가
- **헨리** (54세) - 시니어 시장 전문가
- **마커스** (49세) - 글로벌 트렌드 분석가
- **앙투안** (48세) - 셰프
- **토마스** (52세) - 건축가
- 그 외 4명 (심리, 운동, 섹슈얼리티, 편집장)

## 📦 기술 스택

- **Frontend**: React 18.3.1 + TypeScript 5.8.3 + Vite 5.4.19
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI GPT-4 Turbo
- **RSS Parsing**: rss-parser
- **Automation**: GitHub Actions
- **Styling**: TailwindCSS + shadcn/ui

## 🚀 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 다음 값을 설정하세요:

```env
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=your-supabase-url
VITE_OPENAI_API_KEY=your-openai-api-key
```

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

## 📝 주요 스크립트

### 콘텐츠 수집

```bash
# 통합 파이프라인 테스트 (2개 아티클)
npm run test:pipeline

# 패션 카테고리 집중 수집 (5개 아티클)
npm run collect:fashion

# 전체 카테고리 자동 수집 (카테고리당 3개)
npm run collect:scheduled

# 저장된 아티클 확인
npm run check:articles
```

### 데이터베이스 초기화

Supabase SQL Editor에서 다음 SQL 스크립트들을 순서대로 실행:

1. **초기 데이터 생성**
```bash
scripts/seed-data.sql
```
- 8개 카테고리 생성
- 12명의 AI 에디터 크리에이터 생성

2. **RLS 정책 설정**
```bash
scripts/disable-rls-articles.sql
```
- articles 테이블 INSERT/SELECT 권한 추가

## 📁 프로젝트 구조

```
320mag/
├── src/
│   ├── services/
│   │   ├── contentPipeline.ts      # RSS → AI → DB 통합 파이프라인
│   │   ├── aiRewriteService.ts     # OpenAI GPT-4 리라이팅
│   │   └── editorMapping.ts        # 에디터 ID 매핑
│   ├── hooks/
│   │   ├── useArticles.ts          # 아티클 조회
│   │   └── useCreators.ts          # 크리에이터 조회
│   ├── pages/
│   │   ├── ArticleDetailPage.tsx   # 아티클 상세
│   │   ├── CreatorsPage.tsx        # 크리에이터 목록
│   │   └── CategoryPage.tsx        # 카테고리별 필터링
│   └── data/
│       └── editors.ts               # 12명 AI 에디터 페르소나
├── scripts/
│   ├── test-pipeline.ts             # 파이프라인 테스트
│   ├── scheduled-collection.ts      # 자동 수집 스크립트
│   ├── collect-fashion.ts           # 패션 집중 수집
│   ├── check-articles.ts            # 아티클 확인
│   ├── seed-data.sql                # 초기 데이터 SQL
│   └── disable-rls-articles.sql     # RLS 정책 SQL
└── .github/
    └── workflows/
        └── scheduled-content-collection.yml  # GitHub Actions
```

## 🔄 자동화 워크플로우

### GitHub Actions 자동 실행
- **실행 시간**: 매일 오전 9시 (KST)
- **실행 내용**: 8개 카테고리에서 각 3개씩 총 24개 아티클 수집
- **수동 실행**: GitHub Actions 탭에서 workflow_dispatch로 수동 실행 가능

### 파이프라인 흐름

```
1. RSS 피드 수집
   ↓
2. 최신 N개 아티클 선택
   ↓
3. OpenAI GPT-4로 AI 에디터 스타일 리라이팅
   ↓
4. 카테고리 ID 조회
   ↓
5. 크리에이터 UUID 조회
   ↓
6. Supabase articles 테이블에 저장
   ↓
7. 결과 통계 출력
```

## 📊 데이터 구조

### Articles 테이블

```typescript
{
  id: UUID,
  title: string,
  content: string,
  excerpt: string,
  slug: string,
  category_id: UUID,           // categories 테이블 FK
  creator_id: UUID,            // creators 테이블 FK
  published_at: timestamp,
  status: 'published',
  created_at: timestamp
}
```

### Creators 테이블

```typescript
{
  id: UUID,
  name: string,
  age: number,
  profession: string,
  specialty: string,
  bio: string,
  experience: string,
  status: 'active',
  verified: boolean,
  articles_count: number
}
```

### Categories 테이블

```typescript
{
  id: UUID,
  name: string,
  slug: string,
  description: string,
  order_index: number
}
```

## ⚙️ 설정

### RSS 소스 설정

`src/data/content-sources.ts`에서 RSS 피드 소스를 관리합니다:

```typescript
export const contentSources = [
  {
    name: "Women's Wear Daily",
    url: "https://wwd.com/feed/",
    category: "패션",
    type: "rss",
    isActive: true
  },
  // ... 더 많은 소스
];
```

### AI 에디터 페르소나 설정

`src/data/editors.ts`에서 AI 에디터의 톤, 스타일, 프롬프트를 관리합니다.

## 🎯 사용 예시

### 1. 테스트 실행

```bash
# 파이프라인 테스트 (패션 카테고리 2개)
npm run test:pipeline
```

**출력 예시:**
```
✅ 성공: 2개
📰 저장된 아티클:
1. 파리에 착륙한 피레오의 첫 신발 매장, 스위스 디자인의 품격과 만나다
2. 마사 스튜어트와 함께하는 아메리칸 이글의 세대를 잇는 홀리데이 캠페인
```

### 2. 저장된 데이터 확인

```bash
npm run check:articles
```

**출력 예시:**
```
📝 전체 아티클: 12개

📊 카테고리별 통계:
   패션: 5개
   뷰티: 3개
   컬처: 2개

👥 크리에이터별 통계:
   소피아: 2개
   박미경: 3개
```

## 🔧 트러블슈팅

### OpenAI API 키 에러
```bash
OpenAI API 키가 설정되지 않았습니다
```
**해결**: `.env` 파일의 `VITE_OPENAI_API_KEY` 확인

### Supabase RLS 에러
```bash
new row violates row-level security policy
```
**해결**: `scripts/disable-rls-articles.sql` 실행

### 크리에이터 UUID 에러
```bash
Creator UUID를 찾을 수 없습니다
```
**해결**: `scripts/seed-data.sql` 실행하여 크리에이터 데이터 생성

## 📈 성능

- **RSS 수집**: ~1초/피드
- **AI 리라이팅**: ~10초/아티클 (GPT-4 Turbo)
- **DB 저장**: ~100ms/아티클
- **Rate Limiting**: 아티클당 2초 대기

## 🚀 배포

### GitHub Actions Secrets 설정

GitHub 리포지토리 Settings > Secrets에서 다음을 추가:

```
VITE_SUPABASE_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_URL
VITE_OPENAI_API_KEY
```

## 📄 라이선스

Private Project - All Rights Reserved

## 👥 팀

Third Twenty Development Team

---

**버전**: 1.0.0
**마지막 업데이트**: 2025-11-25
