# Creators와 Editors 테이블 분리 마이그레이션 가이드

## 개요

`creators` 테이블에 AI 에디터와 실제 크리에이터가 혼재되어 있어, 이를 분리하여 관리합니다.

**변경 사항:**
- ✅ **`editors` 테이블**: 기사를 작성하는 에디터 (AI 가상 에디터 포함)
- ✅ **`creators` 테이블**: 크리에이터 페이지에 표시될 실제 크리에이터만
- ✅ **`articles.editor_id`**: 기사 작성자를 `editors` 테이블과 연결

---

## 📋 마이그레이션 단계

### 1단계: Editors 테이블 생성

Supabase Dashboard > SQL Editor에서 다음 SQL 실행:

**파일:** `scripts/create-editors-table.sql`

```sql
-- Editors 테이블 생성 및 RLS 정책 설정
```

### 2단계: AI 에디터 마이그레이션

Supabase Dashboard > SQL Editor에서 다음 SQL 실행:

**파일:** `scripts/migrate-editors.sql`

이 SQL은 다음 12명의 AI 에디터를 `creators`에서 `editors`로 복사합니다:
1. Sophia (패션 디렉터 & 스타일리스트)
2. Jane (뷰티 크리에이터 & 피부과 전문의)
3. Martin (문화 평론가 & 큐레이터)
4. Clara (여행 작가 & 사진가)
5. Henry (시니어 라이프 컨설턴트)
6. Marcus (글로벌 트렌드 애널리스트)
7. Antoine (셰프 & 푸드 라이터)
8. Thomas (인테리어 디자이너 & 건축가)
9. Sarah (성심리학자 & 관계 전문가)
10. Rebecca (심리학자 & 라이프 코치)
11. Mark (스포츠 의학 전문의 & 피트니스 코치)
12. Elizabeth (편집장)

### 3단계: Articles 테이블에 editor_id 추가

Supabase Dashboard > SQL Editor에서 다음 SQL 실행:

**파일:** `scripts/add-editor-id-to-articles.sql`

이 SQL은:
- `articles` 테이블에 `editor_id` 컬럼 추가
- AI 에디터가 작성한 기사의 `editor_id` 자동 설정
- Foreign Key 제약 조건 추가

---

## 🎯 완료 후 확인 사항

### Supabase Dashboard에서 확인:

1. **Editors 테이블 생성 확인**
   ```sql
   SELECT COUNT(*) FROM public.editors;
   -- 예상 결과: 12명
   ```

2. **Articles의 editor_id 설정 확인**
   ```sql
   SELECT COUNT(*) FROM public.articles WHERE editor_id IS NOT NULL;
   -- AI 에디터가 작성한 기사 수
   ```

3. **Creators 테이블 확인**
   ```sql
   SELECT * FROM public.creators WHERE status = 'active';
   -- AI 에디터 12명이 아직 남아있음 (나중에 삭제)
   ```

---

## ⚠️ 주의사항

1. **SQL 실행 순서를 반드시 지켜주세요:**
   1. create-editors-table.sql
   2. migrate-editors.sql
   3. add-editor-id-to-articles.sql

2. **데이터 백업**
   - 마이그레이션 전에 Supabase Dashboard에서 백업 생성 권장

3. **Rollback 방법**
   ```sql
   -- editors 테이블 삭제
   DROP TABLE IF EXISTS public.editors CASCADE;

   -- articles.editor_id 컬럼 제거
   ALTER TABLE public.articles DROP COLUMN IF EXISTS editor_id;
   ```

---

## 📝 다음 단계

SQL 마이그레이션 완료 후:

1. 코드에서 `editors` 테이블 사용하도록 수정
2. `creators` 테이블에서 AI 에디터 제거
3. 테스트 및 검증

---

## 💡 도움말

문제가 발생하면:
1. Supabase Dashboard > Logs 확인
2. SQL 실행 순서 재확인
3. 각 단계별 SQL 파일 내용 확인
