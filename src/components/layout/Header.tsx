import React, { useState } from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSettingsClick: () => void;
  isDarkMode: boolean;
  highContrast: boolean;
}

const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  onSearch,
  searchQuery,
  setSearchQuery,
  onSettingsClick,
  isDarkMode,
  highContrast,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Supabase Auth 연동
  const { profile, signIn, signUp, signOut, isAdmin, loading } = useAuth();

  const mainNavigation = [
    { id: 'beauty', label: 'BEAUTY' },
    { id: 'fashion', label: 'FASHION' },
    { id: 'food', label: 'FOOD' },
    { id: 'fitness', label: 'FITNESS' },
    { id: 'travel', label: 'TRAVEL' },
    { id: 'lifestyle', label: 'LIFESTYLE' },
    { id: 'housing', label: 'HOUSING' },
    { id: 'mind', label: 'MIND' },
    { id: 'sexuality', label: 'SEXUALITY' }
  ];

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const { error } = await signIn(loginForm.email, loginForm.password);

    if (error) {
      setErrorMessage(error.message === 'Invalid login credentials'
        ? '이메일 또는 비밀번호가 올바르지 않습니다.'
        : error.message);
    } else {
      setShowLogin(false);
      setLoginForm({ email: '', password: '' });
    }

    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (registerForm.password.length < 6) {
      setErrorMessage('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error } = await signUp(
      registerForm.email,
      registerForm.password,
      registerForm.username
    );

    if (error) {
      if (error.message.includes('already registered')) {
        setErrorMessage('이미 등록된 이메일입니다.');
      } else {
        setErrorMessage(error.message);
      }
    } else {
      setShowRegister(false);
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      alert('회원가입이 완료되었습니다! 이메일을 확인해 주세요.');
    }

    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage('home');
    setShowMenu(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
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

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'member': return '일반회원';
      case 'subscriber': return '구독회원';
      case 'admin': return '관리자';
      default: return '게스트';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'member': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'subscriber': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <>
      <header className={`${baseClasses} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* 왼쪽 - 돋보기 아이콘 */}
            <div className="w-16 flex justify-start">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                aria-label="검색"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* 중앙 - 브랜드 로고 */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setCurrentPage('home')}
                className={`text-2xl font-serif font-normal tracking-widest transition-colors duration-200 hover:text-purple-600 ${textClasses}`}
                style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}
              >
                THIRD TWENTY
              </button>
            </div>

            {/* 오른쪽 - 햄버거 메뉴 */}
            <div className="w-16 flex justify-end">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                }`}
                aria-label="메뉴"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* 햄버거 메뉴 드롭다운 */}
            {showMenu && (
              <div className={`absolute right-0 top-full mt-2 w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-xl z-50`}>
                <div className="py-4">
                  {/* 사용자 정보 영역 */}
                  {profile ? (
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${textClasses}`}>{profile.displayName || profile.username}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.email}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${getRoleBadgeColor(profile.role)}`}>
                          {getRoleDisplayName(profile.role)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setShowLogin(true);
                            setShowMenu(false);
                            setErrorMessage('');
                          }}
                          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          로그인
                        </button>
                        <button
                          onClick={() => {
                            setShowRegister(true);
                            setShowMenu(false);
                            setErrorMessage('');
                          }}
                          className={`w-full py-2 px-4 rounded-lg border transition-colors ${
                            isDarkMode
                              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          회원가입
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 메뉴 항목들 */}
                  <div className="px-2 py-2">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setCurrentPage('admin');
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>관리자 페이지</span>
                      </button>
                    )}

                    {profile && (
                      <button
                        onClick={() => {
                          alert('마이페이지 기능 준비 중입니다.');
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>마이페이지</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onSettingsClick();
                        setShowMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      <span>접근성 설정</span>
                    </button>

                    {profile && (
                      <button
                        onClick={handleLogout}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          isDarkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>로그아웃</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 네비게이션 */}
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
        </div>
      </header>

      {/* 검색 패널 */}
      {isSearchOpen && (
        <div className={`${baseClasses} border-b px-4 py-4`}>
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 로그인 모달 */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-xl p-8 w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${textClasses}`}>로그인</h2>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setErrorMessage('');
                }}
                className={`text-gray-500 hover:text-gray-700`}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>이메일</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="이메일 입력"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>비밀번호</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="비밀번호 입력"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                  setErrorMessage('');
                }}
                className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
              >
                계정이 없으신가요? 회원가입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원가입 모달 */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border shadow-xl p-8 w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${textClasses}`}>회원가입</h2>
              <button
                onClick={() => {
                  setShowRegister(false);
                  setErrorMessage('');
                }}
                className={`text-gray-500 hover:text-gray-700`}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>사용자명</label>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="사용자명 (닉네임)"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>이메일</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="이메일 주소"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>비밀번호</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="비밀번호 (6자 이상)"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${textClasses} mb-2`}>비밀번호 확인</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="비밀번호 재입력"
                />
              </div>

              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                  setErrorMessage('');
                }}
                className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} hover:underline`}
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
