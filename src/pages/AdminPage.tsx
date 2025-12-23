import React, { useState } from 'react';
import { supabaseAny as supabase } from '../lib/supabase';
import EditorApplicationsContent from '../components/admin/EditorApplicationsContent';
import { useHomepageSettings, useUpdateHomepageSettings } from '../hooks/useHomepageSettings';
import { useCategories } from '../hooks/useArticles';

interface AdminPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

type AdminMenuType = 'dashboard' | 'articles' | 'events' | 'creators' | 'editors' | 'categories' | 'advertisements' | 'media' | 'settings';

// 사용자 타입 정의
type UserRole = 'guest' | 'member' | 'subscriber' | 'admin';

interface User {
  id: string;
  username: string;
  role: UserRole;
  email: string;
}

// 콘텐츠 블록 타입 정의
interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'heading' | 'quote';
  content: string;
  imageUrl?: string;
  imageCaption?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
}

// 아티클 타입 정의
interface Article {
  id: string;
  title: string;
  content: ContentBlock[];
  excerpt: string;
  category: string;
  subcategory: string;
  author: string;
  status: 'draft' | 'published' | 'scheduled';
  featured: boolean;
  featuredImage?: string;
  publishDate: string;
  tags: string[];
  readTime: string;
  updatedAt?: string;
}

const AdminPage: React.FC<AdminPageProps> = ({ isDarkMode, onBack, currentUser }) => {
  const [currentMenu, setCurrentMenu] = useState<AdminMenuType>('dashboard');
  
  // 관리자 권한 확인
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center transition-colors duration-300`}>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-lg p-8 w-full max-w-md`}>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              접근 권한이 없습니다
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              관리자 계정으로 로그인해주세요.
            </p>
            <button
              onClick={onBack}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const adminMenus = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'articles', label: '아티클 관리', icon: '📝' },
    { id: 'events', label: '이벤트 관리', icon: '🎉' },
    { id: 'creators', label: '크리에이터 관리', icon: '👥' },
    { id: 'editors', label: '에디터 신청 관리', icon: '✍️' },
    { id: 'categories', label: '카테고리 관리', icon: '🏷️' },
    { id: 'advertisements', label: '광고 관리', icon: '📢' },
    { id: 'media', label: '미디어 라이브러리', icon: '🖼️' },
    { id: 'settings', label: '설정', icon: '⚙️' }
  ];

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="flex">
        {/* 사이드바 */}
        <div className={`${cardClass} w-64 min-h-screen border-r`}>
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className={`text-lg font-bold ${textClass}`}
                  style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
                THIRD TWENTY
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                관리자 패널
              </p>
            </div>
            
            <nav className="space-y-2">
              {adminMenus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setCurrentMenu(menu.id as AdminMenuType)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    currentMenu === menu.id
                      ? 'bg-purple-600 text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{menu.icon}</span>
                  <span className="text-sm font-medium">{menu.label}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600">
              <button
                onClick={onBack}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-sm ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ← 메인으로
              </button>
            </div>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-8">
          {currentMenu === 'dashboard' && <DashboardContent isDarkMode={isDarkMode} />}
          {currentMenu === 'articles' && <ArticlesContent isDarkMode={isDarkMode} />}
          {currentMenu === 'events' && <EventsContent isDarkMode={isDarkMode} />}
          {currentMenu === 'creators' && <CreatorsContent isDarkMode={isDarkMode} />}
          {currentMenu === 'editors' && <EditorApplicationsContent isDarkMode={isDarkMode} />}
          {currentMenu === 'categories' && <CategoriesContent isDarkMode={isDarkMode} />}
          {currentMenu === 'advertisements' && <AdvertisementsContent isDarkMode={isDarkMode} />}
          {currentMenu === 'media' && <MediaContent isDarkMode={isDarkMode} />}
          {currentMenu === 'settings' && <SettingsContent isDarkMode={isDarkMode} />}
        </div>
      </div>
    </div>
  );
};

