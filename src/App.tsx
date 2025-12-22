import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/layout/Header';
import ScrollToTopButton from './components/ui/ScrollToTopButton';
import SettingsPanel from './components/ui/SettingsPanel';
import HomePage from './pages/HomePage';
import DailyNewsPage from './pages/DailyNewsPage';
import CategoryPage from './pages/CategoryPage';
import CreatorsPage from './pages/CreatorsPage';
import EventsPage from './pages/EventsPage';
import ChallengesPage from './pages/ChallengesPage';
import AdminPage from './pages/AdminPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AboutPage from './pages/AboutPage';
import AdvertisePage from './pages/AdvertisePage';
import PrivacyPage from './pages/PrivacyPage';
import NoticesPage from './pages/NoticesPage';
import WebAppsPage from './pages/WebAppsPage';
import MyPage from './pages/MyPage';
import PWAAppsPage from './pages/pwa/PWAAppsPage';
import InitialAdPopup from './components/InitialAdPopup';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (cacheTime → gcTime으로 변경)
      retry: 1,
      refetchOnWindowFocus: false,
      // Chrome 프로필별 캐시 문제 방지
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
  },
});

// URL 파라미터로 캐시 클리어 지원 (?clearCache=true)
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('clearCache') === 'true') {
    console.log('🧹 캐시 클리어 중...');
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    // URL에서 파라미터 제거
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('✅ 캐시 클리어 완료!');
  }
}

// 앱 내부 컴포넌트 (AuthProvider 내부에서 사용)
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Supabase Auth 연동
  const { profile, isAdmin, loading } = useAuth();

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleArticleClick = (articleId: number | string) => {
    setSelectedArticleId(typeof articleId === 'number' ? articleId.toString() : articleId);
    setCurrentPage('article-detail');
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
    setCurrentPage('home');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setCurrentPage('search');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setCurrentPage('home');
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg'
  };
  
  const renderPage = () => {
    if (currentPage === 'article-detail' && selectedArticleId) {
      return (
        <ArticleDetailPage
          articleId={selectedArticleId}
          onBack={handleBackToList}
          onArticleClick={handleArticleClick}
          isDarkMode={isDarkMode}
        />
      );
    }

    if (currentPage === 'search' && isSearching) {
      return (
        <SearchResultsPage
          searchQuery={searchQuery}
          onArticleClick={handleArticleClick}
          onClearSearch={handleClearSearch}
          isDarkMode={isDarkMode}
        />
      );
    }

    const pageProps = {
      onArticleClick: handleArticleClick,
      isDarkMode,
      highContrast,
      onNavigate: setCurrentPage
    };

    switch (currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      case 'daily-news':
        return <DailyNewsPage {...pageProps} />;
      case 'creators':
        return <CreatorsPage isDarkMode={isDarkMode} />;
      case 'events':
        return <EventsPage isDarkMode={isDarkMode} highContrast={highContrast} />;
      case 'challenges':
        return <ChallengesPage isDarkMode={isDarkMode} />;
      case 'admin':
        // 관리자만 접근 가능
        if (!isAdmin) {
          return <HomePage {...pageProps} />;
        }
        return <AdminPage
          isDarkMode={isDarkMode}
          onBack={() => setCurrentPage('home')}
          currentUser={profile ? {
            id: profile.id,
            username: profile.username,
            role: profile.role,
            email: profile.email
          } : null}
        />;
      case 'mypage':
        return <MyPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'subscription':
        return <SubscriptionPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'about':
        return <AboutPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'advertise':
        return <AdvertisePage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'privacy':
        return <PrivacyPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'notices':
        return <NoticesPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'webapps':
        return <WebAppsPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('home')} />;
      case 'apps':
        return <PWAAppsPage />;
      case 'fashion':
        return <CategoryPage category="패션" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'beauty':
        return <CategoryPage category="뷰티" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'travel':
        return <CategoryPage category="여행" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'lifestyle':
        return <CategoryPage category="라이프스타일" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'food':
        return <CategoryPage category="푸드" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'mind':
        return <CategoryPage category="심리" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'fitness':
        return <CategoryPage category="운동" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'housing':
        return <CategoryPage category="하우징" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'sexuality':
        return <CategoryPage category="섹슈얼리티" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <div className={`min-h-screen transition-colors duration-300 ${fontSizeClasses[fontSize]} ${
          isDarkMode ? 'bg-gray-900' : highContrast ? 'bg-white' : 'bg-gray-50'
        }`}>
          {/* 초기 진입 광고 팝업 (프리미엄 회원 제외) */}
          <InitialAdPopup />

          {/* PWA 업데이트 알림 */}
          <PWAUpdatePrompt />

          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onSearch={handleSearch}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSettingsClick={() => setIsSettingsOpen(true)}
            isDarkMode={isDarkMode}
            highContrast={highContrast}
          />

          <main>
            {renderPage()}
          </main>

          <ScrollToTopButton />

          <SettingsPanel
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            fontSize={fontSize}
            setFontSize={(size) => setFontSize(size as 'small' | 'medium' | 'large')}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
          />
        </div>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

// 메인 App 컴포넌트 (AuthProvider로 감싸기)
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;