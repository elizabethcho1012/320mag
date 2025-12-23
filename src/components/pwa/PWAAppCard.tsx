import { ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { DeviceMockup } from './DeviceMockup';
import type { PWAApp } from '@/types/pwa.types';

export interface PWAAppCardProps {
  app: PWAApp;
  onClick?: (appId: string) => void;
}

export function PWAAppCard({ app, onClick }: PWAAppCardProps) {
  const mockupImage = app.screenshots?.[0] || app.icon;

  const isRecentlyUpdated = () => {
    if (!app.updatedAt) return false;
    const updatedDate = new Date(app.updatedAt);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return updatedDate > sevenDaysAgo;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(app.id);
    }
  };

  const downloadText = app.downloadCount >= 1000
    ? `${(app.downloadCount / 1000).toFixed(0)}K+`
    : app.downloadCount;

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl p-2 hover:bg-gray-100 transition-all duration-300 group relative overflow-hidden py-5 bg-white cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {isRecentlyUpdated() && (
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg animate-pulse">
            NEW
          </span>
        </div>
      )}

      <div className="relative z-10 mb-1 flex items-center justify-center overflow-hidden" style={{ height: '480px' }}>
        <div className="transform group-hover:scale-[0.679] transition-transform duration-300 scale-[0.647]">
          <DeviceMockup
            type="iphone"
            screenshot={mockupImage}
          />
        </div>
      </div>

      <div className="relative z-10 px-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-gray-900 truncate mb-0.5 group-hover:text-blue-600 transition-colors">
              {app.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <p className="text-[8px] text-gray-600">
                {app.developer.name}
              </p>
              {app.lighthouseScore?.pwa && (
                <div className="flex items-center gap-0.5">
                  <SparklesIcon className="h-3 w-3 text-blue-500" />
                  <span className="text-[8px] text-gray-600">{app.lighthouseScore.pwa}</span>
                </div>
              )}
              <div className="flex items-center gap-0.5">
                <ArrowDownTrayIcon className="h-3 w-3 text-gray-600" />
                <span className="text-[8px] text-gray-600">{downloadText}</span>
              </div>
            </div>
          </div>
          {app.icon && (
            <img
              src={app.icon}
              alt={app.name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-200 flex-shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
