# 🚧 완성까지 남은 작업 (MVP 이후)

## 현재 완성도: **70%**

---

## 🔴 필수 작업 (프로덕션 필수)

### 1. Firebase 설정 및 Push 알림 시스템
**상태**: 🔲 미완성
**우선순위**: ⭐⭐⭐⭐⭐

**작업 내용:**
- [ ] Firebase 프로젝트 생성 및 설정
- [ ] FCM (Firebase Cloud Messaging) 설정
- [ ] Service Worker 구현
- [ ] 푸시 알림 권한 요청 UI
- [ ] 알림 전송 API (Supabase Edge Functions)
- [ ] 알림 타입 정의:
  - 새 기사 발행
  - 이벤트 등록 확인
  - 챌린지 참여 알림
  - 관리자 공지

**파일:**
```
public/firebase-messaging-sw.js
src/services/firebaseService.ts
src/contexts/NotificationContext.tsx
supabase/functions/send-notification/index.ts
```

**예상 시간**: 4-6시간

---

### 2. 음성 녹음 기능 (챌린지)
**상태**: 🔲 미완성
**우선순위**: ⭐⭐⭐⭐

**작업 내용:**
- [ ] Web Audio API 또는 MediaRecorder API 사용
- [ ] 녹음 UI/UX 구현 (시작/정지/재생)
- [ ] 오디오 파일 Supabase Storage 업로드
- [ ] 음성 → 텍스트 변환 (Whisper API - 선택)
- [ ] 챌린지 참여 내역 저장
- [ ] 참여자 목록 표시

**파일:**
```
src/components/VoiceRecorder.tsx
src/services/audioService.ts
supabase/migrations/004_create_challenges.sql
```

**예상 시간**: 6-8시간

---

### 3. 이벤트 등록/참가 시스템 완성
**상태**: ⏸️ 테이블만 있음
**우선순위**: ⭐⭐⭐⭐

**작업 내용:**
- [ ] EventsPage UI 완성 (현재 더미 데이터)
- [ ] 이벤트 상세 페이지
- [ ] 등록 폼 및 결제 연동 (선택)
- [ ] 참가 확인 이메일
- [ ] 관리자 참가자 관리
- [ ] QR 코드 생성 (출석 체크용)

**파일:**
```
src/pages/EventsPage.tsx (완전 재작성 필요)
src/pages/EventDetailPage.tsx (신규)
src/components/EventRegistrationForm.tsx (신규)
```

**예상 시간**: 8-10시간

---

### 4. 이메일 알림 시스템
**상태**: 🔲 미완성
**우선순위**: ⭐⭐⭐

**작업 내용:**
- [ ] Supabase Auth Hooks 설정
- [ ] 이메일 템플릿 디자인
- [ ] 알림 타입:
  - 회원가입 환영 이메일
  - 새 기사 알림 (주간 다이제스트)
  - 이벤트 등록 확인
  - 비밀번호 재설정
- [ ] 이메일 수신 설정 (프로필에서 on/off)

**파일:**
```
supabase/functions/send-email/index.ts
src/pages/EmailPreferencesPage.tsx
```

**예상 시간**: 4-6시간

---

## 🟡 중요 작업 (UX 개선)

### 5. 미디어 라이브러리 및 이미지 업로드
**상태**: 🔲 미완성
**우선순위**: ⭐⭐⭐

**작업 내용:**
- [ ] Supabase Storage 설정
- [ ] 이미지 업로드 UI
- [ ] 이미지 크롭/리사이즈
- [ ] CDN 연동 (Cloudinary 또는 ImgIX)
- [ ] Admin에서 미디어 관리

**파일:**
```
src/pages/AdminPage.tsx (Media 탭 구현)
src/components/ImageUploader.tsx
src/services/storageService.ts
```

**예상 시간**: 6-8시간

---

### 6. 기사 에디터 (WYSIWYG)
**상태**: 🔲 미완성
**우선순위**: ⭐⭐⭐

**작업 내용:**
- [ ] TipTap 또는 Slate.js 에디터 통합
- [ ] 마크다운 지원
- [ ] 이미지 삽입
- [ ] 임시저장 기능
- [ ] 미리보기

**파일:**
```
src/components/ArticleEditor.tsx (현재 더미)
src/hooks/useEditor.ts
```

**예상 시간**: 8-10시간

---

### 7. 검색 기능 개선
**상태**: ⏸️ 기본만 구현
**우선순위**: ⭐⭐⭐

**작업 내용:**
- [ ] Supabase Full-Text Search 설정
- [ ] 검색 필터 (카테고리, 날짜, 작성자)
- [ ] 검색 결과 하이라이팅
- [ ] 최근 검색어 저장
- [ ] 인기 검색어

**파일:**
```
src/pages/SearchResultsPage.tsx (개선)
src/services/searchService.ts
```

**예상 시간**: 4-6시간

---

### 8. 사용자 마이페이지
**상태**: 🔲 미완성 (버튼만 있음)
**우선순위**: ⭐⭐⭐

**작업 내용:**
- [ ] 프로필 편집
- [ ] 비밀번호 변경
- [ ] 읽은 기사 히스토리
- [ ] 북마크한 기사
- [ ] 참여한 이벤트
- [ ] 챌린지 기록

**파일:**
```
src/pages/MyPage.tsx (신규)
src/components/ProfileEditor.tsx (신규)
```

**예상 시간**: 6-8시간

---

## 🟢 선택 작업 (고도화)

