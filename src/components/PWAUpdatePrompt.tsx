import React from 'react';
import { usePWA } from '../hooks/usePWA';
import { Button } from './ui/button';
import { X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const PWAUpdatePrompt: React.FC = () => {
  const { isOnline, offlineReady, needRefresh, updateApp, closePrompt } = usePWA();

  if (!offlineReady && !needRefresh && isOnline) {
    return null;
  }

  return (
    <>
      {/* 오프라인 상태 알림 */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <WifiOff className="h-5 w-5" />
          <span className="font-medium">오프라인 모드</span>
        </div>
      )}

      {/* 온라인 복구 알림 */}
      {isOnline && offlineReady && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Wifi className="h-5 w-5" />
          <span className="font-medium">온라인으로 연결되었습니다</span>
          <button
            onClick={closePrompt}
            className="ml-2 hover:bg-green-600 rounded p-1 transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 업데이트 알림 */}
      {needRefresh && (
        <div className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white p-4 rounded-lg shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <RefreshCw className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">새로운 버전 사용 가능</h3>
              <p className="text-sm text-purple-100 mb-3">
                320 매거진의 새로운 버전이 준비되었습니다.
                업데이트하여 최신 기능을 사용하세요.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={updateApp}
                  size="sm"
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  업데이트
                </Button>
                <Button
                  onClick={closePrompt}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-purple-700"
                >
                  나중에
                </Button>
              </div>
            </div>
            <button
              onClick={closePrompt}
              className="hover:bg-purple-700 rounded p-1 transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAUpdatePrompt;