// 1. 대시보드 - Mixpanel 스타일 상세 분석
const DashboardContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    avgViewsPerArticle: 0,
    avgLikesPerArticle: 0,
    activeCreators: 0,
    activeEditors: 0,
    topArticles: [] as Array<{
      id: string;
      title: string;
      view_count: number;
      like_count: number;
      creators: { name: string } | null;
      categories: { name: string } | null;
    }>,
    topCreators: [] as Array<{
      id: string;
      name: string;
      article_count: number;
      total_views: number;
      total_likes: number;
    }>,
    categoryStats: [] as Array<{
      category: string;
      count: number;
      views: number;
      likes: number;
    }>,
    recentActivity: [] as Array<{
      id: string;
      title: string;
      status: string;
      updatedAt: string;
      view_count: number;
      like_count: number;
    }>,
    dailyStats: [] as Array<{
      date: string;
      views: number;
      likes: number;
      articles: number;
    }>
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  React.useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. 기사 데이터 가져오기 (조회수, 좋아요 포함)
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          status,
          published_at,
          updated_at,
          view_count,
          like_count,
          categories(id, name),
          creators(id, name)
        `)
        .order('published_at', { ascending: false });

      if (articlesError) throw articlesError;

      // 2. 크리에이터 수 가져오기
      const { data: creators, error: creatorsError } = await supabase
        .from('creators')
        .select('id, name');

      // 3. 에디터 수 가져오기
      const { data: editors, error: editorsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_editor', true);

      const published = articles?.filter((a: any) => a.status === 'published') || [];
      const drafts = articles?.filter((a: any) => a.status === 'draft') || [];
      const totalViews = articles?.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0) || 0;
      const totalLikes = articles?.reduce((sum: number, a: any) => sum + (a.like_count || 0), 0) || 0;

      // 카테고리별 통계 (조회수, 좋아요 포함)
      const categoryMap: Record<string, { count: number; views: number; likes: number }> = {};
      articles?.forEach((a: any) => {
        const cat = a.categories?.name || '미분류';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 0, views: 0, likes: 0 };
        }
        categoryMap[cat].count += 1;
        categoryMap[cat].views += a.view_count || 0;
        categoryMap[cat].likes += a.like_count || 0;
      });
      const categoryStats = Object.entries(categoryMap)
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.views - a.views);

      // 상위 기사 (조회수 기준)
      const topArticles = (articles || [])
        .filter((a: any) => a.status === 'published')
        .sort((a: any, b: any) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 10)
        .map((a: any) => ({
          id: a.id,
          title: a.title,
          view_count: a.view_count || 0,
          like_count: a.like_count || 0,
          creators: a.creators,
          categories: a.categories,
        }));

      // 크리에이터별 통계
      const creatorMap: Record<string, { id: string; name: string; article_count: number; total_views: number; total_likes: number }> = {};
      articles?.forEach((a: any) => {
        if (a.creators && a.status === 'published') {
          const creatorId = a.creators.id;
          if (!creatorMap[creatorId]) {
            creatorMap[creatorId] = {
              id: creatorId,
              name: a.creators.name,
              article_count: 0,
              total_views: 0,
              total_likes: 0,
            };
          }
          creatorMap[creatorId].article_count += 1;
          creatorMap[creatorId].total_views += a.view_count || 0;
          creatorMap[creatorId].total_likes += a.like_count || 0;
        }
      });
      const topCreators = Object.values(creatorMap)
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 10);

      // 최근 활동 (상위 10개)
      const recentActivity = (articles || []).slice(0, 10).map((a: any) => ({
        id: a.id,
        title: a.title,
        status: a.status,
        updatedAt: formatTimeAgo(a.updated_at || a.published_at),
        view_count: a.view_count || 0,
        like_count: a.like_count || 0,
      }));

      // 일별 통계 (최근 30일)
      const dailyStats = generateDailyStats(articles || [], timeRange);

      setStats({
        totalArticles: articles?.length || 0,
        publishedArticles: published.length,
        draftArticles: drafts.length,
        totalViews,
        totalLikes,
        avgViewsPerArticle: published.length > 0 ? Math.round(totalViews / published.length) : 0,
        avgLikesPerArticle: published.length > 0 ? Math.round(totalLikes / published.length) : 0,
        activeCreators: creators?.length || 0,
        activeEditors: editors?.length || 0,
        topArticles,
        topCreators,
        categoryStats,
        recentActivity,
        dailyStats,
      });
    } catch (error) {
      console.error('Dashboard data load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyStats = (articles: any[], range: '7d' | '30d' | '90d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const stats: Array<{ date: string; views: number; likes: number; articles: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayArticles = articles.filter((a: any) => {
        if (!a.published_at) return false;
        const pubDate = new Date(a.published_at).toISOString().split('T')[0];
        return pubDate === dateStr;
      });

      stats.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        views: dayArticles.reduce((sum, a) => sum + (a.view_count || 0), 0),
        likes: dayArticles.reduce((sum, a) => sum + (a.like_count || 0), 0),
        articles: dayArticles.length,
      });
    }

    return stats;
  };

  // 시간 포맷팅 헬퍼
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const dashboardStats = [
    {
      label: '총 아티클',
      value: stats.totalArticles.toString(),
      icon: '📝',
      subtext: `발행: ${stats.publishedArticles} | 임시: ${stats.draftArticles}`,
      color: 'purple'
    },
    {
      label: '총 조회수',
      value: formatNumber(stats.totalViews),
      icon: '👁️',
      subtext: `평균: ${stats.avgViewsPerArticle}/기사`,
      color: 'blue'
    },
    {
      label: '총 좋아요',
      value: formatNumber(stats.totalLikes),
      icon: '❤️',
      subtext: `평균: ${stats.avgLikesPerArticle}/기사`,
      color: 'pink'
    },
    {
      label: '크리에이터/에디터',
      value: `${stats.activeCreators}/${stats.activeEditors}`,
      icon: '⭐',
      subtext: '활성 기여자',
      color: 'green'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 dark:text-green-400';
      case 'draft': return 'text-yellow-600 dark:text-yellow-400';
      case 'scheduled': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '발행됨';
      case 'draft': return '임시저장';
      case 'scheduled': return '예약발행';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textClass}`}>분석 대시보드</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            실시간 콘텐츠 성과 분석 및 크리에이터 현황
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 bg-green-500 rounded-full animate-pulse`}></div>
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>실시간</span>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
          </select>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className={`${cardClass} rounded-lg border p-6 hover:shadow-lg transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className={`text-3xl font-bold ${textClass} mb-1`}>{stat.value}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {stat.label}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* 상위 기사 및 크리에이터 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 상위 기사 (조회수 기준) */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textClass}`}>🏆 상위 기사 (조회수)</h3>
          </div>
          <div className="space-y-3">
            {stats.topArticles.length > 0 ? (
              stats.topArticles.slice(0, 5).map((article, index) => (
                <div
                  key={article.id}
                  className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  } hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${textClass}`}>#{index + 1}</span>
                        <h4 className={`text-sm font-medium ${textClass} line-clamp-1`}>
                          {article.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {article.categories && (
                          <span className={`px-2 py-1 rounded ${
                            isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {article.categories.name}
                          </span>
                        )}
                        {article.creators && (
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {article.creators.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-4">
                      <div className="flex items-center gap-1 text-sm">
                        <span>👁️</span>
                        <span className={`font-semibold ${textClass}`}>
                          {formatNumber(article.view_count)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span>❤️</span>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {formatNumber(article.like_count)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
                발행된 기사가 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* 상위 크리에이터 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textClass}`}>⭐ 상위 크리에이터 (조회수)</h3>
          </div>
          <div className="space-y-3">
            {stats.topCreators.length > 0 ? (
              stats.topCreators.slice(0, 5).map((creator, index) => (
                <div
                  key={creator.id}
                  className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  } hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${textClass}`}>#{index + 1}</span>
                      <div>
                        <h4 className={`text-sm font-medium ${textClass}`}>{creator.name}</h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {creator.article_count}개 기사
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <span>👁️</span>
                        <span className={`font-semibold ${textClass}`}>
                          {formatNumber(creator.total_views)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span>❤️</span>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {formatNumber(creator.total_likes)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
                크리에이터 데이터가 없습니다.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 카테고리별 성과 및 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리별 성과 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textClass}`}>📊 카테고리별 성과</h3>
          </div>
          <div className="space-y-4">
            {stats.categoryStats.length > 0 ? (
              stats.categoryStats.slice(0, 6).map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${textClass}`}>{cat.category}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {cat.count}개
                      </span>
                      <span>👁️ {formatNumber(cat.views)}</span>
                      <span>❤️ {formatNumber(cat.likes)}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${(cat.views / (stats.totalViews || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>
                카테고리 데이터가 없습니다.
              </p>
            )}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${textClass}`}>🕐 최근 활동</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {stats.recentActivity.map((article, index) => (
              <div
                key={article.id}
                className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${textClass} mb-1 line-clamp-1`}>
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {getStatusLabel(article.status)}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {article.updatedAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-4 text-xs">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      👁️ {article.view_count}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      ❤️ {article.like_count}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. 아티클 관리 - Supabase 연동 CRUD
const ArticlesContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';

  // 카테고리 목록 로드
  React.useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');
      if (data) {
        setCategories(data);
      }
    };
    loadCategories();
  }, []);

  // 기사 목록 로드
  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          content,
          excerpt,
          status,
          published_at,
          updated_at,
          featured_image_url,
          view_count,
          categories(id, name, slug),
          creators(id, name)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error('기사 로드 오류:', error);
      alert('기사를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadArticles();
  }, []);

  // 필터링 로직
  const filteredArticles = articles.filter(article => {
    const authorName = article.creators?.name || '';
    const categoryName = article.categories?.name || '';

    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || article.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || article.categories?.id === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 기사 저장 (생성 및 수정)
  const handleSaveArticle = async (articleData: any) => {
    try {
      if (editingArticle) {
        // 수정
        const { error } = await supabase
          .from('articles')
          .update({
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            status: articleData.status,
            category_id: articleData.category_id,
            featured_image_url: articleData.featured_image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingArticle.id);

        if (error) throw error;
        alert('기사가 수정되었습니다.');
      } else {
        // 새 기사 생성
        const { error } = await supabase
          .from('articles')
          .insert({
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            status: articleData.status || 'draft',
            category_id: articleData.category_id,
            creator_id: articleData.creator_id, // 작성자 ID 필요
            featured_image_url: articleData.featured_image_url,
            slug: articleData.title
              .toLowerCase()
              .replace(/[^a-z0-9가-힣]+/g, '-')
              .replace(/^-+|-+$/g, '')
              .substring(0, 100),
            published_at: articleData.status === 'published' ? new Date().toISOString() : null,
          });

        if (error) throw error;
        alert('새 기사가 작성되었습니다.');
      }

      // 목록 새로고침
      await loadArticles();
      setShowEditor(false);
      setEditingArticle(null);
    } catch (error: any) {
      console.error('기사 저장 오류:', error);
      alert(`기사 저장 실패: ${error.message}`);
    }
  };

  // 기사 삭제
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('정말로 이 기사를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('기사가 삭제되었습니다.');
      await loadArticles();
    } catch (error: any) {
      console.error('기사 삭제 오류:', error);
      alert(`기사 삭제 실패: ${error.message}`);
    }
  };

  // 상태 변경
  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published') => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // published로 변경 시 published_at 설정
      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      await loadArticles();
    } catch (error: any) {
      console.error('상태 변경 오류:', error);
      alert(`상태 변경 실패: ${error.message}`);
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold ${textClass}`}>아티클 관리</h2>
        <button
          onClick={() => setShowEditor(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          새 아티클 작성
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : showEditor ? (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}>
          <p className={textClass}>기사 에디터는 준비 중입니다. Supabase에서 직접 편집하거나 AI 콘텐츠 파이프라인을 사용하세요.</p>
          <button
            onClick={() => setShowEditor(false)}
            className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            닫기
          </button>
        </div>
      ) : (
        <div>
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6 mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>검색</label>
                <input
                  type="text"
                  placeholder="제목, 작성자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>상태</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">전체</option>
                  <option value="draft">임시저장</option>
                  <option value="published">발행됨</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>카테고리</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">전체</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  총 {filteredArticles.length}개 기사
                </div>
              </div>
            </div>
          </div>

          {/* 기사 목록 */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 text-center`}>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  기사가 없습니다. AI 콘텐츠 파이프라인을 실행하여 기사를 수집하세요.
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-6`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${textClass}`}>{article.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {article.status === 'published' ? '발행됨' : '임시저장'}
                        </span>
                        {article.categories && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {article.categories.name}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {article.excerpt || article.content.substring(0, 100)}...
                      </p>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex gap-4`}>
                        <span>작성자: {article.creators?.name || '알 수 없음'}</span>
                        <span>조회수: {article.view_count || 0}</span>
                        <span>수정: {new Date(article.updated_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleStatusChange(article.id, article.status === 'published' ? 'draft' : 'published')}
                        className={`px-3 py-1 rounded text-sm ${
                          article.status === 'published'
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {article.status === 'published' ? '임시저장' : '발행'}
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 3. 아티클 에디터 - 리치 에디터 포함
const ArticleEditor: React.FC<{ 
  isDarkMode: boolean; 
  onClose: () => void; 
  article: Article | null;
  onSave: (articleData: any) => void;
}> = ({ isDarkMode, onClose, article, onSave }) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    category: article?.category || '패션',
    subcategory: article?.subcategory || '',
    author: article?.author || '',
    status: article?.status || 'draft',
    featured: article?.featured || false,
    tags: article?.tags?.join(', ') || '',
    readTime: article?.readTime || '5분'
  });
  
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>(
    article?.content || [{ id: '1', type: 'text', content: '' }]
  );

  const handleSave = (blocks: ContentBlock[]) => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    const articleData = {
      ...formData,
      content: blocks,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      updatedAt: new Date().toISOString()
    };
    
    onSave(articleData);
  };

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>제목</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>작성자</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({...formData, author: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>카테고리</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="패션">패션</option>
            <option value="뷰티">뷰티</option>
            <option value="컬처">컬처</option>
            <option value="라이프스타일">라이프스타일</option>
          </select>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textClass} mb-2`}>상태</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published' | 'scheduled'})}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="draft">임시저장</option>
            <option value="published">발행됨</option>
            <option value="scheduled">예약발행</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4 pt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="mr-2"
            />
            <span className={`text-sm ${textClass}`}>피처드 아티클</span>
          </label>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium ${textClass} mb-2`}>요약</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textClass} mb-2`}>태그 (쉼표로 구분)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          placeholder="패션, 스타일링, 트렌드"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textClass} mb-4`}>아티클 본문</label>
        <RichEditor 
          isDarkMode={isDarkMode}
          onSave={handleSave}
          onCancel={onClose}
          initialContent={contentBlocks}
        />
      </div>
    </div>
  );
};

// 4. 아티클 리스트
const ArticleList: React.FC<{ 
  isDarkMode: boolean; 
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Article['status']) => void;
  onFeaturedToggle: (id: string) => void;
}> = ({ isDarkMode, articles, onEdit, onDelete, onStatusChange, onFeaturedToggle }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <div className={`${cardClass} rounded-lg border`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>제목</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>카테고리</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>작성자</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>상태</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>발행일</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${textClass} uppercase tracking-wider`}>액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <div className={`text-sm font-medium ${textClass} flex items-center gap-2`}>
                      {article.title}
                      {article.featured && (
                        <span className="text-yellow-500" title="피처드 아티클">⭐</span>
                      )}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {article.excerpt}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    article.category === '패션' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    article.category === '뷰티' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' :
                    article.category === '컬처' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                  }`}>
                    {article.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm ${textClass}`}>{article.author}</td>
                <td className="px-6 py-4">
                  <select
                    value={article.status}
                    onChange={(e) => onStatusChange(article.id, e.target.value as Article['status'])}
                    className={`text-xs px-2 py-1 rounded-full border-none focus:ring-1 focus:ring-purple-500 ${
                      article.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      article.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                  >
                    <option value="draft">임시저장</option>
                    <option value="published">발행됨</option>
                    <option value="scheduled">예약발행</option>
                  </select>
                </td>
                <td className={`px-6 py-4 text-sm ${textClass}`}>
                  {new Date(article.publishDate).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    onClick={() => onEdit(article)}
                    className="text-purple-600 hover:text-purple-900 transition-colors"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => onFeaturedToggle(article.id)}
                    className={`${article.featured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-700 transition-colors`}
                    title={article.featured ? '피처드 해제' : '피처드 설정'}
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => onDelete(article.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 리치 에디터 컴포넌트
const RichEditor: React.FC<{
  isDarkMode: boolean;
  onSave: (content: ContentBlock[]) => void;
  onCancel: () => void;
  initialContent?: ContentBlock[];
}> = ({ isDarkMode, onSave, onCancel, initialContent = [] }) => {
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    initialContent.length > 0 
      ? initialContent 
      : [{ id: '1', type: 'text', content: '' }]
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : 'bg-white border-gray-300 text-gray-900';

  const addBlock = (type: ContentBlock['type'], index: number) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'heading' ? 'New Heading' : type === 'quote' ? 'Quote text...' : '',
      size: type === 'image' ? 'medium' : undefined
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const handleImageUpload = (blockId: string) => {
    fileInputRef.current?.click();
    fileInputRef.current!.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateBlock(blockId, { 
            imageUrl: e.target?.result as string,
            content: file.name 
          });
        };
        reader.readAsDataURL(file);
      }
    };
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(dropIndex, 0, draggedBlock);
    
    setBlocks(newBlocks);
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSave(blocks);
  };

  return (
    <div className={`${cardClass} rounded-lg border p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-semibold ${textClass}`}>매거진 아티클 에디터</h3>
        <div className="space-x-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className={`text-lg font-medium ${textClass} mb-4`}>편집</h4>
          
          {blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className={`relative group border-2 border-dashed border-transparent hover:border-purple-300 p-3 rounded-lg transition-all ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`text-xs px-2 py-1 rounded ${
                  block.type === 'text' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  block.type === 'image' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  block.type === 'heading' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                  'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                }`}>
                  {block.type === 'text' ? '텍스트' : 
                   block.type === 'image' ? '이미지' :
                   block.type === 'heading' ? '제목' : '인용구'}
                </span>
                {blocks.length > 1 && (
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    삭제
                  </button>
                )}
              </div>

              {block.type === 'text' && (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${inputClass}`}
                  rows={4}
                  placeholder="본문 텍스트를 입력하세요..."
                />
              )}

              {block.type === 'heading' && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg font-semibold ${inputClass}`}
                  placeholder="제목을 입력하세요..."
                />
              )}

              {block.type === 'quote' && (
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 italic ${inputClass}`}
                  rows={2}
                  placeholder="인용구를 입력하세요..."
                />
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  {!block.imageUrl ? (
                    <div 
                      onClick={() => handleImageUpload(block.id)}
                      className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors`}
                    >
                      <div className="text-4xl mb-2">📷</div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        클릭하여 이미지 업로드
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <img 
                        src={block.imageUrl} 
                        alt={block.content}
                        className="w-full rounded-lg"
                      />
                      <div className="flex gap-2">
                        <select
                          value={block.size}
                          onChange={(e) => updateBlock(block.id, { size: e.target.value as any })}
                          className={`px-2 py-1 text-xs border rounded ${inputClass}`}
                        >
                          <option value="small">작음</option>
                          <option value="medium">중간</option>
                          <option value="large">큼</option>
                          <option value="full">전체폭</option>
                        </select>
                        <button
                          onClick={() => handleImageUpload(block.id)}
                          className="px-2 py-1 text-xs text-purple-600 hover:text-purple-800"
                        >
                          변경
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    type="text"
                    value={block.imageCaption || ''}
                    onChange={(e) => updateBlock(block.id, { imageCaption: e.target.value })}
                    className={`w-full px-3 py-1 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                    placeholder="이미지 캡션 (선택사항)"
                  />
                </div>
              )}

              <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => addBlock('text', index)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                >
                  + 텍스트
                </button>
                <button
                  onClick={() => addBlock('image', index)}
                  className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-900/50"
                >
                  + 이미지
                </button>
                <button
                  onClick={() => addBlock('heading', index)}
                  className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50"
                >
                  + 제목
                </button>
                <button
                  onClick={() => addBlock('quote', index)}
                  className="px-2 py-1 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50"
                >
                  + 인용구
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className={`text-lg font-medium ${textClass} mb-4`}>미리보기</h4>
          <div className={`${cardClass} border rounded-lg p-6 max-h-96 overflow-y-auto`}>
            {blocks.map((block) => (
              <div key={block.id} className="mb-6 last:mb-0">
                {block.type === 'heading' && (
                  <h2 className={`text-2xl font-bold ${textClass} mb-4`}>
                    {block.content || '제목'}
                  </h2>
                )}
                
                {block.type === 'text' && (
                  <p className={`${textClass} leading-relaxed mb-4 whitespace-pre-wrap`}>
                    {block.content || '텍스트 내용이 여기에 표시됩니다.'}
                  </p>
                )}
                
                {block.type === 'quote' && (
                  <blockquote className={`${textClass} italic border-l-4 border-purple-500 pl-4 my-4`}>
                    {block.content || '인용구'}
                  </blockquote>
                )}
                
                {block.type === 'image' && block.imageUrl && (
                  <figure className={`my-6 ${
                    block.size === 'small' ? 'w-1/2' :
                    block.size === 'medium' ? 'w-3/4' :
                    block.size === 'large' ? 'w-full' : 'w-full'
                  } mx-auto`}>
                    <img 
                      src={block.imageUrl} 
                      alt={block.content}
                      className="w-full rounded-lg shadow-md"
                    />
                    {block.imageCaption && (
                      <figcaption className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mt-2`}>
                        {block.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

// 기타 컴포넌트들 (플레이스홀더)
const EventsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'online' as 'online' | 'offline' | 'hybrid',
    start_date: '',
    end_date: '',
    location: '',
    max_participants: '',
    registration_deadline: '',
    registration_fee: '0',
    featured_image_url: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  });

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  React.useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('이벤트 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNew = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'online',
      start_date: '',
      end_date: '',
      location: '',
      max_participants: '',
      registration_deadline: '',
      registration_fee: '0',
      featured_image_url: '',
      status: 'upcoming',
    });
    setShowEditor(true);
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      start_date: event.start_date ? event.start_date.substring(0, 16) : '',
      end_date: event.end_date ? event.end_date.substring(0, 16) : '',
      location: event.location || '',
      max_participants: event.max_participants?.toString() || '',
      registration_deadline: event.registration_deadline ? event.registration_deadline.substring(0, 16) : '',
      registration_fee: event.registration_fee?.toString() || '0',
      featured_image_url: event.featured_image_url || '',
      status: event.status,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.start_date) {
      alert('제목과 시작일은 필수입니다.');
      return;
    }

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        event_type: formData.event_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        location: formData.location.trim() || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        registration_deadline: formData.registration_deadline || null,
        registration_fee: parseInt(formData.registration_fee) || 0,
        featured_image_url: formData.featured_image_url.trim() || null,
        status: formData.status,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        alert('이벤트가 수정되었습니다.');
      } else {
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        alert('이벤트가 등록되었습니다.');
      }

      setShowEditor(false);
      loadEvents();
    } catch (error) {
      console.error('이벤트 저장 오류:', error);
      alert('이벤트 저장에 실패했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('이벤트가 삭제되었습니다.');
      loadEvents();
    } catch (error) {
      console.error('이벤트 삭제 오류:', error);
      alert('이벤트 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${textClass}`}>
            {editingEvent ? '이벤트 수정' : '새 이벤트 등록'}
          </h2>
          <button
            onClick={() => setShowEditor(false)}
            className="text-gray-500 hover:text-gray-700 px-4 py-2"
          >
            취소
          </button>
        </div>

        <div className={`${cardClass} rounded-lg border p-6 space-y-4`}>
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              placeholder="이벤트 제목"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              rows={4}
              placeholder="이벤트 설명"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                이벤트 유형
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as any })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              >
                <option value="online">온라인</option>
                <option value="offline">오프라인</option>
                <option value="hybrid">하이브리드</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              >
                <option value="upcoming">예정</option>
                <option value="ongoing">진행중</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                시작일시 *
              </label>
              <input
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                종료일시
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              장소
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              placeholder="이벤트 장소"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                최대 참가자 수
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                placeholder="100"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                참가비 (원)
              </label>
              <input
                type="number"
                value={formData.registration_fee}
                onChange={(e) => setFormData({ ...formData, registration_fee: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
                placeholder="0"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                등록 마감일
              </label>
              <input
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              대표 이미지 URL
            </label>
            <input
              type="text"
              value={formData.featured_image_url}
              onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingEvent ? '수정' : '등록'}
            </button>
            <button
              onClick={() => setShowEditor(false)}
              className={`flex-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} ${textClass} px-4 py-2 rounded-lg hover:opacity-80 transition-opacity`}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>이벤트 관리</h2>
        <button
          onClick={handleNew}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          새 이벤트 등록
        </button>
      </div>

      {events.length === 0 ? (
        <div className={`${cardClass} rounded-lg border p-8 text-center`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            등록된 이벤트가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className={`${cardClass} rounded-lg border p-6`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${textClass} mb-2`}>{event.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {event.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      시작일: {new Date(event.start_date).toLocaleDateString('ko-KR')}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      유형: {event.event_type}
                    </span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      상태: {event.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(event)}
                    className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-700 px-3 py-1 rounded"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreatorsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [creators, setCreators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  React.useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .order('name');

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('크리에이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>크리에이터 관리</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          새 크리에이터 등록
        </button>
      </div>

      {creators.length === 0 ? (
        <div className={`${cardClass} rounded-lg border p-8 text-center`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            등록된 크리에이터가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((creator) => (
            <div key={creator.id} className={`${cardClass} rounded-lg border p-6`}>
              <div className="flex items-start gap-4">
                {creator.image_url && (
                  <img
                    src={creator.image_url}
                    alt={creator.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-lg font-semibold ${textClass}`}>{creator.name}</h3>
                    {creator.verified && (
                      <span className="text-blue-500" title="인증됨">✓</span>
                    )}
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                    {creator.profession}
                  </p>
                  <div className="flex gap-4 text-xs">
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      글 {creator.articles_count || 0}개
                    </span>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                      상태: {creator.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 text-blue-600 hover:text-blue-700 py-1 rounded text-sm">
                  수정
                </button>
                <button className="flex-1 text-red-600 hover:text-red-700 py-1 rounded text-sm">
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories(*)
        `)
        .order('order_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('카테고리 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>카테고리 관리</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          새 카테고리 추가
        </button>
      </div>

      {categories.length === 0 ? (
        <div className={`${cardClass} rounded-lg border p-8 text-center`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            등록된 카테고리가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className={`${cardClass} rounded-lg border p-6`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${textClass} mb-1`}>{category.name}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Slug: {category.slug}
                  </p>
                  {category.description && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded">
                    수정
                  </button>
                  <button className="text-red-600 hover:text-red-700 px-3 py-1 rounded">
                    삭제
                  </button>
                </div>
              </div>

              {category.subcategories && category.subcategories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm font-medium ${textClass} mb-2`}>
                    서브카테고리 ({category.subcategories.length}개)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub: any) => (
                      <span
                        key={sub.id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MediaContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  React.useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('미디어 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${textClass}`}>미디어 라이브러리</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          파일 업로드
        </button>
      </div>

      {media.length === 0 ? (
        <div className={`${cardClass} rounded-lg border p-8 text-center`}>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            업로드된 미디어가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className={`${cardClass} rounded-lg border overflow-hidden`}>
              {item.mime_type?.startsWith('image/') && item.file_path ? (
                <img
                  src={item.file_path}
                  alt={item.alt_text || item.original_name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
              )}
              <div className="p-3">
                <p className={`text-sm font-medium ${textClass} truncate`}>
                  {item.original_name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {item.mime_type}
                </p>
                {item.file_size && (
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(item.file_size / 1024).toFixed(1)} KB
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 text-xs text-blue-600 hover:text-blue-700 py-1">
                    수정
                  </button>
                  <button className="flex-1 text-xs text-red-600 hover:text-red-700 py-1">
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 광고 관리 컴포넌트
const AdvertisementsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    category_id: '',
    position: 'top' as 'top' | 'sidebar' | 'inline',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  // 카테고리 및 광고 로드
  React.useEffect(() => {
    loadCategories();
    loadAdvertisements();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
    if (data) {
      setCategories(data);
    }
  };

  const loadAdvertisements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          id,
          title,
          image_url,
          link_url,
          category_id,
          position,
          is_active,
          start_date,
          end_date,
          created_at,
          categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdvertisements(data || []);
    } catch (error) {
      console.error('광고 로드 오류:', error);
      alert('광고를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      category_id: ad.category_id || '',
      position: ad.position,
      is_active: ad.is_active,
      start_date: ad.start_date ? ad.start_date.substring(0, 16) : '',
      end_date: ad.end_date ? ad.end_date.substring(0, 16) : '',
    });
    setShowEditor(true);
  };

  const handleNew = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      category_id: '',
      position: 'top',
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      const adData = {
        title: formData.title,
        image_url: formData.image_url || null,
        link_url: formData.link_url || null,
        category_id: formData.category_id || null,
        position: formData.position,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingAd) {
        // 수정
        const { error } = await supabase
          .from('advertisements')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;
        alert('광고가 수정되었습니다.');
      } else {
        // 새 광고 생성
        const { error } = await supabase
          .from('advertisements')
          .insert(adData);

        if (error) throw error;
        alert('광고가 생성되었습니다.');
      }

      await loadAdvertisements();
      setShowEditor(false);
      setEditingAd(null);
    } catch (error: any) {
      console.error('광고 저장 오류:', error);
      alert(`광고 저장 실패: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 광고를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('광고가 삭제되었습니다.');
      await loadAdvertisements();
    } catch (error: any) {
      console.error('광고 삭제 오류:', error);
      alert(`광고 삭제 실패: ${error.message}`);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadAdvertisements();
    } catch (error: any) {
      console.error('광고 상태 변경 오류:', error);
      alert(`광고 상태 변경 실패: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold ${textClass}`}>광고 관리</h2>
        <button
          onClick={handleNew}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <span>+</span>
          새 광고 등록
        </button>
      </div>

      {showEditor ? (
        <div className={`${cardClass} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-6`}>
            {editingAd ? '광고 수정' : '새 광고 등록'}
          </h3>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                placeholder="광고 제목"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>이미지 URL</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                placeholder="https://example.com/ad-image.jpg"
              />
              {formData.image_url && (
                <div className="mt-2">
                  <img
                    src={formData.image_url}
                    alt="광고 미리보기"
                    className="h-32 rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>링크 URL</label>
              <input
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>카테고리</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                >
                  <option value="">전체 (모든 페이지)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>위치</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                >
                  <option value="top">상단</option>
                  <option value="sidebar">사이드바</option>
                  <option value="inline">인라인</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>시작일</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>종료일</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${inputClass}`}
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <span className={`text-sm ${textClass}`}>활성화</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingAd(null);
                }}
                className={`px-6 py-2 border rounded-lg transition-colors ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {advertisements.length === 0 ? (
            <div className={`${cardClass} rounded-lg border p-8 text-center`}>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                등록된 광고가 없습니다. 새 광고를 등록하세요.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {advertisements.map((ad) => (
                <div key={ad.id} className={`${cardClass} rounded-lg border p-6`}>
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${textClass}`}>{ad.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ad.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {ad.is_active ? '활성' : '비활성'}
                        </span>
                        {ad.categories && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {ad.categories.name}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ad.position === 'top' ? '상단' : ad.position === 'sidebar' ? '사이드바' : '인라인'}
                        </span>
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                        {ad.link_url && <p>링크: {ad.link_url}</p>}
                        {ad.start_date && (
                          <p>기간: {new Date(ad.start_date).toLocaleDateString('ko-KR')} ~ {ad.end_date ? new Date(ad.end_date).toLocaleDateString('ko-KR') : '종료일 없음'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleActive(ad.id, ad.is_active)}
                        className={`px-3 py-1 rounded text-sm ${
                          ad.is_active
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {ad.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleEdit(ad)}
                        className="px-3 py-1 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SettingsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClass = isDarkMode
    ? 'bg-gray-700 border-gray-600 text-gray-100'
    : 'bg-white border-gray-300 text-gray-900';

  const { data: settings, isLoading } = useHomepageSettings();
  const { data: categories = [] } = useCategories();
  const updateSettings = useUpdateHomepageSettings();

  const [formData, setFormData] = useState({
    total_slides: 5,
    article_slides: 3,
    ad_slides: 2,
    slide_categories: ['fashion', 'beauty', 'travel'],
    autoplay_enabled: true,
    autoplay_interval: 5000,
  });

  // 설정 로드 완료 시 폼 데이터 업데이트
  React.useEffect(() => {
    if (settings) {
      setFormData({
        total_slides: settings.total_slides,
        article_slides: settings.article_slides,
        ad_slides: settings.ad_slides,
        slide_categories: settings.slide_categories,
        autoplay_enabled: settings.autoplay_enabled,
        autoplay_interval: settings.autoplay_interval,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      alert('홈페이지 설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    }
  };

  const toggleCategory = (categorySlug: string) => {
    setFormData(prev => ({
      ...prev,
      slide_categories: prev.slide_categories.includes(categorySlug)
        ? prev.slide_categories.filter(c => c !== categorySlug)
        : [...prev.slide_categories, categorySlug]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className={`text-2xl font-bold ${textClass} mb-6`}>홈페이지 설정</h2>

      <div className="space-y-6">
        {/* 슬라이드 개수 설정 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>메인 슬라이드 설정</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                전체 슬라이드 수
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.total_slides}
                onChange={(e) => setFormData({ ...formData, total_slides: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                1-20개 사이
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                기사 슬라이드 수
              </label>
              <input
                type="number"
                min="0"
                max={formData.total_slides}
                value={formData.article_slides}
                onChange={(e) => setFormData({ ...formData, article_slides: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                최신 기사 표시
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textClass} mb-2`}>
                광고 슬라이드 수
              </label>
              <input
                type="number"
                min="0"
                max={formData.total_slides}
                value={formData.ad_slides}
                onChange={(e) => setFormData({ ...formData, ad_slides: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${inputClass}`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                활성 광고 표시
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              💡 기사 슬라이드 {formData.article_slides}개 + 광고 슬라이드 {formData.ad_slides}개 =
              총 {formData.article_slides + formData.ad_slides}개 슬라이드
              {formData.article_slides + formData.ad_slides > formData.total_slides && (
                <span className="text-red-500 font-semibold ml-2">
                  ⚠️ 전체 슬라이드 수({formData.total_slides})를 초과합니다!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 기사 카테고리 선택 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>슬라이드에 표시할 카테고리</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            선택한 카테고리의 최신 기사들이 슬라이드에 표시됩니다.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map(category => (
              <label
                key={category.id}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.slide_categories.includes(category.slug)
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : isDarkMode
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.slide_categories.includes(category.slug)}
                  onChange={() => toggleCategory(category.slug)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className={`text-sm font-medium ${textClass}`}>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 자동 재생 설정 */}
        <div className={`${cardClass} rounded-lg border p-6`}>
          <h3 className={`text-lg font-semibold ${textClass} mb-4`}>자동 재생 설정</h3>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.autoplay_enabled}
                onChange={(e) => setFormData({ ...formData, autoplay_enabled: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className={`text-sm font-medium ${textClass}`}>
                슬라이드 자동 재생 활성화
              </span>
            </label>

            {formData.autoplay_enabled && (
              <div>
                <label className={`block text-sm font-medium ${textClass} mb-2`}>
                  슬라이드 전환 간격 (밀리초)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={formData.autoplay_interval}
                  onChange={(e) => setFormData({ ...formData, autoplay_interval: parseInt(e.target.value) })}
                  className={`w-full md:w-64 px-3 py-2 border rounded-lg ${inputClass}`}
                />
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  현재: {formData.autoplay_interval / 1000}초마다 전환
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => settings && setFormData({
              total_slides: settings.total_slides,
              article_slides: settings.article_slides,
              ad_slides: settings.ad_slides,
              slide_categories: settings.slide_categories,
              autoplay_enabled: settings.autoplay_enabled,
              autoplay_interval: settings.autoplay_interval,
            })}
            className={`px-6 py-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={updateSettings.isPending || formData.article_slides + formData.ad_slides > formData.total_slides}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettings.isPending ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;