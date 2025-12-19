import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Newspaper, Users, Shirt, Sparkles, Palette, Coffee, ChevronUp } from 'lucide-react';

// 메인 네비게이션 데이터
const navigation = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'daily-news', label: '데일리뉴스', icon: Newspaper },
  { id: 'creators', label: '시니어크리에이터', icon: Users },
  { id: 'fashion', label: '패션', icon: Shirt },
  { id: 'beauty', label: '뷰티', icon: Sparkles },
  { id: 'culture', label: '컬처', icon: Palette },
  { id: 'lifestyle', label: '라이프스타일', icon: Coffee }
];

// 확장된 샘플 아티클 데이터
const sampleArticles = [
  {
    id: 1,
    title: "50대, 나만의 스타일을 찾다",
    category: "패션",
    subcategory: "CELEB STYLE",
    author: "김영희 (스타일리스트, 52세)",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop&ixlib=rb-4.0.3",
    excerpt: "20년간 스타일리스트로 일하며 깨달은 진짜 멋의 비밀. 나이가 들수록 진정한 아름다움이 무엇인지 알게 됩니다.",
    readTime: "5분",
    publishDate: "2024-08-15",
    featured: true,
    tags: ["스타일링", "시니어패션", "자신감"]
  },
  {
    id: 2,
    title: "자연스러운 아름다움의 재발견",
    category: "뷰티",
    subcategory: "SKINCARE",
    author: "박미경 (피부과 전문의, 48세)",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop&ixlib=rb-4.0.3",
    excerpt: "나이를 감추려 하지 말고, 나이와 함께 아름다워지는 법. 건강한 피부가 진짜 아름다움의 시작입니다.",
    readTime: "7분",
    publishDate: "2024-08-14",
    featured: true,
    tags: ["스킨케어", "안티에이징", "자연미"]
  },
  {
    id: 3,
    title: "책과 함께하는 인생 2막",
    category: "컬처",
    subcategory: "BOOKS",
    author: "이정수 (작가, 55세)",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&ixlib=rb-4.0.3",
    excerpt: "40대 후반에 시작한 글쓰기가 인생을 바꾼 이야기. 늦은 나이에 시작한 새로운 도전의 가치를 발견하다.",
    readTime: "6분",
    publishDate: "2024-08-13",
    featured: true,
    tags: ["독서", "글쓰기", "새로운시작"]
  },
  {
    id: 4,
    title: "우리집이 갤러리가 되는 순간",
    category: "라이프스타일",
    subcategory: "SPACE",
    author: "최현정 (인테리어 디자이너, 51세)",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&ixlib=rb-4.0.3",
    excerpt: "작은 변화로 집이 특별한 공간이 되는 인테리어 철학. 시니어에게 편안하면서도 아름다운 공간 만들기.",
    readTime: "8분",
    publishDate: "2024-08-12",
    featured: true,
    tags: ["인테리어", "라이프스타일", "공간디자인"]
  },
  {
    id: 5,
    title: "클래식한 워치의 매력",
    category: "패션",
    subcategory: "WATCH & JEWELRY",
    author: "정민호 (시계 컬렉터, 58세)",
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&h=600&fit=crop&ixlib=rb-4.0.3",
    excerpt: "30년간 수집한 시계들이 들려주는 시간의 가치. 진정한 명품이란 무엇인지에 대한 깊은 성찰.",
    readTime: "6분",
    publishDate: "2024-08-11",
    featured: true,
    tags: ["시계", "액세서리", "컬렉션"]
  },
  {
    id: 6,
    title: "50대를 위한 네일 아트의 세계",
    category: "뷰티",
    subcategory: "MAKE-UP & NAILS",
    author: "조혜진 (네일 아티스트, 46세)",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
    excerpt: "화려함보다는 품격, 젊음보다는 우아함. 시니어만의 세련된 뷰티 스타일을 제안합니다.",
    readTime: "4분",
    publishDate: "2024-08-10",
    featured: false,
    tags: ["네일아트", "메이크업", "품격"]
  },
  {
    id: 7,
    title: "미술관에서 찾은 새로운 영감",
    category: "컬처",
    subcategory: "ART & DESIGN",
    author: "한미영 (갤러리 디렉터, 49세)",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    excerpt: "예술과 함께하는 인생의 풍요로움을 발견하다. 미술 감상이 주는 깊은 만족감과 삶의 지혜.",
    readTime: "7분",
    publishDate: "2024-08-09",
    featured: false,
    tags: ["미술", "갤러리", "문화생활"]
  }
];

