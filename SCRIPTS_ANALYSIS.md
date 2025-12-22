# Scripts 폴더 테스트 파일 분석

## 개요

**총 23개의 테스트 스크립트**가 `/scripts` 폴더에 있습니다.

## 현재 상황

### ✅ 실제 사용 중 (package.json에서 참조)

```json
{
  "collect:test": "tsx scripts/test-rss-collection.ts",
  "collect:all": "tsx scripts/test-rss-collection.ts all",
  "test:pipeline": "tsx scripts/test-pipeline.ts"
}
```

**사용되는 파일**:
- `test-rss-collection.ts` - RSS 수집 테스트
- `test-pipeline.ts` - 콘텐츠 파이프라인 테스트

---

## 카테고리별 분류

### 1. RSS 수집 테스트 (8개)

```
✅ test-rss-collection.ts       (사용 중)
⚠️ test-alternative-rss.ts      (대체 RSS 피드 찾기)
⚠️ test-new-rss-feeds.ts        (새 RSS 피드 테스트)
⚠️ test-rss-images.ts           (RSS 이미지 테스트)
⚠️ test-rss-only.ts             (RSS 전용 테스트)
⚠️ test-rss-simple.ts           (간단한 RSS 테스트)
⚠️ test-more-alternatives.ts    (더 많은 대체 피드)
⚠️ test-beauty-sources.ts       (뷰티 카테고리 RSS)
⚠️ test-three-categories.ts     (3개 카테고리 테스트)
```

**권장 사항**:
- ✅ `test-rss-collection.ts` - **유지** (실제 사용)
- 🗑️ 나머지 7개 - **삭제 가능** (개발/테스트 용도, 프로덕션에 불필요)

---

### 2. AI/Claude 모델 테스트 (8개)

```
⚠️ test-ai-rewrite.ts           (AI 리라이팅 테스트)
⚠️ test-anthropic-direct.ts     (Anthropic API 직접 호출)
⚠️ test-category-inference.ts   (카테고리 추론 테스트)
⚠️ test-claude-category.ts      (Claude 카테고리 분류)
⚠️ test-keyword-extraction.ts   (키워드 추출 테스트)
⚠️ test-latest-model.ts         (최신 모델 테스트)
⚠️ test-model-versions.ts       (모델 버전 비교)
⚠️ test-new-models.ts           (새 모델 테스트)
```

**권장 사항**:
- 🗑️ **모두 삭제 가능**
- 이유: AI 기능은 이미 Edge Function으로 통합 완료
- `categoryInference.ts`, `aiRewriteService.ts` 등 실제 서비스 파일 사용 중

---

### 3. 시스템 테스트 (6개)

```
✅ test-pipeline.ts              (사용 중)
⚠️ test-api-key.ts              (API 키 테스트)
⚠️ test-fallback-system.ts      (폴백 시스템)
⚠️ test-auto-fallback.ts        (자동 폴백)
⚠️ test-recovery-system.ts      (복구 시스템)
⚠️ test-subcategories.ts        (서브카테고리 테스트)
```

**권장 사항**:
- ✅ `test-pipeline.ts` - **유지** (실제 사용)
- 🤔 `test-recovery-system.ts` - **보류** (복구 시스템 사용 시 유지)
- 🗑️ 나머지 4개 - **삭제 가능**

---

## 수정 이력 분석

### 최근 수정 (2주 이내)
```
Dec 22: test-api-key.ts, test-claude-category.ts
Dec 21: test-category-inference.ts, test-auto-fallback.ts
Dec 20: test-recovery-system.ts, test-subcategories.ts,
        test-fallback-system.ts, test-beauty-sources.ts,
        test-more-alternatives.ts, test-alternative-rss.ts,
        test-new-rss-feeds.ts
```

→ 최근까지 개발/디버깅 용도로 사용되었지만, **프로덕션에서는 불필요**

### 오래된 파일 (60일 이상)
→ **없음** (모든 파일이 최근 수정됨)

---

## 삭제 권장 파일 (20개)

### 즉시 삭제 가능 (프로덕션에 불필요)

#### RSS 테스트 (7개)
```bash
rm scripts/test-alternative-rss.ts
rm scripts/test-new-rss-feeds.ts
rm scripts/test-rss-images.ts
rm scripts/test-rss-only.ts
rm scripts/test-rss-simple.ts
rm scripts/test-more-alternatives.ts
rm scripts/test-beauty-sources.ts
rm scripts/test-three-categories.ts
```

#### AI/모델 테스트 (8개)
```bash
rm scripts/test-ai-rewrite.ts
rm scripts/test-anthropic-direct.ts
rm scripts/test-category-inference.ts
rm scripts/test-claude-category.ts
rm scripts/test-keyword-extraction.ts
rm scripts/test-latest-model.ts
rm scripts/test-model-versions.ts
rm scripts/test-new-models.ts
```

#### 시스템 테스트 (4개)
```bash
rm scripts/test-api-key.ts
rm scripts/test-fallback-system.ts
rm scripts/test-auto-fallback.ts
rm scripts/test-subcategories.ts
```

#### 복구 시스템 (보류 - 필요시 유지)
```bash
# 복구 기능을 사용한다면 유지, 아니면 삭제
# rm scripts/test-recovery-system.ts
```

