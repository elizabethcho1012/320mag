import React, { useState, useEffect } from 'react';

interface WebAppsPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const WebAppsPage: React.FC<WebAppsPageProps> = ({ isDarkMode, onBack }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('이 브라우저는 PWA 설치를 지원하지 않습니다.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA 설치 완료');
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <button
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
        >
          ← 돌아가기
        </button>

        <h1 className="text-4xl font-bold mb-8">320 웹앱 서비스</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">모바일 앱처럼 사용하세요</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              THIRD TWENTY를 스마트폰 홈 화면에 추가하여 앱처럼 편리하게 이용하실 수 있습니다.
              별도의 앱 다운로드 없이 브라우저에서 바로 설치 가능합니다.
            </p>
          </section>

          {/* PWA 설치 카드 */}
          <div className={`p-8 rounded-lg border-2 ${isDarkMode ? 'bg-gray-800 border-purple-600' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                320
              </div>
              <div>
                <h3 className="text-2xl font-semibold">THIRD TWENTY App</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  PWA (Progressive Web App)
                </p>
              </div>
            </div>

            <ul className={`space-y-3 mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>오프라인에서도 일부 콘텐츠 이용 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>홈 화면에서 바로 접속</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>빠른 로딩 속도</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>푸시 알림으로 새 콘텐츠 확인</span>
              </li>
            </ul>

            <button
              onClick={handleInstallClick}
              disabled={!isInstallable}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                isInstallable
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              {isInstallable ? '홈 화면에 추가하기' : '이미 설치되었거나 지원하지 않는 브라우저입니다'}
            </button>
          </div>

          {/* 설치 가이드 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">설치 가이드</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>📱</span> iOS (Safari)
                </h3>
                <ol className={`space-y-2 list-decimal list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Safari에서 www.320.kr 접속</li>
                  <li>하단 공유 버튼 ( <span className="inline-block w-4 h-4">⬆️</span> ) 탭</li>
                  <li>"홈 화면에 추가" 선택</li>
                  <li>"추가" 버튼 탭</li>
                </ol>
              </div>

              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <span>🤖</span> Android (Chrome)
                </h3>
                <ol className={`space-y-2 list-decimal list-inside ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>Chrome에서 www.320.kr 접속</li>
                  <li>상단 메뉴(⋮) 탭</li>
                  <li>"홈 화면에 추가" 또는 "앱 설치" 선택</li>
                  <li>"설치" 버튼 탭</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 기능 소개 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">주요 기능</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-4xl mb-4">📰</div>
                <h3 className="font-semibold mb-2">최신 콘텐츠</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  매일 업데이트되는 프리미엄 콘텐츠
                </p>
              </div>
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="font-semibold mb-2">푸시 알림</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  새 기사와 이벤트 알림
                </p>
              </div>
              <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">빠른 속도</h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  최적화된 로딩 성능
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WebAppsPage;
