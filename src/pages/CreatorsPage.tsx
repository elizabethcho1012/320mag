import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCreators } from '../hooks/useArticles';
import { supabaseAny as supabase } from '../lib/supabase';
import CreatorRegistrationForm from '../components/creator/CreatorRegistrationForm';

interface CreatorsPageProps {
  isDarkMode: boolean;
  onCreatorClick?: (creatorId: string) => void;
}

// 크리에이터 타입 정의
type Creator = {
  id: string;
  name: string;
  profession: string;
  bio: string;
  image_url: string;
  email?: string;
  verified: boolean;
  status: string;
  age?: number;
  experience?: string;
  specialty?: string;
  social_links?: Record<string, string>;
  followers_count?: number;
  articles_count?: number;
};

// 크리에이터별 기사 수 조회
const useCreatorArticleCounts = () => {
  return useQuery({
    queryKey: ['creator-article-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('creator_id')
        .eq('status', 'published');

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((article: any) => {
        if (article.creator_id) {
          counts[article.creator_id] = (counts[article.creator_id] || 0) + 1;
        }
      });
      return counts;
    },
  });
};

// 크리에이터 카드 컴포넌트
const CreatorCard: React.FC<{
  creator: Creator;
  articleCount: number;
  isDarkMode: boolean;
  onClick: () => void;
}> = ({ creator, articleCount, isDarkMode, onClick }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const cardBgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div
      onClick={onClick}
      className={`${cardBgClass} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      {/* 프로필 이미지 */}
      <div className="relative h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
        {creator.image_url ? (
          <img
            src={creator.image_url}
            alt={creator.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="text-6xl font-bold text-white">
              {creator.name[0]}
            </span>
          </div>
        )}
        {creator.verified && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white p-2 rounded-full">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* 크리에이터 정보 */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className={`text-xl font-bold ${textClass} group-hover:text-purple-600 transition-colors`}>
              {creator.name}
            </h3>
            <p className={`text-sm ${subtextClass}`}>{creator.profession}</p>
          </div>
        </div>

        <p className={`text-sm ${subtextClass} line-clamp-2 mb-4`}>
          {creator.bio || '자기소개가 없습니다.'}
        </p>

        {/* 전문 분야 & 경력 */}
        {(creator.specialty || creator.experience) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {creator.specialty && (
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}
              >
                {creator.specialty}
              </span>
            )}
            {creator.experience && (
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {creator.experience}
              </span>
            )}
          </div>
        )}

        {/* 통계 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {articleCount}
            </p>
            <p className={`text-xs ${subtextClass}`}>기사</p>
          </div>
          {creator.followers_count !== undefined && (
            <div className="text-center">
              <p className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {creator.followers_count}
              </p>
              <p className={`text-xs ${subtextClass}`}>팔로워</p>
            </div>
          )}
          {creator.age && (
            <div className="text-center">
              <p className={`text-lg font-bold ${textClass}`}>{creator.age}</p>
              <p className={`text-xs ${subtextClass}`}>나이</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 크리에이터 상세 모달
const CreatorDetailModal: React.FC<{
  creator: Creator | null;
  articleCount: number;
  isDarkMode: boolean;
  onClose: () => void;
}> = ({ creator, articleCount, isDarkMode, onClose }) => {
  if (!creator) return null;

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const socialLinks = creator.social_links || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className={`${bgClass} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative">
          <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-500 relative">
            {creator.image_url && (
              <img
                src={creator.image_url}
                alt={creator.name}
                className="w-full h-full object-cover opacity-30"
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 프로필 사진 */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
            {creator.image_url ? (
              <img src={creator.image_url} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-bold text-white">{creator.name[0]}</span>
            )}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 space-y-6">
          {/* 기본 정보 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-3xl font-bold ${textClass}`}>{creator.name}</h2>
              {creator.verified && (
                <span className="text-purple-600">
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
            <p className={`text-xl ${subtextClass}`}>{creator.profession}</p>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {articleCount}
              </p>
              <p className={`text-sm ${subtextClass}`}>기사</p>
            </div>
            {creator.followers_count !== undefined && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {creator.followers_count}
                </p>
                <p className={`text-sm ${subtextClass}`}>팔로워</p>
              </div>
            )}
            {creator.age && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-3xl font-bold ${textClass}`}>{creator.age}</p>
                <p className={`text-sm ${subtextClass}`}>나이</p>
              </div>
            )}
          </div>

          {/* 자기소개 */}
          <div>
            <h3 className={`text-lg font-bold mb-2 ${textClass}`}>자기소개</h3>
            <p className={`${subtextClass} leading-relaxed`}>{creator.bio || '자기소개가 없습니다.'}</p>
          </div>

          {/* 전문 분야 & 경력 */}
          {(creator.specialty || creator.experience) && (
            <div className="grid md:grid-cols-2 gap-4">
              {creator.specialty && (
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${textClass}`}>전문 분야</h3>
                  <span
                    className={`inline-block px-4 py-2 rounded-full ${
                      isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {creator.specialty}
                  </span>
                </div>
              )}
              {creator.experience && (
                <div>
                  <h3 className={`text-lg font-bold mb-2 ${textClass}`}>경력</h3>
                  <p className={subtextClass}>{creator.experience}</p>
                </div>
              )}
            </div>
          )}

          {/* SNS 링크 */}
          {Object.keys(socialLinks).length > 0 && (
            <div>
              <h3 className={`text-lg font-bold mb-3 ${textClass}`}>소셜 미디어</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 이메일 */}
          {creator.email && (
            <div>
              <h3 className={`text-lg font-bold mb-2 ${textClass}`}>연락처</h3>
              <a
                href={`mailto:${creator.email}`}
                className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
              >
                {creator.email}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CreatorsPage: React.FC<CreatorsPageProps> = ({ isDarkMode }) => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: creators = [], isLoading, error } = useCreators();
  const { data: articleCounts = {} } = useCreatorArticleCounts();

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const handleRegistrationSuccess = () => {
    // 크리에이터 목록 새로고침
    queryClient.invalidateQueries({ queryKey: ['creators'] });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-lg ${textClass}`}>크리에이터를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
            크리에이터를 불러오는 중 오류가 발생했습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1
            className={`text-3xl font-bold mb-4 tracking-widest ${textClass}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}
          >
            CREATORS
          </h1>
          <p className={`text-lg ${subtextClass} max-w-2xl mx-auto mb-6`}>
            Third Twenty와 함께하는 크리에이터들을 만나보세요.
            <br />
            {creators.length}명의 전문가가 다양한 분야에서 활동하고 있습니다.
          </p>

          {/* 크리에이터 등록 버튼 */}
          <button
            onClick={() => setIsRegistrationFormOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            크리에이터 등록하기
          </button>
        </div>

        {/* 크리에이터 그리드 */}
        {creators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {creators.map((creator: any) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                articleCount={articleCounts[creator.id] || 0}
                isDarkMode={isDarkMode}
                onClick={() => setSelectedCreator(creator)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>아직 등록된 크리에이터가 없습니다</h3>
            <p className={subtextClass}>곧 다양한 크리에이터들이 참여할 예정입니다</p>
          </div>
        )}

        {/* 통계 */}
        {creators.length > 0 && (
          <div className={`text-center p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Third Twenty Creators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {creators.length}
                </p>
                <p className={subtextClass}>크리에이터</p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {creators.filter((c: any) => c.verified).length}
                </p>
                <p className={subtextClass}>인증됨</p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {Object.values(articleCounts).reduce((a: number, b: number) => a + b, 0)}
                </p>
                <p className={subtextClass}>발행 기사</p>
              </div>
              <div>
                <p className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {new Set(creators.map((c: any) => c.profession)).size}
                </p>
                <p className={subtextClass}>전문 분야</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedCreator && (
        <CreatorDetailModal
          creator={selectedCreator}
          articleCount={articleCounts[selectedCreator.id] || 0}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedCreator(null)}
        />
      )}

      {/* 등록 폼 모달 */}
      {isRegistrationFormOpen && (
        <CreatorRegistrationForm
          isDarkMode={isDarkMode}
          onClose={() => setIsRegistrationFormOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default CreatorsPage;