---

## 유지 권장 파일 (2-3개)

### 필수 유지
```bash
✅ scripts/test-rss-collection.ts  (npm run collect:test)
✅ scripts/test-pipeline.ts        (npm run test:pipeline)
```

### 선택 유지
```bash
🤔 scripts/test-recovery-system.ts  (복구 시스템 사용 시)
```

---

## 일괄 삭제 스크립트

### 안전한 삭제 (백업 후)

```bash
# 1. 백업 생성
mkdir -p ~/Desktop/320mag-test-scripts-backup
cp scripts/test-*.ts ~/Desktop/320mag-test-scripts-backup/

# 2. 사용 중인 파일 제외하고 삭제
cd /Users/brandactivist/Desktop/320mag/scripts

# RSS 테스트 삭제
rm test-alternative-rss.ts test-new-rss-feeds.ts test-rss-images.ts \
   test-rss-only.ts test-rss-simple.ts test-more-alternatives.ts \
   test-beauty-sources.ts test-three-categories.ts

# AI/모델 테스트 삭제
rm test-ai-rewrite.ts test-anthropic-direct.ts test-category-inference.ts \
   test-claude-category.ts test-keyword-extraction.ts test-latest-model.ts \
   test-model-versions.ts test-new-models.ts

# 시스템 테스트 삭제
rm test-api-key.ts test-fallback-system.ts test-auto-fallback.ts \
   test-subcategories.ts

# 복구 시스템 (선택사항)
# rm test-recovery-system.ts
```

---

## 정리 효과

### Before
- 23개 테스트 스크립트
- 혼재된 개발/테스트 파일
- 불명확한 용도

### After (삭제 시)
- 2-3개 필수 스크립트만 유지
- 명확한 용도
- 깔끔한 프로젝트 구조

### 디스크 공간 절약
- 약 **70KB+** 절약
- 20개 파일 제거

---

## 권장 사항

### 1단계: 백업
```bash
mkdir -p ~/Desktop/320mag-scripts-backup
cp scripts/test-*.ts ~/Desktop/320mag-scripts-backup/
```

### 2단계: 검토
- `test-recovery-system.ts`가 실제로 사용되는지 확인
- 나머지는 개발/디버깅 용도로만 사용됨

### 3단계: 삭제
- 위의 일괄 삭제 스크립트 실행

### 4단계: 정리 후 확인
```bash
ls scripts/test-*.ts
# 결과: test-rss-collection.ts, test-pipeline.ts (+ test-recovery-system.ts 선택)
```

---

## 주의사항

⚠️ **백업 먼저!**
- 삭제 전 반드시 백업 생성
- 나중에 참고가 필요할 수 있음

✅ **package.json 확인**
- 삭제 후 `npm run collect:test`, `npm run test:pipeline` 정상 동작 확인

🔍 **Git 히스토리**
- Git에 커밋되어 있으면 언제든 복구 가능
- `git log -- scripts/test-xxx.ts`로 히스토리 확인 가능

---

## 결론

**20개의 테스트 스크립트는 개발/디버깅 용도**로만 사용되었고, **프로덕션에서는 불필요**합니다.

안전하게 백업 후 삭제하면:
- ✅ 프로젝트 구조 간소화
- ✅ 유지보수 부담 감소
- ✅ 명확한 스크립트 용도

필수 스크립트 2개(`test-rss-collection.ts`, `test-pipeline.ts`)만 유지하면 충분합니다.

---

## 삭제 완료 ✅

**날짜**: 2025-12-22

### 백업 생성
```bash
✅ ~/Desktop/320mag-test-scripts-backup/ (23개 파일 백업 완료)
```

### 삭제된 파일 (20개)

#### RSS 테스트 (8개)
```
✅ test-alternative-rss.ts
✅ test-new-rss-feeds.ts
✅ test-rss-images.ts
✅ test-rss-only.ts
✅ test-rss-simple.ts
✅ test-more-alternatives.ts
✅ test-beauty-sources.ts
✅ test-three-categories.ts
```

#### AI/모델 테스트 (8개)
```
✅ test-ai-rewrite.ts
✅ test-anthropic-direct.ts
✅ test-category-inference.ts
✅ test-claude-category.ts
✅ test-keyword-extraction.ts
✅ test-latest-model.ts
✅ test-model-versions.ts
✅ test-new-models.ts
```

#### 시스템 테스트 (4개)
```
✅ test-api-key.ts
✅ test-fallback-system.ts
✅ test-auto-fallback.ts
✅ test-subcategories.ts
```

### 유지된 파일 (3개)

```bash
✅ test-rss-collection.ts   (npm run collect:test)
✅ test-pipeline.ts          (npm run test:pipeline)
🤔 test-recovery-system.ts   (복구 시스템 테스트)
```

### 정리 효과

**Before**: 23개 테스트 스크립트
**After**: 3개 핵심 스크립트만 유지

- ✅ 프로젝트 구조 간소화
- ✅ 20개 불필요한 파일 제거
- ✅ package.json 스크립트 정상 작동 유지
- ✅ 자동 에디팅 시스템 영향 없음 (프로덕션 코드와 완전 독립)
