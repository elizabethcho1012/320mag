import React, { useState } from 'react';
import { useArticlesByCategory, useCategories } from '../hooks/useArticles';
import { useAdvertisementsByCategory } from '../hooks/useAdvertisements';
import AdBanner from '../components/AdBanner';
interface CategoryPageProps {
  category: string;
  onArticleClick: (id: number | string) => void;
  isDarkMode: boolean;
}
const SubcategoryTabs: React.FC<{
  categorySlug: string;
  selectedSubcategory: string;
  onSubcategoryChange: (subcategory: string) => void;
  isDarkMode: boolean;
  highContrast: boolean;
}> = ({
  categorySlug,
  selectedSubcategory,
  onSubcategoryChange,
  isDarkMode,
  highContrast
}) => {
  const {
    data: categories = []
  } = useCategories();

  // 현재 카테고리의 서브카테고리 가져오기
  const currentCategory = categories.find(cat => cat.slug === getCategorySlug(categorySlug));
  const subcategories = currentCategory?.subcategories || [];

  // 이미 ALL이 있는지 확인하고 없으면 추가
  const hasAll = subcategories.some(sub => sub.name === 'ALL' || sub.slug === 'all');
  const allSubcategories = hasAll ? subcategories : [{
    name: 'ALL',
    slug: 'all'
  }, ...subcategories];

  return <div className="mb-8">
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : highContrast ? 'border-black' : 'border-gray-200'}`}>
        <nav className="-mb-px flex justify-center space-x-8 overflow-x-auto">
          {allSubcategories.map(subcategory => (
            <button
              key={subcategory.slug}
              onClick={() => onSubcategoryChange(subcategory.name)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedSubcategory === subcategory.name
                  ? `border-purple-600 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-300 hover:text-gray-100 hover:border-gray-300' : highContrast ? 'text-black hover:text-gray-700 hover:border-gray-700' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }`}
            >
              {subcategory.name}
            </button>
          ))}
        </nav>
      </div>
    </div>;
};

// 카테고리 이름을 슬러그로 변환하는 헬퍼 함수
const getCategorySlug = (categoryName: string): string => {
  const categoryMap: {
    [key: string]: string;
  } = {
    '패션': 'fashion',
    '뷰티': 'beauty',
    '여행': 'travel',
    '푸드': 'food',
    '심리': 'mind',        // Fixed: was 'psychology'
    '운동': 'fitness',     // Fixed: was 'exercise'
    '하우징': 'housing',
    '섹슈얼리티': 'sexuality'
  };
  return categoryMap[categoryName] || categoryName.toLowerCase();
};

// 카테고리 이름을 영어로 변환하는 헬퍼 함수
const getCategoryDisplayName = (categoryName: string): string => {
  const displayMap: {
    [key: string]: string;
  } = {
    '패션': 'FASHION',
    '뷰티': 'BEAUTY',
    '여행': 'TRAVEL',
    '푸드': 'FOOD',
    '심리': 'MIND',
    '운동': 'FITNESS',
    '하우징': 'HOUSING',
    '섹슈얼리티': 'SEXUALITY',
    'creators': 'CREATORS'
  };
  return displayMap[categoryName] || categoryName.toUpperCase();
};
const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  onArticleClick,
  isDarkMode
}) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 12; // 한 페이지에 12개씩 표시

  // Supabase에서 카테고리별 기사 가져오기
  const categorySlug = getCategorySlug(category);
  const { data: allCategoryArticles = [], isLoading, error } = useArticlesByCategory(categorySlug);

  // 카테고리 정보 가져오기 (광고용)
  const { data: categories = [] } = useCategories();
  const currentCategory = categories.find(cat => cat.slug === categorySlug);

  // 광고 가져오기
  const { data: topAdvertisement } = useAdvertisementsByCategory(currentCategory?.id || null, 'top');
  const { data: bottomAdvertisement } = useAdvertisementsByCategory(currentCategory?.id || null, 'bottom');

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  // 서브카테고리 변경 시 페이지를 1로 리셋
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1); // 페이지 리셋
  };

  // 로딩 상태
  if (isLoading) {
    return <div className={`${bgClass} min-h-screen transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-lg ${textClass}`}>
            {getCategoryDisplayName(category)} 콘텐츠를 불러오고 있습니다...
          </p>
        </div>
      </div>;
  }

  // 에러 상태
  if (error) {
    return <div className={`${bgClass} min-h-screen transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
            콘텐츠를 불러오는 중 오류가 발생했습니다.
          </p>
          <button onClick={() => window.location.reload()} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            새로고침
          </button>
        </div>
      </div>;
  }

  // 서브카테고리별 필터링
  const filteredArticles = allCategoryArticles.filter(article => {
    if (selectedSubcategory === "ALL") return true;
    return article.subcategories?.name === selectedSubcategory;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 변경 시 상단으로 스크롤
  };

  return <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        {/* 상단 광고 배너 */}
        {topAdvertisement && (
          <div className="mb-8">
            <AdBanner advertisement={topAdvertisement} isDarkMode={isDarkMode} position="top" />
          </div>
        )}

        {currentArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {currentArticles.map(article => (
                <div key={article.id} className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
                  <img
                    src={article.featured_image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'}
                    alt={article.title}
                    className="w-full h-64 object-contain mb-3 group-hover:opacity-90 transition-opacity rounded-lg bg-gray-100"
                  />
                  <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-2 block">
                    {article.subcategories?.name || 'ARTICLE'}
                  </span>
                  <h3 className={`text-lg font-bold leading-tight mb-2 group-hover:text-purple-600 transition-colors ${textClass} break-keep`}>
                    {article.title}
                  </h3>
                  <p className={`text-sm ${subtextClass} line-clamp-2 break-keep`}>
                    {article.excerpt}
                  </p>
                  <div className={`flex items-center mt-2 text-xs ${subtextClass}`}>
                    {article.creators && (
                      <span className="mr-4">
                        {article.creators.name}
                      </span>
                    )}
                    <span className="mr-4">{article.read_time}</span>
                    <span>{new Date(article.published_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mb-8">
                {/* 이전 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? `${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                      : `${isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`
                  }`}
                >
                  이전
                </button>

                {/* 페이지 번호 */}
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // 현재 페이지 주변 5개만 표시
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === pageNumber
                            ? 'bg-purple-600 text-white'
                            : `${isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 3 ||
                    pageNumber === currentPage + 3
                  ) {
                    return <span key={pageNumber} className={subtextClass}>...</span>;
                  }
                  return null;
                })}

                {/* 다음 버튼 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? `${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                      : `${isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`
                  }`}
                >
                  다음
                </button>
              </div>
            )}

            {/* 하단 광고 배너 */}
            {bottomAdvertisement && (
              <div className="mt-8">
                <AdBanner advertisement={bottomAdvertisement} isDarkMode={isDarkMode} position="bottom" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>
              {selectedSubcategory === 'ALL'
                ? `${getCategoryDisplayName(category)} 카테고리에 아직 준비된 아티클이 없습니다`
                : `${selectedSubcategory} 서브카테고리에 아직 준비된 아티클이 없습니다`
              }
            </h3>
            <p className={subtextClass}>
              새로운 콘텐츠를 준비 중입니다
            </p>
          </div>
        )}
      </div>
    </div>;
};
export default CategoryPage;
