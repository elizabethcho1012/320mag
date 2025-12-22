import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  position: 'top' | 'bottom';
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface AdBannerSliderProps {
  position: 'top' | 'bottom';
  isDarkMode?: boolean;
}

const AdBannerSlider: React.FC<AdBannerSliderProps> = ({ position, isDarkMode = false }) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, [position]);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5초마다 슬라이드 변경

    return () => clearInterval(interval);
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_banners')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('광고 배너 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner: AdBanner) => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className={`w-full ${position === 'top' ? 'h-32' : 'h-24'} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} animate-pulse`} />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden group">
      {/* 배너 이미지 */}
      <div
        className={`w-full ${position === 'top' ? 'h-32 sm:h-40 md:h-48' : 'h-24 sm:h-32'} cursor-pointer transition-transform duration-300 hover:scale-105`}
        onClick={() => handleBannerClick(currentBanner)}
      >
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 인디케이터 (배너가 2개 이상일 때만 표시) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      )}

      {/* 이전/다음 버튼 (배너가 2개 이상일 때만 표시, hover 시 나타남) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="이전 슬라이드"
          >
            ←
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % banners.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            aria-label="다음 슬라이드"
          >
            →
          </button>
        </>
      )}

      {/* 광고 라벨 */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        AD
      </div>
    </div>
  );
};

export default AdBannerSlider;
