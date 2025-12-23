import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPWAApps } from '@/services/pwaDatabase';
import { PWAMyAppCard } from '@/components/pwa/PWAMyAppCard';
import PWAAppDetailPage from './PWAAppDetailPage';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface PWAMyAppsPageProps {
  onNavigateToSubmit: () => void;
}

export default function PWAMyAppsPage({ onNavigateToSubmit }: PWAMyAppsPageProps) {
  const { user, isAdmin } = useAuth();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const { data: apps, isLoading, refetch } = useQuery({
    queryKey: ['myPWAApps', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return getUserPWAApps(user.id);
    },
    enabled: !!user,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!apps) return { total: 0, active: 0, hidden: 0, pending: 0, totalDownloads: 0 };

    return {
      total: apps.length,
      active: apps.filter(app => app.status === 'active' && app.validationStatus === 'approved').length,
      hidden: apps.filter(app => app.status === 'hidden').length,
      pending: apps.filter(app => app.validationStatus === 'pending').length,
      totalDownloads: apps.reduce((sum, app) => sum + (app.downloadCount || 0), 0),
    };
  }, [apps]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view and manage your apps
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-16 w-16 rounded-full ring-4 ring-blue-100"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
                <p className="text-sm text-gray-600">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Apps</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Hidden</div>
            <div className="text-3xl font-bold text-gray-400">{stats.hidden}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Downloads</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalDownloads}</div>
          </div>
        </div>

        {/* Apps Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Apps</h2>
          <button
            onClick={onNavigateToSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Submit New App
          </button>
        </div>

        {apps && apps.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-6">You haven't submitted any apps yet</p>
            <button
              onClick={onNavigateToSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Submit Your First App
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {apps?.map((app) => (
              <PWAMyAppCard
                key={app.id}
                app={app}
                onUpdate={refetch}
                onView={(appId) => setSelectedAppId(appId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* App Detail Modal */}
      {selectedAppId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setSelectedAppId(null)}
            />
            <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <PWAAppDetailPage
                appId={selectedAppId}
                onClose={() => setSelectedAppId(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
