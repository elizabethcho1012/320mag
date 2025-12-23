import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownTrayIcon, GlobeAltIcon, ShareIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { DeviceMockup } from './DeviceMockup';
import { useTrackPWADownload } from '@/hooks/useTrackPWADownload';
import type { PWAApp } from '@/types/pwa.types';
import { toast } from 'sonner';

export interface PWAAppDetailsProps {
  app: PWAApp;
}

export function PWAAppDetails({ app }: PWAAppDetailsProps) {
  const navigate = useNavigate();
  const { mutateAsync: trackDownload } = useTrackPWADownload();
  const [isTracking, setIsTracking] = useState(false);

  const handleVisit = async () => {
    setIsTracking(true);
    try {
      await trackDownload(app.id);
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking download:', error);
      window.open(app.url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsTracking(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/apps/${app.id}`;
    const shareData = {
      title: app.name,
      text: app.description,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="relative z-10 flex items-start gap-6">
          {/* App Icon */}
          {app.icon ? (
            <img
              src={app.icon}
              alt={app.name}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-white/50 shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center ring-4 ring-white/50 shadow-2xl">
              <span className="text-white font-bold text-4xl">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* App Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {app.name}
            </h1>
            <p className="text-lg text-white/90 mb-3">
              {app.developer.name}
            </p>
            <div className="flex items-center gap-3 flex-wrap text-sm">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-medium">
                <ArrowDownTrayIcon className="h-4 w-4" />
                {app.downloadCount >= 1000
                  ? `${(app.downloadCount / 1000).toFixed(0)}K+ downloads`
                  : `${app.downloadCount} downloads`}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-medium">
                {app.category}
              </span>
              {app.pricing !== 'free' && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-medium capitalize">
                  {app.pricing}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleVisit}
          disabled={isTracking}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <GlobeAltIcon className="h-5 w-5" />
          Visit App
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
        >
          <ShareIcon className="h-5 w-5" />
          Share
        </button>
      </div>

      {/* Installation Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3">
          Installation Guide
        </h2>
        <ol className="text-sm text-blue-800 space-y-2 ml-5 list-decimal">
          <li>Click "Visit App" button above</li>
          <li>Look for install prompt or "Add to Home Screen" in browser menu</li>
          <li>Follow the prompts to install</li>
        </ol>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          About This App
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Target Audience & Pricing */}
      {(app.targetAudience || (app.pricing !== 'free' && app.price)) && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-4">
            {app.targetAudience && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Target Audience
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {app.targetAudience}
                </p>
              </div>
            )}
            {app.pricing !== 'free' && app.price && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Pricing
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200 capitalize">
                    {app.pricing}
                  </span>
                  <span className="text-gray-700">{app.price}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screenshots */}
      {app.screenshots && app.screenshots.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Screenshots
          </h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
              {app.screenshots.map((screenshot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '250px' }}
                >
                  <div className="transform scale-75">
                    <DeviceMockup
                      type="iphone"
                      screenshot={screenshot}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lighthouse Scores */}
      {app.lighthouseScore && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Performance Scores
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreBadge label="Performance" score={app.lighthouseScore.performance} />
            <ScoreBadge label="Accessibility" score={app.lighthouseScore.accessibility} />
            <ScoreBadge label="Best Practices" score={app.lighthouseScore.bestPractices} />
            <ScoreBadge label="SEO" score={app.lighthouseScore.seo} />
            <ScoreBadge label="PWA" score={app.lighthouseScore.pwa} />
          </div>
        </div>
      )}

      {/* Developer Info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Developer Information
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Name:</span> {app.developer.name}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Email:</span>{' '}
            <a
              href={`mailto:${app.developer.email}`}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              {app.developer.email}
            </a>
          </p>
          {app.developer.website && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Website:</span>{' '}
              <a
                href={app.developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {app.developer.website}
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Additional Information
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Category:</span> {app.category}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Status:</span>{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 capitalize">
              {app.status}
            </span>
          </p>
          {app.createdAt && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Published:</span>{' '}
              {new Date(app.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ScoreBadgeProps {
  label: string;
  score: number;
}

function ScoreBadge({ label, score }: ScoreBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="text-center">
      <div
        className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold mb-2 border-2 ${getColor(score)}`}
      >
        {score}
      </div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
    </div>
  );
}
