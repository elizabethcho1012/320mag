import React from 'react';

interface FooterProps {
  isDarkMode: boolean;
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode, onNavigate }) => (
  <footer className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-black'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="mb-8">
        <h2 className={`text-3xl font-serif font-normal tracking-widest ${isDarkMode ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'Didot, "Bodoni MT", "Noto Serif Display", "URW Palladio L", P052, Sylfaen, serif' }}>
          THIRD TWENTY
        </h2>
      </div>
      
      <div className="mb-8">
        <nav className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm">
          <button
            onClick={() => onNavigate?.('subscription')}
            className="hover:text-purple-600 transition-colors"
          >
            정기구독
          </button>
          <button
            onClick={() => onNavigate?.('about')}
            className="hover:text-purple-600 transition-colors"
          >
            회사소개
          </button>
          <button
            onClick={() => onNavigate?.('advertise')}
            className="hover:text-purple-600 transition-colors"
          >
            광고/제휴
          </button>
          <button
            onClick={() => onNavigate?.('privacy')}
            className="hover:text-purple-600 transition-colors"
          >
            개인정보 처리방침
          </button>
          <button
            onClick={() => onNavigate?.('notices')}
            className="hover:text-purple-600 transition-colors"
          >
            공지사항
          </button>
        </nav>
      </div>

      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-2`}>
        <div>상호명: AGENE LIFESTYLE MAGAZINE</div>
        <div>웹사이트: www.320.kr</div>
        <div>이메일: 3rdtwenty@gmail.com</div>
        <div>설립: 2024년</div>
      </div>
    </div>
  </footer>
);

export default Footer;