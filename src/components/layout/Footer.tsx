import React from 'react';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => (
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
);

export default Footer;