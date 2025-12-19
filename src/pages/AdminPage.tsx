import React, { useState } from 'react';
import { supabaseAny as supabase } from '../lib/supabase';

interface AdminPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

type AdminMenuType = 'dashboard' | 'articles' | 'events' | 'creators' | 'categories' | 'media' | 'settings';

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
    { id: 'categories', label: '카테고리 관리', icon: '🏷️' },
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
          {currentMenu === 'categories' && <CategoriesContent isDarkMode={isDarkMode} />}
          {currentMenu === 'media' && <MediaContent isDarkMode={isDarkMode} />}
          {currentMenu === 'settings' && <SettingsContent isDarkMode={isDarkMode} />}
        </div>
      </div>
    </div>
  );
};

// 1. 대시보드 - Supabase 실제 데이터 연동
const DashboardContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    thisMonthEvents: 0,
    activeCreators: 0,
    recentArticles: [] as Array<{title: string, status: string, updatedAt: string, id: string}>,
    categoryStats: [] as Array<{category: string, count: number}>
  });
  const [isLoading, setIsLoading] = useState(true);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 실제 Supabase에서 기사 데이터 가져오기
        const { data: articles, error } = await supabase
          .from('articles')
          .select('id, title, status, published_at, updated_at, view_count, categories(name)')
          .order('published_at', { ascending: false });

        if (error) throw error;

        const published = articles?.filter((a: any) => a.status === 'published') || [];
        const drafts = articles?.filter((a: any) => a.status === 'draft') || [];
        const totalViews = articles?.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0) || 0;

        // 카테고리별 통계
        const categoryMap: Record<string, number> = {};
        articles?.forEach((a: any) => {
          const cat = a.categories?.name || '미분류';
          categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
        const categoryStats = Object.entries(categoryMap)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        // 최근 기사 (상위 5개)
        const recentArticles = (articles || []).slice(0, 5).map((a: any) => ({
          id: a.id,
          title: a.title,
          status: a.status,
          updatedAt: formatTimeAgo(a.updated_at || a.published_at)
        }));

        setStats({
          totalArticles: articles?.length || 0,
          publishedArticles: published.length,
          draftArticles: drafts.length,
          totalViews,
          thisMonthEvents: 0,
          activeCreators: 12, // AI 에디터 수
          recentArticles,
          categoryStats
        });
      } catch (error) {
        console.error('Dashboard data load error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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

  const dashboardStats = [
    { 
      label: '총 아티클', 
      value: stats.totalArticles.toString(), 
      change: '+12%', 
      icon: '📝',
      subtext: `발행: ${stats.publishedArticles} | 임시저장: ${stats.draftArticles}`
    },
    { 
      label: '총 조회수', 
      value: `${(stats.totalViews / 1000).toFixed(1)}K`, 
      change: '+8%', 
      icon: '👁️',
      subtext: '이번 달 조회수'
    },
    { 
      label: '이번달 이벤트', 
      value: stats.thisMonthEvents.toString(), 
      change: '+2', 
      icon: '🎉',
      subtext: '총 참가자 127명'
    },
    { 
      label: '활성 크리에이터', 
      value: stats.activeCreators.toString(), 
      change: '+3', 
      icon: '⭐',
      subtext: '이번 달 신규 3명'
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-2xl font-bold ${textClass}`}>대시보드</h2>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-2 h-2 bg-green-500 rounded-full animate-pulse`}></div>
          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>실시간 업데이트</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className={`${cardClass} rounded-lg border p-6 hover:shadow-lg transition-shadow`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">{stat.icon}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                stat.change.startsWith('+') 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {stat.change}
              </div>
            </div>
            <div className={`text-2xl font-bold ${textClass} mb-1`}>{stat.value}</div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {stat.label}
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {stat.subtext}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textClass}`}>최근 아티클</h3>
            <button className={`text-sm text-purple-600 hover:text-purple-700`}>
              전체보기 →
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentArticles.map((article, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${textClass} mb-1`}>{article.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${getStatusColor(article.status)}`}>
                      {getStatusLabel(article.status)}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {article.updatedAt}
                    </span>
                  </div>
                </div>
                <button className={`text-xs text-purple-600 hover:text-purple-700 ml-4`}>
                  편집
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`${cardClass} rounded-lg border p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textClass}`}>카테고리별 기사</h3>
          </div>
          <div className="space-y-3">
            {stats.categoryStats.length > 0 ? (
              stats.categoryStats.slice(0, 6).map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm ${textClass}`}>{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min((cat.count / stats.totalArticles) * 100 * 3, 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${textClass} w-8 text-right`}>{cat.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                아직 기사가 없습니다. AI 콘텐츠 파이프라인을 실행해보세요.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`${cardClass} rounded-lg border p-6 mt-6`}>
        <h3 className={`text-lg font-semibold ${textClass} mb-4`}>빠른 작업</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <span className="text-2xl mb-2">📝</span>
            <span className={`text-sm font-medium ${textClass}`}>새 아티클</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <span className="text-2xl mb-2">🎉</span>
            <span className={`text-sm font-medium ${textClass}`}>이벤트 생성</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <span className="text-2xl mb-2">👥</span>
            <span className={`text-sm font-medium ${textClass}`}>크리에이터 추가</span>
          </button>
          <button className="flex flex-col items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <span className="text-2xl mb-2">📊</span>
            <span className={`text-sm font-medium ${textClass}`}>분석 보기</span>
          </button>
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
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4`}>이벤트 관리</h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        이벤트 생성, 수정, 참가자 관리 기능이 구현될 예정입니다.
      </p>
    </div>
  );
};

const CreatorsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4`}>크리에이터 관리</h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        크리에이터 프로필 관리 및 콘텐츠 배정 기능이 구현될 예정입니다.
      </p>
    </div>
  );
};

const CategoriesContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4`}>카테고리 관리</h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        카테고리 및 서브카테고리 생성, 편집 기능이 구현될 예정입니다.
      </p>
    </div>
  );
};

const MediaContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4`}>미디어 라이브러리</h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        이미지, 비디오 업로드 및 관리 기능이 구현될 예정입니다.
      </p>
    </div>
  );
};

const SettingsContent: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  return (
    <div>
      <h2 className={`text-2xl font-bold ${textClass} mb-4`}>설정</h2>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        시스템 설정 및 사용자 권한 관리 기능이 구현될 예정입니다.
      </p>
    </div>
  );
};

export default AdminPage;