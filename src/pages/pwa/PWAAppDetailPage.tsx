import { usePWAAppDetails } from '@/hooks/usePWAAppDetails';
import { PWAAppDetails } from '@/components/pwa/PWAAppDetails';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PWAAppDetailPageProps {
  appId: string;
  onClose: () => void;
}

export default function PWAAppDetailPage({ appId, onClose }: PWAAppDetailPageProps) {
  const { data: app, isLoading, isError } = usePWAAppDetails(appId);

  if (isLoading) {
    return (
      <div className="p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="p-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            App Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The app you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
      >
        <XMarkIcon className="h-6 w-6 text-gray-600" />
      </button>

      {/* App Details */}
      <div className="p-8">
        <PWAAppDetails app={app} />
      </div>
    </div>
  );
}
