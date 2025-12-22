import React from 'react';
import { Advertisement } from '../hooks/useAdvertisements';

interface AdBannerProps {
  advertisement: Advertisement | null;
  isDarkMode: boolean;
  position?: 'top' | 'sidebar' | 'inline';
}

const AdBanner: React.FC<AdBannerProps> = ({ advertisement, isDarkMode, position = 'top' }) => {
  // 광고가 없으면 렌더링하지 않음
  if (!advertisement) {
    return null;
  }

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';

  // 위치별 크기 설정
  const sizeClasses = {
    top: 'h-32 md:h-40',
    sidebar: 'h-64',
    inline: 'h-48',
  };

  const handleClick = () => {
    if (advertisement.link_url) {
      window.open(advertisement.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${bgClass} ${sizeClasses[position]} rounded-lg overflow-hidden relative group ${
        advertisement.link_url ? 'cursor-pointer' : ''
      } mb-6`}
    >
      {advertisement.image_url ? (
        <>
          <img
            src={advertisement.image_url}
            alt={advertisement.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
          {advertisement.link_url && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white font-medium bg-black/50 px-4 py-2 rounded-lg transition-opacity">
                광고 보기
              </span>
            </div>
          )}
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <div className="text-center">
            <p className="text-lg font-medium">{advertisement.title}</p>
            {advertisement.link_url && (
              <p className="text-sm mt-2 opacity-75">클릭하여 자세히 보기</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;