// 데일리뉴스 컨텐츠
const dailyNewsContent = [
  {
    id: 11,
    title: "시니어 창업, 새로운 기회의 문",
    category: "데일리뉴스",
    subcategory: "DAILY",
    author: "편집부",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    excerpt: "50세 이후 시작하는 새로운 사업의 성공 사례들과 노하우를 공유합니다.",
    readTime: "5분",
    publishDate: "2024-08-17",
    featured: false,
    tags: ["창업", "시니어", "경제활동"]
  },
  {
    id: 12,
    title: "건강한 노화를 위한 영양 가이드",
    category: "데일리뉴스",
    subcategory: "DAILY",
    author: "편집부",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop",
    excerpt: "시니어를 위한 균형 잡힌 식단과 영양소 섭취 방법을 전문가가 알려드립니다.",
    readTime: "6분",
    publishDate: "2024-08-16",
    featured: false,
    tags: ["건강", "영양", "식단"]
  }
];

// 전체 아티클 통합
const allArticles = [...sampleArticles, ...dailyNewsContent];

// 서브카테고리 매핑
const subcategoryMap = {
  "패션": ["ALL", "TRENDS", "CELEB STYLE", "WATCH & JEWELRY", "FASHION WEEK", "DESIGNERS"],
  "뷰티": ["ALL", "MAKE-UP & NAILS", "SKINCARE", "BODY & HAIR", "WELLNESS"],
  "컬처": ["ALL", "ENTERTAINMENT", "BOOKS", "ART & DESIGN", "별자리"],
  "라이프스타일": ["ALL", "FOOD", "PLACE", "TRAVEL", "CAR & TECH", "HOUSE", "SPACE", "SHOPPING"],
  "데일리뉴스": ["ALL", "DAILY", "EVENTS"]
};

// 시니어 크리에이터 데이터
const creators = [
  {
    id: 1,
    name: "김영희",
    profession: "스타일리스트",
    age: 52,
    experience: "20년 경력",
    specialty: "시니어 스타일링",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=300&h=300&fit=crop",
    bio: "2000년부터 연예인 스타일리스트로 활동하며, 50대 이후 시니어들의 진정한 아름다움을 찾는 일에 집중하고 있습니다.",
    articles: 3,
    followers: "2.1k",
    verified: true
  },
  {
    id: 2,
    name: "박미경",
    profession: "피부과 전문의",
    age: 48,
    experience: "15년 경력",
    specialty: "안티에이징",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
    bio: "자연스러운 노화와 건강한 피부 관리에 대한 의학적 접근을 통해 시니어들의 아름다움을 돕고 있습니다.",
    articles: 2,
    followers: "1.8k",
    verified: true
  },
  {
    id: 3,
    name: "이정수",
    profession: "작가",
    age: 55,
    experience: "10년 경력",
    specialty: "인생 에세이",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    bio: "40대 후반 뒤늦게 시작한 글쓰기로 많은 시니어들에게 용기와 희망을 전하고 있습니다.",
    articles: 1,
    followers: "950",
    verified: false
  },
  {
    id: 4,
    name: "최현정",
    profession: "인테리어 디자이너",
    age: 51,
    experience: "18년 경력",
    specialty: "시니어 공간 디자인",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    bio: "나이듦과 함께 변화하는 라이프스타일에 맞는 공간을 디자인하며, 집이 가장 편안한 쉼터가 되도록 돕습니다.",
    articles: 1,
    followers: "1.2k",
    verified: true
  }
];

