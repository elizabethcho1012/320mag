import React from 'react';
import { useArticlesByCategory } from '../hooks/useArticles';
import ArticleCard from '../components/article/ArticleCard';

interface DailyNewsPageProps {
  onArticleClick: (id: number) => void;
  isDarkMode: boolean;
  highContrast: boolean;
}

export const DailyNewsPage: React.FC<DailyNewsPageProps> = ({
  onArticleClick,
  isDarkMode,
  highContrast
}) => {
  const { data: articles = [], isLoading } = useArticlesByCategory('데일리뉴스');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : highContrast ? 'text-black' : 'text-gray-900'}`}>
            데일리 뉴스
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : highContrast ? 'text-gray-700' : 'text-gray-600'}`}>
            매일 업데이트되는 시니어를 위한 뉴스와 정보
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onArticleClick={onArticleClick}
              isDarkMode={isDarkMode}
              highContrast={highContrast}
            />
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              아직 등록된 뉴스가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyNewsPage;