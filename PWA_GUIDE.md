# 320 Magazine PWA 가이드

## PWA란?

Progressive Web App (PWA)는 웹 기술을 사용하여 만든 애플리케이션으로, 모바일 앱처럼 설치하고 사용할 수 있습니다.

## 주요 기능

### ✅ 완료된 작업

1. **아이콘 생성**
   - 192x192 PNG 아이콘
   - 512x512 PNG 아이콘
   - 320 브랜드 로고 기반

2. **Service Worker**
   - 오프라인 캐싱
   - 자동 업데이트
   - 네트워크 최적화

3. **Manifest 설정**
   - 앱 이름: THIRD TWENTY - 320 Magazine
   - 테마 색상: #9333ea (보라색)
   - Standalone 모드
   - 단축키 설정

4. **PWA 업데이트 알림**
   - 새 버전 자동 감지
   - 업데이트 프롬프트
   - 오프라인/온라인 상태 표시

5. **캐싱 전략**
   - Supabase API: NetworkFirst (1일)
   - 이미지: CacheFirst (30일)
   - 정적 파일: Precache

## 설치 방법

### 모바일 (iOS)

1. Safari에서 320mag.com 접속
2. 하단의 공유 버튼 탭
3. "홈 화면에 추가" 선택
4. "추가" 버튼 탭

### 모바일 (Android)

1. Chrome에서 320mag.com 접속
2. 우측 상단 메뉴 (⋮) 탭
3. "홈 화면에 추가" 선택
4. "설치" 버튼 탭

### 데스크톱 (Chrome/Edge)

1. 320mag.com 접속
2. 주소창 우측의 설치 아이콘 (⊕) 클릭
3. "설치" 버튼 클릭

## 파일 구조

```
public/
├── icon-192.png          # PWA 아이콘 (192x192)
├── icon-512.png          # PWA 아이콘 (512x512)
├── manifest.json         # PWA 매니페스트
└── sw.js                 # Service Worker (수동)

src/
├── hooks/
│   └── usePWA.ts        # PWA 훅
├── components/
│   └── PWAUpdatePrompt.tsx  # 업데이트 알림
└── App.tsx              # PWA 통합

dist/
├── sw.js                # Workbox Service Worker (자동)
├── workbox-*.js         # Workbox 런타임
└── manifest.webmanifest # 생성된 매니페스트
```

## 빌드

```bash
npm run build
```

빌드 시 자동으로 생성되는 파일:
- `dist/sw.js` - Workbox Service Worker
- `dist/workbox-*.js` - Workbox 런타임
- `dist/manifest.webmanifest` - PWA 매니페스트

## 테스트

### 로컬 테스트

```bash
npm run build
npm run preview
```

### 프로덕션 확인

1. Chrome DevTools → Application 탭
2. Service Workers 섹션 확인
3. Manifest 섹션 확인
4. Lighthouse → PWA 점수 확인

## PWA 기능

### 오프라인 지원
- 캐시된 콘텐츠는 오프라인에서도 접근 가능
- 네트워크 연결 상태 자동 감지
- 오프라인 알림 표시

### 자동 업데이트
- 새 버전 자동 감지
- 사용자 친화적인 업데이트 프롬프트
- 백그라운드 업데이트

### 네트워크 최적화
- Supabase API: NetworkFirst (최신 데이터 우선)
- 이미지: CacheFirst (빠른 로딩)
- 정적 파일: Precache (즉시 사용 가능)

### 앱 같은 경험
- 전체 화면 모드
- 홈 화면 아이콘
- 스플래시 스크린 (자동 생성)
- 네이티브 앱 느낌

## 배포

### Vercel

```bash
vercel --prod
```

자동으로 PWA가 활성화됩니다.

### 기타 호스팅

1. `npm run build` 실행
2. `dist` 폴더를 호스팅 서버에 업로드
3. HTTPS 필수 (PWA 요구사항)

## 주의사항

1. **HTTPS 필수**
   - PWA는 HTTPS에서만 동작
   - localhost는 예외

2. **브라우저 지원**
   - Chrome/Edge: 완전 지원
   - Safari: 부분 지원 (iOS 11.3+)
   - Firefox: 부분 지원

3. **캐시 관리**
   - 캐시 클리어: `?clearCache=true` 파라미터 사용
   - Service Worker 업데이트는 자동

## 문제 해결

### Service Worker가 등록되지 않음
```javascript
// DevTools Console 확인
navigator.serviceWorker.getRegistrations()
```

### 캐시 강제 클리어
```javascript
// DevTools Console에서 실행
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})
```

### 업데이트가 적용되지 않음
1. Service Worker Unregister
2. 캐시 클리어
3. 페이지 새로고침

## 향후 개선 사항

- [ ] Push 알림 (이미 구현된 Firebase 활용)
- [ ] 백그라운드 동기화
- [ ] 주기적 백그라운드 동기화
- [ ] 공유 타겟 API
- [ ] 파일 핸들링 API
- [ ] 설치 프롬프트 커스터마이징

## 참고 자료

- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developer.chrome.com/docs/workbox/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

## 지원

문제가 발생하면 다음을 확인하세요:
1. Chrome DevTools → Application 탭
2. Service Worker 상태
3. Console 오류 메시지
4. Network 탭 (캐시 동작 확인)
