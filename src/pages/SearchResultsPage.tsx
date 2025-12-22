import React from 'react';
import { X } from 'lucide-react';
import { useSearchArticles } from '../hooks/useArticles';

interface SearchResultsPageProps {
  searchQuery: string;
  onArticleClick: (id: number | string) => void;
  onClearSearch: () => void;
  isDarkMode: boolean;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ 
  searchQuery, 
  onArticleClick, 
  onClearSearch, 
  isDarkMode 
}) => {
  // Supabase에서 검색 결과 가져오기
  const { data: searchResults = [], isLoading, error } = useSearchArticles(searchQuery);

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-3xl font-bold ${textClass}`}>검색 결과</h1>
              <button
                onClick={onClearSearch}
                className={`text-sm hover:text-purple-600 transition-colors flex items-center ${subtextClass}`}
              >
                <X size={16} className="mr-1" />
                검색 취소
              </button>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <span className={`text-lg ${subtextClass}`}>
                "{searchQuery}" 검색 중...
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className={`text-lg ${textClass}`}>
                검색하고 있습니다...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-3xl font-bold ${textClass}`}>검색 결과</h1>
              <button
                onClick={onClearSearch}
                className={`text-sm hover:text-purple-600 transition-colors flex items-center ${subtextClass}`}
              >
                <X size={16} className="mr-1" />
                검색 취소
              </button>
            </div>
          </div>
          
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>
              검색 중 오류가 발생했습니다
            </h3>
            <p className={subtextClass}>
              잠시 후 다시 시도해주세요
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-3xl font-bold ${textClass}`}>검색 결과</h1>
            <button
              onClick={onClearSearch}
              className={`text-sm hover:text-purple-600 transition-colors flex items-center ${subtextClass}`}
            >
              <X size={16} className="mr-1" />
              검색 취소
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <span className={`text-lg ${subtextClass}`}>
              "{searchQuery}" 검색 결과 {searchResults.length}개
            </span>
          </div>
        </div>

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((article) => (
              <div
                key={article.id}
                className="cursor-pointer group"
                onClick={() => onArticleClick(article.id)}
              >
                <img
                  src={article.featured_image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'}
                  alt={article.title}
                  className="w-full h-48 object-contain mb-3 group-hover:opacity-90 transition-opacity rounded-lg bg-gray-100"
                />
                <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
                  {article.subcategories?.name || article.categories?.name || 'ARTICLE'}
                </span>
                <h3 className={`text-lg font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass} mb-2`}>
                  {article.title}
                </h3>
                <p className={`text-sm ${subtextClass} line-clamp-2 mb-2`}>
                  {article.excerpt}
                </p>
                <div className={`flex items-center text-xs ${subtextClass} space-x-3`}>
                  {article.creators && (
                    <span className="flex items-center">
                      <span className="mr-1">✍️</span>
                      {article.creators.name}
                    </span>
                  )}
                  <span className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    {article.read_time}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">📅</span>
                    {new Date(article.published_at).toLocaleDateString('ko-KR')}
                  </span>
                  {article.view_count && (
                    <span className="flex items-center">
                      <span className="mr-1">👁️</span>
                      {article.view_count.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>
              검색 결과가 없습니다
            </h3>
            <p className={`${subtextClass} mb-4`}>
              "{searchQuery}"와 관련된 아티클을 찾을 수 없습니다
            </p>
            <div className={`text-sm ${subtextClass}`}>
              <p className="mb-2">검색 팁:</p>
              <ul className="text-left inline-block space-y-1">
                <li>• 다른 키워드로 시도해보세요</li>
                <li>• 맞춤법을 확인해보세요</li>
                <li>• 더 간단한 단어를 사용해보세요</li>
                <li>• 카테고리 이름으로 검색해보세요 (패션, 뷰티, 컬처, 라이프스타일)</li>
              </ul>
            </div>
          </div>
        )}

        {/* 검색 통계 */}
        {searchResults.length > 0 && (
          <div className="mt-12 text-center">
            <div className={`inline-flex items-center space-x-6 text-sm ${subtextClass} bg-gray-100 ${isDarkMode ? 'bg-gray-800' : ''} px-6 py-3 rounded-lg`}>
              <span>총 {searchResults.length}개 기사</span>
              <span>•</span>
              <span>평균 읽기 시간: {Math.round(searchResults.reduce((acc, article) => acc + parseInt(article.read_time?.replace('분', '') || '5'), 0) / searchResults.length)}분</span>
              <span>•</span>
              <span>
                카테고리: {[...new Set(searchResults.map(article => article.categories?.name).filter(Boolean))].join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;