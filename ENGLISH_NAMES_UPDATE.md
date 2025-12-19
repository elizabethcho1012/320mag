# 에디터 이름 영문 전환 완료

## ✅ 완료된 작업

### 1. 코드 파일 업데이트
모든 AI 에디터 이름이 영문으로 변경되었습니다:

**[src/data/editors.ts](src/data/editors.ts)**
- 소피아 → **Sophia**
- 제인 → **Jane**
- 마틴 → **Martin**
- 클라라 → **Clara**
- 헨리 → **Henry**
- 마커스 → **Marcus**
- 앙투안 → **Antoine**
- 토마스 → **Thomas**
- 닥터 사라 → **Sarah**
- 레베카 → **Rebecca**
- 마크 → **Mark**
- 엘리자베스 → **Elizabeth**

### 2. 데이터베이스 Seed 파일 업데이트
**[scripts/seed-data.sql](scripts/seed-data.sql)**
- 모든 크리에이터 이름이 영문으로 변경됨
- 새로 실행 시 영문 이름으로 생성됨

### 3. 업데이트 스크립트 생성
다음 파일들이 생성되었습니다:
- `scripts/update-creator-names.ts` - Node.js를 통한 자동 업데이트 스크립트
- `scripts/update-creator-names.sql` - SQL 직접 실행용
- `scripts/enable-creator-updates.sql` - RLS 권한 설정
- `scripts/verify-names.ts` - 업데이트 확인 스크립트

## 🔧 필요한 작업 (Supabase에서 실행)

데이터베이스의 기존 크리에이터 이름을 영문으로 업데이트하려면:

### 방법 1: SQL Editor에서 직접 실행 (권장)

1. **Supabase Dashboard** → **SQL Editor** 이동

2. **먼저 UPDATE 권한 설정** - 다음 SQL 실행:
```sql
CREATE POLICY IF NOT EXISTS "Allow anonymous update creators"
ON creators
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
```

3. **이름 업데이트** - 다음 SQL 실행:
```sql
UPDATE creators SET name = 'Sophia' WHERE name = '소피아';
UPDATE creators SET name = 'Jane' WHERE name = '제인';
UPDATE creators SET name = 'Martin' WHERE name = '마틴';
UPDATE creators SET name = 'Clara' WHERE name = '클라라';
UPDATE creators SET name = 'Henry' WHERE name = '헨리';
UPDATE creators SET name = 'Marcus' WHERE name = '마커스';
UPDATE creators SET name = 'Antoine' WHERE name = '앙투안';
UPDATE creators SET name = 'Thomas' WHERE name = '토마스';
UPDATE creators SET name = 'Sarah' WHERE name = '닥터 사라';
UPDATE creators SET name = 'Rebecca' WHERE name = '레베카';
UPDATE creators SET name = 'Mark' WHERE name = '마크';
UPDATE creators SET name = 'Elizabeth' WHERE name = '엘리자베스';

SELECT name, profession FROM creators ORDER BY name;
```

### 방법 2: npm 스크립트 사용 (RLS 정책 설정 후)

```bash
npm run update:names
```

## 📊 확인 방법

업데이트 후 다음 명령어로 확인:

```bash
npm run check:articles
```

모든 크리에이터 이름이 영문으로 표시되어야 합니다.

## 🧪 테스트

새로운 아티클 수집 테스트:
```bash
npm run test:pipeline
```

생성된 아티클의 크리에이터 이름이 **영문**으로 표시되어야 합니다.

## 📝 변경 사항 요약

### 파일 변경
- ✅ `src/data/editors.ts` - 12개 에디터 이름 영문 전환
- ✅ `scripts/seed-data.sql` - Seed 데이터 영문 전환
- ✅ `package.json` - `update:names` 스크립트 추가

### 새로 생성된 파일
- `scripts/update-creator-names.ts`
- `scripts/update-creator-names.sql`
- `scripts/enable-creator-updates.sql`
- `scripts/verify-names.ts`
- `ENGLISH_NAMES_UPDATE.md` (이 파일)

### 데이터베이스 작업 필요
- ⚠️ Supabase에서 RLS 정책 추가 필요
- ⚠️ Supabase에서 기존 크리에이터 이름 업데이트 필요

## 🎯 다음 수집부터 적용

위 데이터베이스 작업을 완료하면:
1. 새로운 아티클 수집 시 **영문 이름**으로 크리에이터가 저장됨
2. 기존 아티클의 크리에이터도 **영문 이름**으로 표시됨
3. UI에서 모든 크리에이터가 **영문 이름**으로 표시됨

---

**마지막 업데이트**: 2025-11-25
