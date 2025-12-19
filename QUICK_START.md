# 써드트웬티 빠른 시작 가이드

## 현재 상태
✅ 개발 서버 실행 중: http://localhost:8086/
✅ 프로젝트 코드 완성
✅ AI 시스템 구조 완성

## 다음 3단계만 하면 완료!

### 1단계: Supabase 마이그레이션 실행 (5분)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `qitdjfckazpkqhhlacyx`
3. 왼쪽 메뉴 → **SQL Editor** 클릭
4. **New query** 버튼 클릭
5. 아래 파일 내용을 복사해서 붙여넣기:
   ```
   supabase/migrations/20250923000000_ai_editor_system.sql
   ```
6. **RUN** 버튼 클릭
7. 성공 메시지 확인

**중요:** 에러가 나면 기존 테이블과 충돌일 수 있습니다. 각 CREATE TABLE 문 앞에 `DROP TABLE IF EXISTS` 추가하거나, 새 프로젝트에서 실행하세요.

### 2단계: Storage 버킷 생성 (2분)

1. Supabase Dashboard → 왼쪽 메뉴 → **Storage**
2. **Create a new bucket** 클릭
3. 버킷 이름: `voice-challenges`
4. **Public bucket** 체크 (음성 파일 공개 접근)
5. **Create bucket** 클릭

### 3단계: 11명 AI 에디터 데이터 초기화 (3분)

1. Supabase Dashboard → **SQL Editor**
2. **New query** 클릭
3. [scripts/init-ai-editors.sql](scripts/init-ai-editors.sql) 파일 내용을 복사해서 실행

**11명의 AI 에디터:**
- **소피아** (62세, 패션) - 전 보그 수석 에디터
- **제인** (55세, 뷰티) - 피부과 전문의 출신 웰니스 전문가
- **마틴** (65세, 컬처) - BBC 출신 문화평론가
- **클라라** (58세, 라이프스타일) - 미식가이자 여행작가
- **헨리** (62세, 시니어시장) - 실버산업 컨설턴트
- **데이비드** (67세, 금융) - 월스트리트 은퇴 펀드매니저
- **나오미** (59세, 글로벌트렌드) - 전 UN 정책분석가
- **앙투안** (64세, 푸드) - 미슐랭 3스타 레스토랑 전 셰프
- **에밀리** (61세, 하우징) - 인테리어 디자이너 출신 건축가
- **닥터 리** (68세, 의료) - 가정의학과 전문의
- **닥터 사라** (60세, 섹슈얼리티) - 성의학 전문의 겸 관계 심리학자 **[프리미엄]**

---

## 확인 방법

### 마이그레이션 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_editors', 'challenges', 'user_profiles', 'push_settings');
```

4개 테이블이 보이면 성공!

### 에디터 확인
```sql
SELECT editor_id, name, category, is_premium FROM public.ai_editors;
```

11명이 보이면 성공! (닥터 사라는 is_premium = true)

---

## API 키 설정 (필수!)

`.env` 파일에 실제 API 키 입력:

```bash
# OpenAI (필수)
VITE_OPENAI_API_KEY="sk-proj-실제키입력"

# Firebase (선택 - 푸시 알림용)
VITE_FIREBASE_API_KEY="실제키입력"
VITE_FIREBASE_PROJECT_ID="프로젝트ID"
# ... 나머지 Firebase 설정
```

**OpenAI API 키 발급:**
1. https://platform.openai.com/api-keys
2. Create new secret key
3. 복사해서 .env에 붙여넣기

---

## 테스트

### 1. AI 콘텐츠 생성 테스트

브라우저 콘솔에서:
```javascript
const { rewriteContent } = await import('./src/lib/openai.ts');

const result = await rewriteContent({
  originalContent: '파리 패션위크에서 시니어 모델들이 주목받고 있다.',
  editorPromptTemplate: '소피아의 관점에서 리라이팅',
  title: '테스트 제목'
});

console.log(result);
```

### 2. 음성 녹음 테스트

1. 개발 서버 접속: http://localhost:8086/
2. 아티클 상세 페이지
3. 챌린지 참여 → 음성 녹음
4. 녹음 → 중지 → 텍스트 변환
5. 제출

---

## 다음 단계

1. ✅ **마이그레이션** (위 1-3단계)
2. **콘텐츠 소스 설정** - RSS 피드 추가
3. **자동 수집 테스트** - 1개 카테고리로 시작
4. **푸시 알림 테스트** - Firebase 설정
5. **UI 개선** - 에디터 프로필 페이지 등

---

## 문제 해결

### 마이그레이션 에러
- **Error: relation already exists**
  → 기존 테이블과 충돌. DROP TABLE 문 추가하거나 테이블명 변경

### OpenAI API 에러
- **401 Unauthorized**
  → API 키 확인. `sk-proj-`로 시작해야 함

- **429 Rate Limit**
  → 요청이 너무 많음. 잠시 대기 후 재시도

### 개발 서버 에러
```bash
# 서버 재시작
npm run dev
```

---

**완료되면 알려주세요! 다음 단계로 넘어갑니다.**
