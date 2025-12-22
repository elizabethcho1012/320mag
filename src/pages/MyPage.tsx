import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabaseAny as supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { classifyOnPublish } from '../services/editorContentReview';

interface MyPageProps {
  isDarkMode: boolean;
  onBack: () => void;
}

interface UserArticle {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number | null;
  like_count: number | null;
  categories: {
    name: string;
  } | null;
}

const MyPage: React.FC<MyPageProps> = ({ isDarkMode, onBack }) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<'profile' | 'articles' | 'write'>('profile');
  const [myArticles, setMyArticles] = useState<UserArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditor, setIsEditor] = useState(false);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  // 에디터 권한 확인
  useEffect(() => {
    const checkEditorStatus = async () => {
      if (!profile) return;

      const { data } = await supabase
        .from('profiles')
        .select('is_editor')
        .eq('id', profile.id)
        .single();

      setIsEditor(data?.is_editor || false);
    };

    checkEditorStatus();
  }, [profile]);

  // 내 글 목록 로드
  const loadMyArticles = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          excerpt,
          content,
          status,
          created_at,
          updated_at,
          published_at,
          view_count,
          like_count,
          categories(name)
        `)
        .eq('created_by', profile.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMyArticles(data || []);
    } catch (error) {
      console.error('글 목록 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'articles') {
      loadMyArticles();
    }
  }, [currentTab, profile]);

  if (!profile) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex items-center justify-center`}>
        <div className={`${cardClass} rounded-xl border shadow-lg p-8 w-full max-w-md`}>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${textClass} mb-4`}>로그인이 필요합니다</h1>
            <p className={`text-sm ${subtextClass} mb-6`}>마이페이지를 이용하려면 로그인해주세요.</p>
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

  return (
    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${textClass} mb-2 tracking-widest`}
              style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}
            >
              MY PAGE
            </h1>
            <p className={subtextClass}>
              {profile.displayName || profile.username}님, 환영합니다!
              {isEditor && <span className="ml-2 text-purple-600 font-semibold">✍️ 에디터</span>}
            </p>
          </div>
          <button
            onClick={onBack}
            className={`px-4 py-2 border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} ${textClass} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            ← 메인으로
          </button>
        </div>

        {/* 탭 */}
        <div className={`${cardClass} rounded-lg border mb-6`}>
          <div className="flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}">
            <button
              onClick={() => setCurrentTab('profile')}
              className={`px-6 py-4 font-medium transition-colors ${
                currentTab === 'profile'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : `${textClass} hover:text-purple-600`
              }`}
            >
              프로필
            </button>
            {isEditor && (
              <>
                <button
                  onClick={() => setCurrentTab('articles')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    currentTab === 'articles'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : `${textClass} hover:text-purple-600`
                  }`}
                >
                  내 글 관리
                </button>
                <button
                  onClick={() => setCurrentTab('write')}
                  className={`px-6 py-4 font-medium transition-colors ${
                    currentTab === 'write'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : `${textClass} hover:text-purple-600`
                  }`}
                >
                  글쓰기
                </button>
              </>
            )}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="p-6">
            {currentTab === 'profile' && (
              <ProfileTab profile={profile} isDarkMode={isDarkMode} isEditor={isEditor} />
            )}

            {currentTab === 'articles' && isEditor && (
              <ArticlesTab
                articles={myArticles}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
                onRefresh={loadMyArticles}
              />
            )}

            {currentTab === 'write' && isEditor && (
              <WriteTab
                isDarkMode={isDarkMode}
                profile={profile}
                onSuccess={() => {
                  setCurrentTab('articles');
                  loadMyArticles();
                }}
              />
            )}
          </div>
        </div>

        {!isEditor && (
          <div className={`${cardClass} rounded-lg border p-6 text-center`}>
            <div className="text-5xl mb-4">✍️</div>
            <h3 className={`text-xl font-bold ${textClass} mb-2`}>에디터로 활동하고 싶으신가요?</h3>
            <p className={`${subtextClass} mb-4`}>
              에디터가 되면 직접 글을 작성하고 발행할 수 있습니다.
            </p>
            <button
              onClick={() => {
                // CREATORS 페이지로 이동
                onBack();
              }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              에디터 지원하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 프로필 탭
const ProfileTab: React.FC<{ profile: any; isDarkMode: boolean; isEditor: boolean }> = ({
  profile,
  isDarkMode,
  isEditor,
}) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
          {(profile.displayName || profile.username)[0].toUpperCase()}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${textClass}`}>{profile.displayName || profile.username}</h2>
          <p className={subtextClass}>{profile.email}</p>
          {isEditor && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
              ✍️ 에디터
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${subtextClass} mb-1`}>사용자명</p>
          <p className={`font-medium ${textClass}`}>{profile.username}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${subtextClass} mb-1`}>이메일</p>
          <p className={`font-medium ${textClass}`}>{profile.email}</p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${subtextClass} mb-1`}>역할</p>
          <p className={`font-medium ${textClass}`}>
            {profile.role === 'admin' ? '관리자' : profile.role === 'subscriber' ? '구독회원' : '일반회원'}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <p className={`text-sm ${subtextClass} mb-1`}>가입일</p>
          <p className={`font-medium ${textClass}`}>
            {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : '-'}
          </p>
        </div>
      </div>
    </div>
  );
};

