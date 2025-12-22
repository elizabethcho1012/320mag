import React, { useState, useEffect } from 'react';
import Footer from '../components/layout/Footer';
import AdBannerSlider from '../components/AdBannerSlider';
import { usePublishedArticles, useFeaturedArticles, useCreators } from '../hooks/useArticles';

interface HomePageProps {
  onArticleClick: (id: number | string) => void;
  isDarkMode: boolean;
  highContrast: boolean;
  onNavigate?: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onArticleClick, isDarkMode, highContrast, onNavigate }) => {
  // Supabase에서 실제 데이터 가져오기
  const { data: dbArticles = [], isLoading: articlesLoading, error: articlesError } = usePublishedArticles();
  const { data: dbFeaturedArticles = [], isLoading: featuredLoading } = useFeaturedArticles();
  const { data: dbCreators = [] } = useCreators();

  const bgClass = isDarkMode
    ? 'bg-gray-900'
    : highContrast
      ? 'bg-white'
      : 'bg-gray-50';

  // 로딩 상태
  if (articlesLoading || featuredLoading) {
    return (
      <div className={`${bgClass} transition-colors duration-300 min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            콘텐츠를 불러오고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (articlesError) {
    return (
      <div className={`${bgClass} transition-colors duration-300 min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-4`}>
            콘텐츠를 불러오는 중 오류가 발생했습니다.
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

  // DB 기사를 UI용으로 변환
  const transformArticle = (article: any) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt || '',
    image: article.featured_image_url,
    subcategory: article.subcategories?.name || article.categories?.name || 'ARTICLE',
    category: article.categories?.name || '',
    creator: article.creators?.name || article.author_name,
    publishedAt: article.published_at
  });

  // Featured 기사 (DB에서 featured=true인 것 또는 최근 3개)
  const featuredArticles = dbFeaturedArticles.length > 0
    ? dbFeaturedArticles.map(transformArticle)
    : dbArticles.slice(0, 3).map(transformArticle);

  // 이미 사용된 기사 ID 추적 (중복 방지)
  const usedArticleIds = new Set<string>();

  // Featured 기사 ID 추가
  featuredArticles.forEach(article => usedArticleIds.add(article.id));

  // 최신 기사 - 다양한 카테고리에서 골고루 선택 (중복 제거)
  const getLatestDiverseNews = () => {
    const categories = ['패션', '뷰티', '여행', '라이프스타일', '글로벌푸드', '건강푸드', '하우징', '글로벌트렌드', '심리', '섹슈얼리티', '운동'];
    const result: any[] = [];
    const categoryUsed = new Set<string>();

    // 각 카테고리에서 1개씩 가져오기 (이미 Featured에 사용된 건 제외)
    for (const article of dbArticles) {
      if (usedArticleIds.has(article.id)) continue;

      const categoryName = article.categories?.name;
      if (categoryName && !categoryUsed.has(categoryName) && categories.includes(categoryName)) {
        result.push(article);
        categoryUsed.add(categoryName);
        usedArticleIds.add(article.id);
        if (result.length >= 8) break;
      }
    }

    // 8개가 안 되면 남은 최신 기사로 채우기
    if (result.length < 8) {
      for (const article of dbArticles) {
        if (!usedArticleIds.has(article.id)) {
          result.push(article);
          usedArticleIds.add(article.id);
          if (result.length >= 8) break;
        }
      }
    }

    return result.map(transformArticle);
  };

  const latestNews = getLatestDiverseNews();

  // 카테고리별 기사 필터링 (중복 제거)
  const getArticlesByCategory = (categoryName: string) => {
    return dbArticles
      .filter(article => {
        // 카테고리가 일치하고 아직 사용되지 않은 기사만
        if (article.categories?.name === categoryName && !usedArticleIds.has(article.id)) {
          return true;
        }
        return false;
      })
      .slice(0, 4)
      .map(article => {
        usedArticleIds.add(article.id); // 사용된 기사 ID 추가
        return transformArticle(article);
      });
  };

  // 크리에이터 데이터 (DB에서만 가져오기, 로컬 폴백 제거)
  const creators = dbCreators;

  const contentSections = [
    {
      title: 'LATEST',
      items: latestNews
    },
    {
      title: 'FASHION',
      items: getArticlesByCategory('패션')
    },
    {
      title: 'BEAUTY',
      items: getArticlesByCategory('뷰티')
    },
    {
      title: 'TRAVEL',
      items: getArticlesByCategory('여행')
    },
    {
      title: 'LIFESTYLE',
      items: getArticlesByCategory('라이프스타일')
    },
    {
      title: 'GLOBAL FOOD',
      items: getArticlesByCategory('글로벌푸드')
    },
    {
      title: 'HEALTHY FOOD',
      items: getArticlesByCategory('건강푸드')
    },
    {
      title: 'HOUSING',
      items: getArticlesByCategory('하우징')
    },
    {
      title: 'GLOBAL TRENDS',
      items: getArticlesByCategory('글로벌트렌드')
    },
    {
      title: 'PSYCHOLOGY',
      items: getArticlesByCategory('심리')
    },
    {
      title: 'SEXUALITY',
      items: getArticlesByCategory('섹슈얼리티')
    },
    {
      title: 'FITNESS',
      items: getArticlesByCategory('운동')
    }
  ];

  return (
    <div className={`${bgClass} transition-colors duration-300`}>
      {/* 상단 광고 배너 */}
      <AdBannerSlider position="top" isDarkMode={isDarkMode} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Slide - Featured 기사들 표시 */}
        <HeroSlideLocal
          featuredArticles={featuredArticles}
          onArticleClick={onArticleClick}
          isDarkMode={isDarkMode}
        />

        {/* 카테고리별 콘텐츠 섹션 */}
        {contentSections.map((section, index) => (
          section.items.length > 0 && (
            <ContentSectionLocal
              key={index}
              title={section.title}
              items={section.items}
              onArticleClick={onArticleClick}
              isDarkMode={isDarkMode}
            />
          )
        ))}

        {/* 크리에이터 섹션 - DB에 등록된 크리에이터가 있을 때만 표시 */}
        {creators.length > 0 && (
          <CreatorsSectionLocal creators={creators} isDarkMode={isDarkMode} />
        )}
      </div>

      {/* 하단 광고 배너 */}
      <AdBannerSlider position="bottom" isDarkMode={isDarkMode} />

      <Footer isDarkMode={isDarkMode} onNavigate={onNavigate} />
    </div>
  );
};

// Hero Slide 컴포넌트
const HeroSlideLocal: React.FC<{
  featuredArticles: any[];
  onArticleClick: (id: number | string) => void;
  isDarkMode: boolean;
}> = ({ featuredArticles, onArticleClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  if (featuredArticles.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {featuredArticles.map((article) => (
            <div
              key={article.id}
              className="w-full flex-shrink-0 relative cursor-pointer"
              onClick={() => onArticleClick(article.id)}
            >
              <img
                src={article.image || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop'}
                alt={article.title}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 text-white">
                <div className="max-w-4xl text-center mx-auto">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                    {article.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {featuredArticles.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
            {featuredArticles.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-0.5 transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/70 w-3'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Content Section 컴포넌트
const ContentSectionLocal: React.FC<{
  title: string;
  items: any[];
  onArticleClick: (id: number | string) => void;
  isDarkMode: boolean;
}> = ({ title, items, onArticleClick, isDarkMode }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  
  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          {title}
        </h2>
        <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((article) => (
          <div key={article.id} className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
            <img
              src={article.image || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop'}
              alt={article.title}
              className="w-full h-48 object-contain mb-3 group-hover:opacity-90 transition-opacity rounded-lg bg-gray-100"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop';
              }}
            />
            <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
              {article.subcategory || 'ARTICLE'}
            </span>
            <h3 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
              {article.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

// Creators Section 컴포넌트
const CreatorsSectionLocal: React.FC<{
  creators: any[];
  isDarkMode: boolean;
  onCreatorClick?: (id: string) => void;
}> = ({ creators, isDarkMode, onCreatorClick }) => {
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';

  return (
    <section className="mb-16">
      <div className="flex items-center mb-8">
        <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          CREATORS
        </h2>
        <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {creators.slice(0, 4).map((creator) => (
          <div key={creator.id} className="cursor-pointer group">
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
              <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-2 block">
                {creator.specialty || creator.profession}
              </span>
              <h3 className={`text-base font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
                {creator.name}
              </h3>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {creator.profession}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomePage;