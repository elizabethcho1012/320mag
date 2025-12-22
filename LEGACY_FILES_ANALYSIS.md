# 레거시 파일 분석 보고서

프로젝트에서 사용되지 않거나 최소한으로만 사용되는 레거시 파일들을 분석했습니다.

## 1. OpenAI 직접 호출 (레거시)

### 파일: `src/lib/openai.ts`
**상태**: ⚠️ 부분적으로 사용 중 (대부분 Anthropic Edge Function으로 대체됨)

**사용 위치**:
- `src/hooks/useVoiceRecorder.ts` - 음성 텍스트 변환 (`transcribeAudio`)
- `src/services/contentCollector.ts` - 콘텐츠 리라이팅

**현재 상황**:
- GPT-4를 직접 호출하는 레거시 방식
- 대부분의 AI 기능은 Anthropic Claude Edge Function으로 이전됨
- 음성 텍스트 변환은 아직 OpenAI Whisper 사용 중

**권장 사항**:
- ✅ **유지**: 음성 변환 기능이 실제 사용 중이라면 유지
- ⚠️ **검토 필요**: `contentCollector.ts`의 리라이팅 기능이 실제로 사용되는지 확인
- 🔄 **장기 계획**: Anthropic으로 완전히 통합 고려

---

## 2. Firebase 관련 파일

### 파일들:
- `src/lib/firebase.ts`
- `src/services/firebaseService.ts`

**상태**: ⚠️ 제한적 사용 (Notification만)

**사용 위치**:
- `src/contexts/NotificationContext.tsx` - 푸시 알림용

**현재 상황**:
- Firebase는 오직 **푸시 알림** 용도로만 사용 중
- 인증, 데이터베이스 등은 모두 Supabase로 이전 완료
- NotificationContext는 App.tsx에서 Provider로 등록되어 있음

**권장 사항**:
- ✅ **유지**: 푸시 알림 기능이 필요하다면 유지
- ❌ **삭제 고려**: 푸시 알림을 사용하지 않는다면 완전 제거 가능
  - Firebase 설정 파일
  - firebaseService.ts
  - NotificationContext.tsx

---

## 3. Email Service

### 파일: `src/services/emailService.ts`

**상태**: ⚠️ 최소 사용

**사용 횟수**: 4회 참조

**권장 사항**:
- 🔍 **검토 필요**: 실제로 이메일 발송 기능이 사용되는지 확인
- ⚠️ **Supabase Edge Function 전환 고려**: 이메일은 Supabase Edge Function으로 처리 권장

---

## 4. Audio Service

### 파일: `src/services/audioService.ts`

**상태**: ⚠️ 최소 사용

**사용 횟수**: 1회 참조

**권장 사항**:
- 🔍 **검토 필요**: 음성 녹음/재생 기능이 실제로 사용되는지 확인
- ❌ **미사용 시 삭제**: 사용하지 않는다면 제거

---

## 5. Push Notification Service

### 파일: `src/services/pushNotificationService.ts`

**상태**: ❌ **미사용**

**사용 횟수**: 0회

**권장 사항**:
- ❌ **삭제 가능**: 어디서도 참조되지 않음

---

## 6. RSS 관련 서비스 (활성 사용 중)

### 파일들:
- `src/lib/rss-fetcher.ts`
- `src/services/rssFallbackService.ts`
- `src/services/rssHealthMonitor.ts`
- `src/services/recoveryService.ts`

**상태**: ✅ **활성 사용 중**

**권장 사항**:
- ✅ **유지**: RSS 콘텐츠 수집 시스템의 핵심 파일들

---

## 7. 콘텐츠 파이프라인 (활성 사용 중)

### 파일들:
- `src/services/contentPipeline.ts`
- `src/services/contentCollector.ts`
- `src/services/categoryInference.ts`
- `src/services/contentGuidelines.ts`
- `src/services/aiRewriteService.ts`
- `src/services/editorContentReview.ts`

**상태**: ✅ **활성 사용 중**

**권장 사항**:
- ✅ **유지**: 콘텐츠 수집 및 처리의 핵심 파일들
- ✅ **최신화됨**: Anthropic Claude와 통합되어 있음

---

## 8. 이미지 서비스

### 파일: `src/services/imageService.ts`

**상태**: ✅ **활성 사용 중 (예상)**

**권장 사항**:
- ✅ **유지**: 이미지 처리 및 업로드 기능

---

## 삭제 가능한 파일 목록

### 즉시 삭제 가능:
```bash
# 완전히 사용되지 않는 파일
src/services/pushNotificationService.ts
```

### 검토 후 삭제 고려:

#### Firebase 관련 (푸시 알림 사용 안 할 경우):
```bash
src/lib/firebase.ts
src/services/firebaseService.ts
src/contexts/NotificationContext.tsx
# + App.tsx에서 NotificationProvider 제거 필요
```

#### Audio 관련 (음성 기능 사용 안 할 경우):
```bash
src/services/audioService.ts
src/hooks/useVoiceRecorder.ts  # 이것도 함께 확인
```

#### Email 관련 (이메일 발송 안 할 경우):
```bash
src/services/emailService.ts
```

---

## 마이그레이션 체크리스트

### OpenAI → Anthropic 전환

현재 상태:
- ✅ 카테고리 추론 (categoryInference.ts) - Anthropic으로 전환 완료
- ✅ 콘텐츠 리라이팅 (aiRewriteService.ts) - Anthropic으로 전환 완료
- ⚠️ 음성 텍스트 변환 - 아직 OpenAI Whisper 사용
- ⚠️ 이미지 생성 - `openai.ts`에 함수 있지만 사용 여부 불명

### Firebase → Supabase 전환

완료된 항목:
- ✅ 인증 (Auth) - Supabase Auth로 완전 전환
- ✅ 데이터베이스 - Supabase PostgreSQL 사용
- ✅ 파일 스토리지 - Supabase Storage 사용

남은 항목:
- ⚠️ 푸시 알림 - Firebase Cloud Messaging 사용 중
  - 대안: Supabase + OneSignal / Firebase 계속 사용 / 완전 제거

---

## 권장 정리 단계

### 1단계: 즉시 정리 (안전)
```bash
# 완전히 사용되지 않는 파일 삭제
rm src/services/pushNotificationService.ts
```

### 2단계: 기능 확인 후 정리
각 기능의 실제 사용 여부 확인:
- [ ] 푸시 알림 기능이 필요한가?
- [ ] 음성 녹음/텍스트 변환 기능이 필요한가?
- [ ] 이메일 발송 기능이 필요한가?

### 3단계: 조건부 정리
사용하지 않는 기능의 파일들 제거

### 4단계: 문서화
제거한 기능들을 문서에 기록

---

## 의존성 패키지 정리

레거시 파일 제거 후 불필요한 npm 패키지도 정리:

### Firebase 제거 시:
```bash
npm uninstall firebase
```

### OpenAI 제거 시 (완전 전환 후):
```bash
npm uninstall openai
```

---

## 결론

**즉시 조치 가능**:
- `pushNotificationService.ts` 삭제 (미사용)

**검토 필요**:
- Firebase 푸시 알림 사용 여부 확인
- 음성 기능 사용 여부 확인
- 이메일 발송 기능 사용 여부 확인

**유지 필요**:
- RSS 관련 서비스 전체
- 콘텐츠 파이프라인 전체
- 이미지 서비스