// 내 글 관리 탭
const ArticlesTab: React.FC<{
  articles: UserArticle[];
  isLoading: boolean;
  isDarkMode: boolean;
  onRefresh: () => void;
}> = ({ articles, isLoading, isDarkMode, onRefresh }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${textClass}`}>내가 작성한 글 ({articles.length})</h3>
        <button
          onClick={onRefresh}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          새로고침
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className={subtextClass}>아직 작성한 글이 없습니다.</p>
        </div>
      ) : (
        articles.map((article) => (
          <div key={article.id} className={`${cardClass} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`text-lg font-semibold ${textClass}`}>{article.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      article.status === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {article.status === 'published' ? '발행됨' : '임시저장'}
                  </span>
                  {article.categories && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                      {article.categories.name}
                    </span>
                  )}
                </div>
                <p className={`text-sm ${subtextClass} mb-2`}>{article.excerpt}</p>
                <div className={`text-xs ${subtextClass} flex gap-4`}>
                  <span>조회수: {article.view_count || 0}</span>
                  <span>좋아요: {article.like_count || 0}</span>
                  <span>작성: {new Date(article.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// 글쓰기 탭
const WriteTab: React.FC<{
  isDarkMode: boolean;
  profile: any;
  onSuccess: () => void;
}> = ({ isDarkMode, profile, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClass = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      alert('본문을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 슬러그 생성
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) + '-' + Date.now();

      const { data: newArticle, error } = await supabase
        .from('articles')
        .insert({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200),
          slug,
          status,
          created_by: profile.id,
          published_at: status === 'published' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // 발행 시 AI 카테고리 분류 실행
      if (status === 'published' && newArticle) {
        alert('글이 발행되었습니다. AI가 자동으로 카테고리를 분류하고 있습니다...');

        // 백그라운드에서 AI 분류 실행 (에러가 나도 글 발행은 완료됨)
        classifyOnPublish(newArticle.id).catch((err) => {
          console.error('AI 분류 오류:', err);
          alert('글은 발행되었지만 자동 카테고리 분류에 실패했습니다. 관리자에게 문의하세요.');
        });
      } else {
        alert('임시저장되었습니다.');
      }

      setTitle('');
      setContent('');
      setExcerpt('');
      onSuccess();
    } catch (error: any) {
      console.error('글 작성 오류:', error);
      alert(`글 작성 실패: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium ${textClass} mb-2`}>제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full px-4 py-3 border ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
          placeholder="글 제목을 입력하세요"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textClass} mb-2`}>요약 (선택사항)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`w-full px-4 py-3 border ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
          rows={3}
          placeholder="글의 요약을 입력하세요 (입력하지 않으면 본문 앞부분이 자동으로 사용됩니다)"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium ${textClass} mb-2`}>본문 *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full px-4 py-3 border ${inputClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
          rows={15}
          placeholder="글 내용을 입력하세요..."
        />
      </div>

      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-900/50' : 'bg-purple-50 border border-purple-100'}`}>
        <h4 className={`font-medium ${textClass} mb-2 flex items-center gap-2`}>
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          안내
        </h4>
        <ul className={`text-sm ${subtextClass} space-y-1`}>
          <li>• 발행 시 AI가 자동으로 적절한 카테고리를 분류합니다</li>
          <li>• 임시저장한 글은 나중에 수정하여 발행할 수 있습니다</li>
          <li>• 발행된 글은 Third Twenty 메인 페이지에 게시됩니다</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit('draft')}
          disabled={isSubmitting}
          className={`flex-1 px-6 py-3 border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          } ${textClass} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50`}
        >
          임시저장
        </button>
        <button
          onClick={() => handleSubmit('published')}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '발행 중...' : '발행하기'}
        </button>
      </div>
    </div>
  );
};

export default MyPage;