// 설정 패널 컴포넌트
const SettingsPanel = ({ isOpen, onClose, fontSize, setFontSize, isDarkMode, setIsDarkMode, highContrast, setHighContrast }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">접근성 설정</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            aria-label="설정 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              폰트 크기
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'small', label: '작게', size: 'text-sm' },
                { value: 'medium', label: '보통', size: 'text-base' },
                { value: 'large', label: '크게', size: 'text-lg' }
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`px-4 py-3 rounded-lg border transition-all duration-200 ${size.size} ${
                    fontSize === size.value
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고대비 모드
                </label>
                <p className="text-xs text-gray-500">
                  텍스트와 배경의 대비를 높여 가독성을 향상시킵니다
                </p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  highContrast ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                aria-label={`고대비 모드 ${highContrast ? '끄기' : '켜기'}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  다크모드
                </label>
                <p className="text-xs text-gray-500">
                  어두운 배경으로 눈의 피로를 줄입니다
                </p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                aria-label={`다크모드 ${isDarkMode ? '끄기' : '켜기'}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          설정 적용
        </button>
      </div>
    </div>
  );
};

// 헤더 컴포넌트
const Header = ({ 
  currentPage, 
  setCurrentPage, 
  onSearch, 
  searchQuery, 
  setSearchQuery, 
  onSettingsClick,
  isDarkMode,
  highContrast 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const mainNavigation = [
    { id: 'fashion', label: 'FASHION' },
    { id: 'beauty', label: 'BEAUTY' },
    { id: 'culture', label: 'CULTURE' },
    { id: 'lifestyle', label: 'LIFESTYLE' },
    { id: 'creators', label: 'CREATORS' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setIsSearchOpen(false);
    }
  };

  const baseClasses = isDarkMode 
    ? 'bg-gray-900 border-gray-700' 
    : highContrast 
      ? 'bg-white border-black' 
      : 'bg-white border-gray-200';

  const textClasses = isDarkMode 
    ? 'text-white' 
    : highContrast 
      ? 'text-black' 
      : 'text-gray-900';

  return (
    <header className={`${baseClasses} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4 md:w-64">
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="아티클 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(e);
                    }
                  }}
                  className={`w-48 pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <svg className={`absolute left-3 top-2.5 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`text-2xl font-serif font-normal tracking-widest transition-colors duration-200 hover:text-purple-600 ${textClasses}`}
              style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}
            >
              THIRD TWENTY
            </button>
          </div>
          
          <div className="flex items-center space-x-2 md:w-64 justify-end">
            <button
              onClick={onSettingsClick}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
              aria-label="접근성 설정"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
              }`}
              aria-label="검색"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`border-t py-4 ${isDarkMode ? 'border-gray-700' : highContrast ? 'border-black' : 'border-gray-100'}`}>
          <nav className="flex justify-center space-x-12">
            {mainNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`text-xs font-light transition-colors duration-200 uppercase tracking-wide hover:text-purple-600 ${
                  currentPage === item.id 
                    ? 'text-purple-600 border-b-2 border-purple-600 pb-1' 
                    : isDarkMode 
                      ? 'text-gray-300' 
                      : highContrast 
                        ? 'text-black' 
                        : 'text-gray-700'
                }`}
                style={{ fontWeight: '300', fontSize: '0.7rem' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {isSearchOpen && (
          <div className={`md:hidden py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div>
              <input
                type="text"
                placeholder="아티클 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'border border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// 홈 페이지 컴포넌트
