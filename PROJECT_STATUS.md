# 320mag 콘텐츠 자동화 시스템 - 진행 상황

**마지막 업데이트**: 2024-12-20

## 🎯 프로젝트 목표

9개 카테고리에 최신 뉴스가 겹치지 않게 정기적으로 자동 업로드

## ✅ 완료된 기능

### 1. RSS 수집 인프라
- [x] RSS 피드 파싱 (41개 소스)
- [x] 카테고리별 소스 관리 (`src/data/content-sources.ts`)
- [x] AI 리라이팅 (Claude 3.5 Sonnet)
- [x] 중복 이미지 조기 차단 (AI 처리 전 → 60초 절약)

### 2. 자동 Fallback 시스템 ✨
- [x] RSS 소스 실패 시 자동 대체 (`src/services/contentPipeline.ts:227-263`)
- [x] 대체 소스 풀 30+ RSS (`src/data/alternative-sources.ts`)
- [x] 우선순위 기반 fallback
- [x] 실패 로깅 시스템 (`src/services/recoveryService.ts`)

### 3. 정기 자동화 ⏰
- [x] GitHub Actions 설정 (`.github/workflows/daily-collection.yml`)
- [x] 매일 오전 9시 (한국시간) 자동 실행
- [x] `npm run collect:scheduled` 스크립트

### 4. 모니터링 도구
- [x] RSS Health Check 스크립트 (`scripts/rss-health-check.ts`)
- [x] Recovery System 테스트 (`scripts/test-recovery-system.ts`)
- [x] 카테고리 상태 체크 스크립트

### 5. 콘텐츠 가이드라인
- [x] 글로벌트렌드 시니어 특화 (40-50대 이상)
- [x] 카테고리 중복 방지 가이드라인

### 6. 카테고리 오분류 수정 ✨
- [x] 키워드 매칭 순서 재정렬 (`src/services/categoryInference.ts:125-143`)
- [x] 섹슈얼리티/운동을 심리/건강푸드보다 먼저 체크
- [x] 추가 키워드 보강 (sexual health, dating, training, gym 등)
- [x] 하우징 'home' 키워드 문제 수정 → 'home design', 'home interior'로 더 구체화
- [x] 여행 키워드 추가 (island, monument, landmark, memorial)

## 🔄 진행 중

### 데이터베이스 균형 맞추기
**다음 단계**:
- [ ] 초과 카테고리 정리 (심리 9/4, 건강푸드 6/4, 패션 6/4 등)
- [ ] 부족 카테고리 채우기 (섹슈얼리티 0/4, 운동 0/4 등)

## ❌ 미완료

### 1. 데이터베이스 균형
**현재 상태** (2024-12-20 기준):
```
✅ 뷰티: 4/4
✅ 글로벌트렌드: 4/4
⚠️  글로벌푸드: 3/4
⚠️  여행: 2/4
❌ 섹슈얼리티: 0/4
❌ 운동: 0/4

초과:
- 심리: 9/4 (+5)
- 건강푸드: 6/4 (+2)
- 패션: 6/4 (+2)
- 라이프스타일: 5/4 (+1)
- 하우징: 5/4 (+1)
```

**할 일**:
- [ ] 초과 카테고리 정리 (`trim-excess-categories.ts`)
- [ ] 부족 카테고리 채우기 (`fill-categories-to-4.ts`)

### 2. 중복 없는 최신 뉴스 보장
- [ ] 이미지 중복 체크 강화 ✅ (완료)
- [ ] 제목 중복 체크 추가 검토
- [ ] 오래된 기사 자동 삭제 시스템

## 📊 시스템 성능

### RSS 소스 건강도
- **정상**: 33/41 (80%)
- **실패**: 8/41 (20%)
  - 404 에러: 5개
  - 403 CloudFront 차단: 3개

### 자동 복구 성공률
- **테스트 결과**: 40% (5회 시도 중 2회 성공)
- **복구 사례**: Into The Gloss (404) → Coveteur (성공)

### 성능 개선
- **이전**: 25분 (전체 수집)
- **현재**: 9분 (64% 개선)
- **절약**: 480초 (이미지 중복 조기 차단)

## 🛠 주요 파일

### 핵심 서비스
- `src/services/contentPipeline.ts` - 메인 수집 파이프라인
- `src/services/categoryInference.ts` - 카테고리 자동 추론
- `src/services/recoveryService.ts` - 자동 복구 시스템
- `src/services/aiRewriteService.ts` - AI 리라이팅

### 데이터 소스
- `src/data/content-sources.ts` - 기본 RSS 소스 (41개)
- `src/data/alternative-sources.ts` - 대체 소스 풀 (30+)

### 스크립트
- `scripts/rss-health-check.ts` - RSS 건강 체크
- `scripts/fill-categories-to-4.ts` - 카테고리 채우기
- `scripts/trim-excess-categories.ts` - 초과 카테고리 정리
- `scripts/collect-missing-categories.ts` - 부족 카테고리 수집

## 🔧 다음 단계

1. ~~**즉시**: 카테고리 오분류 수정~~ ✅ 완료 (2024-12-21)
2. **즉시**: 데이터베이스 균형 (모든 카테고리 4/4)
   - 초과 카테고리 정리 (심리 9→4, 건강푸드 6→4, 패션 6→4 등)
   - 부족 카테고리 채우기 (섹슈얼리티 0→4, 운동 0→4 등)
3. **단기**: 자동 복구 성공률 향상
4. **장기**: API 기반 대체 소스 추가 (NewsAPI, Guardian API)

## 📝 알려진 이슈

### 1. RSS 소스 실패
- Into The Gloss, Beautylish, Serious Eats, Saveur: 404
- Breaking Muscle, Lonely Planet, Budget Travel: 403 CloudFront
- Psychology Today: 404
- **해결**: 자동 Fallback 시스템으로 대체 소스 사용 중

### 2. 카테고리 분류 ✅ 해결됨!
- ~~키워드 매칭 순서로 인한 오분류~~ → 수정 완료 (2024-12-21)
- ~~심리 관련 키워드가 섹슈얼리티보다 먼저 매칭됨~~ → 순서 변경 완료

### 3. 중복 이미지
- 일부 RSS 피드에서 같은 이미지 재사용
- 대체 소스 풀로 다양성 확보 중

## 🎯 성공 기준

- [ ] 모든 카테고리 4/4 달성
- [ ] 중복 없는 최신 뉴스 (이미지, 제목)
- [ ] 매일 자동 수집 안정성 95%+
- [ ] 카테고리 오분류율 5% 미만

---

**Note**: 이 문서는 작업 진행에 따라 지속적으로 업데이트됩니다.
