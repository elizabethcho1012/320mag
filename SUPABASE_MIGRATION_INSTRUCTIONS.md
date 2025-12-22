# Supabase 마이그레이션 실행 가이드

광고 시스템을 활성화하고 관리자 권한을 부여하려면 다음 SQL 파일들을 Supabase 대시보드에서 실행해야 합니다.

## 실행 방법

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 아래 순서대로 SQL 파일 내용을 복사하여 실행

## 실행 순서

### 1단계: 광고 시스템 테이블 생성
파일: `supabase/migrations/009_advertisement_system.sql`

이 마이그레이션을 실행하면:
- `advertisements` 테이블이 생성됩니다
- 광고 조회/관리를 위한 RLS 정책이 설정됩니다
- 관리자만 광고를 업로드/수정/삭제할 수 있습니다

### 2단계: 관리자 권한 부여
파일: `supabase/migrations/010_set_admin_email.sql`

이 마이그레이션을 실행하면:
- `3rdtwenty@gmail.com` 계정이 관리자(`admin`) 권한을 받습니다

## 확인 방법

마이그레이션 실행 후 다음 쿼리로 확인:

```sql
-- 광고 테이블 확인
SELECT * FROM advertisements;

-- 관리자 권한 확인
SELECT id, email, role, username FROM profiles WHERE email = '3rdtwenty@gmail.com';
```

## 문제 해결

### 404 에러가 계속 나는 경우
- 1단계 마이그레이션(009_advertisement_system.sql)이 실행되지 않은 것입니다
- SQL Editor에서 해당 파일 내용을 복사하여 실행하세요

### 관리자 페이지 접근이 안 되는 경우
- 2단계 마이그레이션(010_set_admin_email.sql)이 실행되지 않았거나
- 로그아웃 후 다시 로그인해보세요