### 9. 댓글 시스템
**상태**: 🔲 미완성
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] 댓글 테이블 생성
- [ ] 댓글 작성/수정/삭제
- [ ] 대댓글 (nested comments)
- [ ] 좋아요/싫어요
- [ ] 신고 기능

**예상 시간**: 6-8시간

---

### 10. 소셜 로그인
**상태**: 🔲 미완성
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] Google OAuth
- [ ] Kakao OAuth
- [ ] Naver OAuth
- [ ] 소셜 계정 연동

**예상 시간**: 4-6시간

---

### 11. PWA 기능
**상태**: 🔲 미완성
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] manifest.json 작성
- [ ] Service Worker (오프라인 지원)
- [ ] 앱 설치 프롬프트
- [ ] 푸시 알림 (Firebase 연동)

**파일:**
```
public/manifest.json
public/sw.js
```

**예상 시간**: 4-6시간

---

### 12. Analytics 및 모니터링
**상태**: 🔲 미완성
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] Google Analytics 4 연동
- [ ] 사용자 행동 추적
- [ ] Sentry 오류 모니터링
- [ ] Admin 대시보드에 Analytics 표시

**예상 시간**: 3-4시간

---

### 13. SEO 최적화
**상태**: 🔲 미완성
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] React Helmet 또는 Next.js 마이그레이션
- [ ] OG 메타 태그 동적 생성
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] 구조화된 데이터 (JSON-LD)

**예상 시간**: 4-6시간

---

### 14. 성능 최적화
**상태**: ⏸️ 기본만 구현
**우선순위**: ⭐⭐

**작업 내용:**
- [ ] 코드 스플리팅 (React.lazy)
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] React Query 캐싱 전략
- [ ] Lighthouse 점수 90+ 달성
- [ ] Database 인덱스 최적화

**예상 시간**: 4-6시간

---

### 15. 다국어 지원 (i18n)
**상태**: 🔲 미완성
**우선순위**: ⭐

**작업 내용:**
- [ ] react-i18next 설정
- [ ] 한국어/영어 번역
- [ ] 언어 전환 UI

**예상 시간**: 6-8시간

---

## 📊 작업량 요약

### 필수 작업 (4개)
- Firebase Push 알림: 4-6시간
- 음성 녹음: 6-8시간
- 이벤트 시스템: 8-10시간
- 이메일 알림: 4-6시간

**소계**: 22-30시간 (약 3-4일)

### 중요 작업 (4개)
- 미디어 라이브러리: 6-8시간
- 기사 에디터: 8-10시간
- 검색 개선: 4-6시간
- 마이페이지: 6-8시간

**소계**: 24-32시간 (약 3-4일)

### 선택 작업 (7개)
- 댓글: 6-8시간
- 소셜 로그인: 4-6시간
- PWA: 4-6시간
- Analytics: 3-4시간
- SEO: 4-6시간
- 성능 최적화: 4-6시간
- 다국어: 6-8시간

**소계**: 31-44시간 (약 4-6일)

---

## 🎯 추천 작업 순서

### Phase 1: 사용자 참여 기능 (1주)
1. ✅ 음성 녹음 챌린지
2. ✅ 이벤트 등록 완성
3. ✅ Firebase Push 알림

### Phase 2: 관리 및 UX (1주)
4. ✅ 기사 에디터
5. ✅ 미디어 라이브러리
6. ✅ 마이페이지
7. ✅ 이메일 알림

### Phase 3: 고도화 (1주)
8. ✅ 검색 개선
9. ✅ 댓글 시스템
10. ✅ Analytics
11. ✅ SEO 최적화

### Phase 4: 선택 사항 (필요 시)
12. 소셜 로그인
13. PWA
14. 다국어
15. 성능 최적화

---

## 💰 예상 총 작업 시간

- **최소 (필수만)**: 22-30시간 (3-4일)
- **권장 (필수+중요)**: 46-62시간 (6-8일)
- **완전 (모두 포함)**: 77-106시간 (10-14일)

---

## 🚀 빠른 시작 가이드

**지금 당장 시작하고 싶다면:**

### 1일차: Firebase + Push
```bash
# Firebase 프로젝트 생성
# service worker 작성
# 알림 테스트
```

### 2일차: 음성 녹음
```bash
# MediaRecorder API 구현
# Supabase Storage 연동
# UI 테스트
```

### 3일차: 이벤트 완성
```bash
# EventsPage DB 연동
# 등록 폼 작성
# 참가자 관리
```

### 4일차: 에디터 + 미디어
```bash
# TipTap 에디터 통합
# 이미지 업로드
# 미리보기
```

---

## 📋 체크리스트

### 필수 (프로덕션 출시 전 필수)
- [ ] Firebase Push 알림
- [ ] 음성 녹음 챌린지
- [ ] 이벤트 등록 완성
- [ ] 이메일 알림

### 권장 (더 나은 UX)
- [ ] 기사 에디터
- [ ] 미디어 라이브러리
- [ ] 마이페이지
- [ ] 검색 개선

### 선택 (시간 있을 때)
- [ ] 댓글
- [ ] 소셜 로그인
- [ ] PWA
- [ ] Analytics
- [ ] SEO
- [ ] 성능 최적화
- [ ] 다국어

---

## 🎉 완성 기준

**100% 완성 = MVP + 필수 + 중요 작업 완료**

현재 **70%** → 필수(4개) + 중요(4개) 완료 시 **100%**

---

**어떤 작업부터 시작하시겠습니까?**

추천 순서:
1. 🔥 Firebase Push 알림 (가장 중요)
2. 🎤 음성 녹음 챌린지
3. 📅 이벤트 등록 완성
4. ✉️ 이메일 알림
