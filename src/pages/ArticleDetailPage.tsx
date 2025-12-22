import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useArticleById, useRelatedArticles, usePrevNextArticles } from '../hooks/useArticles';
import { useArticleLikes, useArticleView, useArticleStats } from '../hooks/useArticleLikes';
import { useAuth } from '../contexts/AuthContext';
import { ChallengeForm } from '../components/challenge/ChallengeForm';
import { ChallengeCard } from '../components/challenge/ChallengeCard';
import { supabaseAny as supabase } from '../lib/supabase';
import type { Challenge } from '../types/ai-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticleDetailPageProps {
  articleId: string;
  onBack: () => void;
  onArticleClick?: (id: string) => void;
  isDarkMode: boolean;
}

// 챌린지 목록 조회 훅
const useChallenges = (articleId: string) => {
  return useQuery({
    queryKey: ['challenges', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          user_profile:user_profiles(*)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Challenge[];
    },
    enabled: !!articleId,
  });
};

const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ articleId, onBack, onArticleClick, isDarkMode }) => {
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [likedChallenges, setLikedChallenges] = useState<Set<string>>(new Set());
  const { profile } = useAuth();

  // ID로 기사 조회 (slug 대신)
  const { data: article, isLoading, error } = useArticleById(articleId);
  const { data: relatedArticles = [] } = useRelatedArticles(
    article?.id || '',
    article?.category_id || ''
  );
  const { data: challenges = [], refetch: refetchChallenges } = useChallenges(articleId);

  // 좋아요 및 조회수 기능
  const { likeCount, hasLiked, toggleLike, isToggling } = useArticleLikes(articleId);
  const { data: stats } = useArticleStats(articleId);
  useArticleView(articleId); // 조회수 자동 기록

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = () => {
    if (!profile) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    toggleLike();
  };

  // 이전글/다음글 조회
  const { data: prevNextData } = usePrevNextArticles(
    article?.id || '',
    article?.category_id || '',
    article?.published_at || ''
  );

  // 챌린지 좋아요 처리
  const handleLikeChallenge = async (challengeId: string) => {
    if (likedChallenges.has(challengeId)) {
      setLikedChallenges((prev) => {
        const next = new Set(prev);
        next.delete(challengeId);
        return next;
      });
    } else {
      setLikedChallenges((prev) => new Set(prev).add(challengeId));
    }
  };

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-lg ${textClass}`}>
            기사를 불러오고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태 또는 기사를 찾을 수 없음
  if (error || !article) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button 
            onClick={onBack}
            className={`flex items-center mb-8 transition-colors duration-200 hover:text-purple-600 ${subtextClass}`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>
          
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>
              아티클을 찾을 수 없습니다
            </h3>
            <p className={subtextClass}>
              요청하신 기사가 존재하지 않거나 삭제되었을 수 있습니다.
            </p>
            <button 
              onClick={onBack}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={onBack}
          className={`flex items-center mb-8 transition-colors duration-200 hover:text-purple-600 ${subtextClass}`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          뒤로가기
        </button>

        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-purple-600 uppercase tracking-wide font-medium">
              {article.subcategories?.name || article.categories?.name}
            </span>
            <span className={`text-sm ${subtextClass}`}>•</span>
            <span className={`text-sm ${subtextClass}`}>{article.read_time}</span>
            <span className={`text-sm ${subtextClass}`}>•</span>
            <span className={`text-sm ${subtextClass}`}>
              {new Date(article.published_at).toLocaleDateString('ko-KR')}
            </span>
            {article.view_count && (
              <>
                <span className={`text-sm ${subtextClass}`}>•</span>
                <span className={`text-sm ${subtextClass}`}>조회 {article.view_count.toLocaleString()}</span>
              </>
            )}
          </div>
          
          <h1 className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${textClass}`}>
            {article.title}
          </h1>
          
          <p className={`text-xl mb-6 leading-relaxed ${subtextClass}`}>
            {article.excerpt}
          </p>

          <div className={`flex items-center justify-between pb-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div>
                <p className={`font-semibold ${textClass}`}>
                  {article.editors?.name || 'Editor'}
                </p>
                <p className={`text-sm ${subtextClass}`}>
                  Editor
                </p>
              </div>
            </div>

            {/* 좋아요 버튼 및 통계 */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-sm ${subtextClass}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{stats?.view_count || article.view_count || 0}</span>
              </div>

              <button
                onClick={handleLikeClick}
                disabled={isToggling}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                  hasLiked
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{likeCount || article.like_count || 0}</span>
              </button>
            </div>
          </div>
        </header>

        {/* 메인 이미지 */}
        <div className="mb-8">
          <img
            src={article.featured_image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop'}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop';
            }}
          />
        </div>

        {/* 기사 본문 */}
        <article className={`prose prose-lg max-w-none mb-12 ${isDarkMode ? 'prose-invert' : ''}`}>
          <div className={`leading-relaxed ${textClass}`}>
            {article.content ? (
              // Markdown 콘텐츠 렌더링
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                }}
              >
                {article.content}
              </ReactMarkdown>
            ) : (
              // 기본 콘텐츠
              <>
                <p className="text-lg mb-4">
                  전문가의 오랜 경험을 바탕으로 한 깊이 있는 이야기를 전해드립니다.
                  시니어 시기야말로 진정한 자신을 발견하고 새로운 도전을 할 수 있는 최고의 시기입니다.
                </p>

                <p className="mb-4">
                  많은 사람들이 나이가 들면서 새로운 것을 시도하기를 주저합니다.
                  하지만 제가 경험한 바로는, 시니어 시기야말로 진정한 자신을 발견하고
                  새로운 도전을 할 수 있는 최고의 시기입니다.
                </p>

                <blockquote className={`border-l-4 border-purple-500 pl-6 py-2 my-8 ${
                  isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <p className={`text-lg font-medium italic ${textClass}`}>
                    "나이듦은 포기가 아니라 선택의 자유를 얻는 것입니다.
                    이제는 정말 소중한 것들에만 시간과 에너지를 쓸 수 있어요."
                  </p>
                </blockquote>

                <p className="mb-4">
                  마지막으로, 이 모든 과정에서 가장 중요한 것은 자신에 대한 믿음입니다.
                  여러분 모두가 자신만의 아름다운 이야기를 만들어가시길 바랍니다.
                </p>
              </>
            )}
          </div>
        </article>

        {/* 작성자 소개 (크리에이터인 경우) */}
        {article.creators && (
          <div className={`p-6 rounded-lg mb-12 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-100 flex-shrink-0">
                {article.creators.image_url ? (
                  <img
                    src={article.creators.image_url}
                    alt={article.creators.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xl">
                    {article.creators.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`text-lg font-bold ${textClass}`}>
                    {article.creators.name}
                  </h3>
                  {article.creators.verified && (
                    <span className="text-purple-600">✓</span>
                  )}
                </div>
                <p className={`text-sm ${subtextClass} mb-2`}>
                  {article.creators.profession}
                </p>
                {article.creators.bio && (
                  <p className={`text-sm ${subtextClass} leading-relaxed`}>
                    {article.creators.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 이전글/다음글 네비게이션 */}
        {(prevNextData?.prev || prevNextData?.next) && (
          <div className={`mb-12 border-t border-b py-6 ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 이전 글 */}
              <div className="flex">
                {prevNextData?.prev ? (
                  <button
                    onClick={() => onArticleClick && onArticleClick(prevNextData.prev.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all hover:bg-opacity-80 w-full text-left group ${
                      isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-6 h-6 ${isDarkMode ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-600'} transition-colors`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs mb-1 ${subtextClass}`}>
                        이전 글
                      </p>
                      <p className={`text-sm font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors ${textClass}`}>
                        {prevNextData.prev.title}
                      </p>
                    </div>
                    {prevNextData.prev.featured_image_url && (
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                        <img
                          src={prevNextData.prev.featured_image_url}
                          alt={prevNextData.prev.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=100&h=100&fit=crop';
                          }}
                        />
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="w-full"></div>
                )}
              </div>

              {/* 다음 글 */}
              <div className="flex">
                {prevNextData?.next ? (
                  <button
                    onClick={() => onArticleClick && onArticleClick(prevNextData.next.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all hover:bg-opacity-80 w-full text-right group ${
                      isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {prevNextData.next.featured_image_url && (
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                        <img
                          src={prevNextData.next.featured_image_url}
                          alt={prevNextData.next.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=100&h=100&fit=crop';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs mb-1 ${subtextClass}`}>
                        다음 글
                      </p>
                      <p className={`text-sm font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors ${textClass}`}>
                        {prevNextData.next.title}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-6 h-6 ${isDarkMode ? 'text-gray-400 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-600'} transition-colors`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <div className="w-full"></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 챌린지 섹션 */}
        {article.challenge_question && (
          <div className={`mb-12 p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full mb-4">
                <span className="text-xl">💭</span>
                <span className="font-semibold">챌린지에 참여하세요</span>
              </div>
              <h3 className={`text-xl font-bold ${textClass}`}>
                {article.challenge_question}
              </h3>
              <p className={`text-sm mt-2 ${subtextClass}`}>
                {challenges.length > 0 ? `${challenges.length}명이 참여했습니다` : '첫 번째로 참여해보세요!'}
              </p>
            </div>

            {!showChallengeForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowChallengeForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-full transition-colors"
                >
                  나의 생각 공유하기
                </button>
              </div>
            ) : (
              <ChallengeForm
                articleId={articleId}
                challengeQuestion={article.challenge_question}
                onSuccess={() => {
                  setShowChallengeForm(false);
                  refetchChallenges();
                }}
                onCancel={() => setShowChallengeForm(false)}
              />
            )}

            {/* 다른 참여자들의 챌린지 */}
            {challenges.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className={`text-lg font-bold ${textClass}`}>
                  다른 분들의 이야기
                </h4>
                {challenges.slice(0, 5).map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onLike={() => handleLikeChallenge(challenge.id)}
                    onReply={() => {}}
                    isLiked={likedChallenges.has(challenge.id)}
                  />
                ))}
                {challenges.length > 5 && (
                  <p className={`text-center ${subtextClass}`}>
                    +{challenges.length - 5}개의 참여가 더 있습니다
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 관련 기사 */}
        {relatedArticles.length > 0 && (
          <div className="mb-12">
            <h3 className={`text-xl font-bold mb-6 ${textClass}`}>
              관련 기사
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <div 
                  key={relatedArticle.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    // 관련 기사 클릭 시 새로운 기사로 이동
                    window.location.href = `#article-${relatedArticle.id}`;
                  }}
                >
                  <img
                    src={relatedArticle.featured_image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop'}
                    alt={relatedArticle.title}
                    className="w-full h-32 object-cover mb-3 group-hover:opacity-90 transition-opacity rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop';
                    }}
                  />
                  <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
                    {relatedArticle.categories?.[0]?.name}
                  </span>
                  <h4 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
                    {relatedArticle.title}
                  </h4>
                  {relatedArticle.creators && (
                    <p className={`text-xs ${subtextClass} mt-1`}>
                      {relatedArticle.creators?.[0]?.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;