const HomePage = ({ onArticleClick, isDarkMode, highContrast }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredArticles = allArticles.filter(article => article.featured);
  
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [featuredArticles.length]);

  const bgClass = isDarkMode 
    ? 'bg-gray-900' 
    : highContrast 
      ? 'bg-white' 
      : 'bg-gray-50';

  const textClass = isDarkMode 
    ? 'text-gray-100' 
    : highContrast 
      ? 'text-black' 
      : 'text-gray-900';

  return (
    <div className={`${bgClass} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 히어로 슬라이드 */}
        <section className="mb-16">
          {featuredArticles.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {featuredArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="w-full flex-shrink-0 relative cursor-pointer"
                    onClick={() => onArticleClick(article.id)}
                  >
                    <img 
                      src={article.image}
                      alt={article.title}
                      className="w-full h-[500px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
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
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5">
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
          )}
        </section>

        {/* 카테고리별 섹션들 */}
        {[
          { title: 'DAILY NEWS', items: dailyNewsContent, key: 'dailyNews' },
          { title: 'FASHION', items: allArticles.filter(article => article.category === '패션'), key: 'fashion' },
          { title: 'BEAUTY', items: allArticles.filter(article => article.category === '뷰티'), key: 'beauty' },
          { title: 'CULTURE', items: allArticles.filter(article => article.category === '컬처'), key: 'culture' },
          { title: 'LIFESTYLE', items: allArticles.filter(article => article.category === '라이프스타일'), key: 'lifestyle' }
        ].map(section => (
          <section key={section.key} className="mb-16">
            <div className="flex items-center mb-8">
              <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
                  style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
                {section.title}
              </h2>
              <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {section.items.slice(0, 4).map((article) => (
                <div key={article.id} className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
                  <img 
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover mb-3 group-hover:opacity-90 transition-opacity"
                  />
                  <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
                    {article.subcategory}
                  </span>
                  <h3 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
                    {article.title}
                  </h3>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* 크리에이터 섹션 */}
        <section className="mb-16">
          <div className="flex items-center mb-8">
            <h2 className={`text-2xl font-bold tracking-widest ${textClass}`}
                style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
              CREATORS
            </h2>
            <div className={`flex-1 h-px ml-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creators.slice(0, 4).map((creator) => (
              <div key={creator.id} className="cursor-pointer group">
                <img 
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-48 object-cover mb-3 group-hover:opacity-90 transition-opacity"
                />
                <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
                  {creator.specialty}
                </span>
                <h3 className={`text-sm font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
                  {creator.name} • {creator.profession}
                </h3>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* 푸터 */}
      <footer className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-black'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h2 className={`text-3xl font-serif font-normal tracking-widest ${isDarkMode ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
              THIRD TWENTY
            </h2>
          </div>
          
          <div className="mb-8">
            <nav className="flex justify-center space-x-8 text-sm">
              <button className="hover:text-purple-600 transition-colors">
                정기구독
              </button>
              <button className="hover:text-purple-600 transition-colors">
                회사소개
              </button>
              <button className="hover:text-purple-600 transition-colors">
                광고/제휴
              </button>
              <button className="hover:text-purple-600 transition-colors">
                개인정보 처리방침
              </button>
              <button className="hover:text-purple-600 transition-colors">
                공지사항
              </button>
            </nav>
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            THIRDTWENTY.CO.KR IS OPERATED BY SENIOR LIFESTYLE MAGAZINE
          </div>
        </div>
      </footer>
    </div>
  );
};

// 서브카테고리 탭 컴포넌트
const SubcategoryTabs = ({ category, selectedSubcategory, onSubcategoryChange, isDarkMode, highContrast }) => {
  const subcategories = subcategoryMap[category] || ["ALL"];
  
  return (
    <div className="mb-8">
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : highContrast ? 'border-black' : 'border-gray-200'}`}>
        <nav className="-mb-px flex justify-center space-x-8 overflow-x-auto">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => onSubcategoryChange(subcategory)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs transition-colors duration-200 ${
                selectedSubcategory === subcategory
                  ? 'border-purple-500 text-purple-600'
                  : isDarkMode 
                    ? 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                    : highContrast 
                      ? 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {subcategory}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// 카테고리 페이지 컴포넌트
const CategoryPage = ({ category, onArticleClick, isDarkMode }) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState("ALL");
  
  const categoryArticles = allArticles.filter(article => {
    const matchesCategory = article.category === category;
    const matchesSubcategory = selectedSubcategory === "ALL" || article.subcategory === selectedSubcategory;
    return matchesCategory && matchesSubcategory;
  });

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  
  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold mb-4 tracking-widest ${textClass}`}
              style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
            {category === '패션' ? 'FASHION' :
             category === '뷰티' ? 'BEAUTY' :
             category === '컬처' ? 'CULTURE' :
             category === '라이프스타일' ? 'LIFESTYLE' :
             category === 'creators' ? 'CREATORS' : category}
          </h1>
        </div>
        
        <SubcategoryTabs 
          category={category}
          selectedSubcategory={selectedSubcategory}
          onSubcategoryChange={setSelectedSubcategory}
          isDarkMode={isDarkMode}
          highContrast={false}
        />
        
        {categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoryArticles.map((article) => (
              <div key={article.id} className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 object-cover mb-3 group-hover:opacity-90 transition-opacity"
                />
                <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-2 block">
                  {article.subcategory}
                </span>
                <h3 className={`text-lg font-bold leading-tight mb-2 group-hover:text-purple-600 transition-colors ${textClass}`}>
                  {article.title}
                </h3>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className={`mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-medium mb-2 ${textClass}`}>
              아직 준비된 아티클이 없습니다
            </h3>
            <p className={subtextClass}>
              {selectedSubcategory} 카테고리의 새로운 콘텐츠를 준비 중입니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 크리에이터 페이지
const CreatorsPage = ({ isDarkMode }) => {
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className={`${bgClass} min-h-screen transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold mb-4 tracking-widest ${textClass}`}
              style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
            CREATORS
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {creators.map((creator) => (
            <div key={creator.id} className={`${cardClass} rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer text-center`}>
              <div className="relative inline-block mb-4">
                <img 
                  src={creator.image}
                  alt={creator.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover"
                />
                {creator.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${textClass}`}>{creator.name}</h3>
              <p className="text-purple-600 font-medium mb-1">{creator.profession}</p>
              <p className={`text-sm mb-4 ${subtextClass}`}>{creator.experience} • {creator.age}세</p>
              
              <div className="mb-4">
                <span className={`inline-block text-xs px-3 py-1 rounded-full ${
                  isDarkMode 
                    ? 'bg-purple-900 text-purple-200' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {creator.specialty}
                </span>
              </div>
              
              <p className={`text-sm leading-relaxed mb-4 ${subtextClass}`}>{creator.bio}</p>
              
              <div className={`flex justify-between text-sm border-t pt-4 ${subtextClass} ${
                isDarkMode ? 'border-gray-600' : 'border-gray-200'
              }`}>
                <span>아티클 {creator.articles}개</span>
                <span>팔로워 {creator.followers}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 아티클 상세 페이지
const ArticleDetailPage = ({ articleId, onBack, isDarkMode }) => {
  const article = allArticles.find(a => a.id === parseInt(articleId));
  
  if (!article) {
    return (
      <div className={`max-w-4xl mx-auto px-4 py-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        아티클을 찾을 수 없습니다.
      </div>
    );
  }

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

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
              {article.subcategory}
            </span>
            <span className={`text-sm ${subtextClass}`}>•</span>
            <span className={`text-sm ${subtextClass}`}>{article.readTime}</span>
            <span className={`text-sm ${subtextClass}`}>•</span>
            <span className={`text-sm ${subtextClass}`}>{article.publishDate}</span>
          </div>
          
          <h1 className={`text-3xl md:text-4xl font-bold mb-6 leading-tight ${textClass}`}>
            {article.title}
          </h1>
          
          <p className={`text-xl mb-6 leading-relaxed ${subtextClass}`}>
            {article.excerpt}
          </p>
          
          <div className={`flex items-center space-x-4 pb-6 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-lg">
                  {article.author.split(' ')[0][0]}
                </span>
              </div>
              <div>
                <p className={`font-semibold ${textClass}`}>{article.author}</p>
                <p className={`text-sm ${subtextClass}`}>전문 기고자</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-8">
          <img 
            src={article.image}
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg"
          />
        </div>

        <article className="prose prose-lg max-w-none mb-12">
          <div className={`leading-relaxed space-y-6 ${textClass}`}>
            <p className="text-lg">
              전문가의 오랜 경험을 바탕으로 한 깊이 있는 이야기를 전해드립니다. 
              시니어 시기야말로 진정한 자신을 발견하고 새로운 도전을 할 수 있는 최고의 시기입니다.
            </p>
            
            <p>
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
            
            <p>
              마지막으로, 이 모든 과정에서 가장 중요한 것은 자신에 대한 믿음입니다. 
              여러분 모두가 자신만의 아름다운 이야기를 만들어가시길 바랍니다.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

// 검색 결과 페이지
const SearchResultsPage = ({ searchQuery, onArticleClick, onClearSearch, isDarkMode }) => {
  const searchResults = allArticles.filter(article => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(searchTerm) ||
      article.author.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.category.toLowerCase().includes(searchTerm) ||
      article.subcategory.toLowerCase().includes(searchTerm) ||
      (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  });

  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';

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
              <div key={article.id} className="cursor-pointer group" onClick={() => onArticleClick(article.id)}>
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover mb-3 group-hover:opacity-90 transition-opacity"
                />
                <span className="text-xs text-purple-600 uppercase tracking-wide font-medium mb-1 block">
                  {article.subcategory}
                </span>
                <h3 className={`text-lg font-bold leading-tight group-hover:text-purple-600 transition-colors ${textClass}`}>
                  {article.title}
                </h3>
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
            <p className={subtextClass}>
              "{searchQuery}"와 관련된 아티클을 찾을 수 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 맨 위로 스크롤 버튼 컴포넌트
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-6 bg-white border border-gray-300 text-gray-600 p-3 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300 z-40"
      title="맨 위로"
    >
      <ChevronUp size={20} />
    </button>
  );
};

// 메인 앱 컴포넌트
const ThirdTwentyApp = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [fontSize, setFontSize] = useState('medium');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const handleArticleClick = (articleId) => {
    setSelectedArticleId(articleId);
    setCurrentPage('article-detail');
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
    setCurrentPage('home');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    setCurrentPage('search');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setCurrentPage('home');
  };

  const handleBookmarkToggle = (articleId) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
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
      bookmarkedArticles,
      onBookmarkToggle: handleBookmarkToggle,
      isDarkMode,
      highContrast
    };

    switch (currentPage) {
      case 'home':
        return <HomePage {...pageProps} />;
      case 'creators':
        return <CreatorsPage isDarkMode={isDarkMode} />;
      case 'fashion':
        return <CategoryPage category="패션" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'beauty':
        return <CategoryPage category="뷰티" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'culture':
        return <CategoryPage category="컬처" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      case 'lifestyle':
        return <CategoryPage category="라이프스타일" onArticleClick={handleArticleClick} isDarkMode={isDarkMode} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${fontSizeClasses[fontSize]} ${
      isDarkMode ? 'bg-gray-900' : highContrast ? 'bg-white' : 'bg-gray-50'
    }`}>
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
        setFontSize={setFontSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />
    </div>
  );
};

export default ThirdTwentyApp;