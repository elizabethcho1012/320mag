import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAllPWAApps } from '@/services/pwaDatabase';
import { PWAAdminAppCard } from '@/components/pwa/PWAAdminAppCard';
import PWAAppDetailPage from './PWAAppDetailPage';

export default function PWAAdminPage() {
  const { user, isAdmin } = useAuth();
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const { data: apps, isLoading, refetch } = useQuery({
    queryKey: ['allPWAApps'],
    queryFn: getAllPWAApps,
    enabled: !!user && isAdmin,
  });

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            This page is only accessible to administrators
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
          <p className="mt-4 text-gray-600">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and review submitted PWA apps
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-gray-900">
              {apps?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Total Apps</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600">
              {apps?.filter(app => app.status === 'active' && !app.isHidden).length || 0}
            </div>
            <div className="text-sm text-gray-600">Active Apps</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {apps?.filter(app => app.status === 'hidden').length || 0}
            </div>
            <div className="text-sm text-gray-600">Hidden Apps</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-3xl font-bold text-orange-600">
              {apps?.filter(app => app.validationStatus === 'pending').length || 0}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
        </div>

        {/* Apps List */}
        {apps && apps.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Apps</h2>
            {apps.map((app) => (
              <PWAAdminAppCard
                key={app.id}
                app={app}
                onUpdate={refetch}
                onView={(appId) => setSelectedAppId(appId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <p className="text-gray-600">No apps found</p>
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
