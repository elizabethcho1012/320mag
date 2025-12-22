import React, { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';

interface InitialAd {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
}

const InitialAdPopup: React.FC = () => {
  const [ad, setAd] = useState<InitialAd | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    // 프리미엄 회원은 광고를 보지 않음
    if (profile?.is_premium) {
      return;
    }

    // 오늘 이미 광고를 봤는지 확인 (로컬 스토리지)
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('initialAdLastShown');

    if (lastShown === today) {
      return;
    }

    fetchInitialAd();
  }, [profile]);

  const fetchInitialAd = async () => {
    try {
      const { data, error } = await supabase
        .from('initial_ads')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;
      if (data) {
        setAd(data);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('초기 광고 로딩 실패:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // 오늘 날짜를 저장하여 오늘은 더 이상 보지 않음
    const today = new Date().toDateString();
    localStorage.setItem('initialAdLastShown', today);
  };

  const handleAdClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
    handleClose();
  };

  if (!isVisible || !ad) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
      <div className="relative max-w-2xl w-full mx-4">
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="광고 닫기"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 광고 이미지 */}
        <div
          className="bg-white rounded-lg overflow-hidden shadow-2xl cursor-pointer transform transition-transform hover:scale-105"
          onClick={handleAdClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="mt-4 flex justify-center gap-4 text-white text-sm">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialAdPopup;
