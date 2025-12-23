import { useState } from 'react';
import { ArrowDownTrayIcon, EyeSlashIcon, TrashIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline';
import { hidePWAApp, restorePWAApp, deletePWAApp } from '@/services/pwaDatabase';
import { toast } from 'sonner';
import type { PWAApp } from '@/types/pwa.types';

export interface PWAMyAppCardProps {
  app: PWAApp;
  onUpdate: () => void;
  onView: (appId: string) => void;
}

export function PWAMyAppCard({ app, onUpdate, onView }: PWAMyAppCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleHide = async () => {
    if (!confirm('Are you sure you want to hide this app?')) return;

    setIsLoading(true);
    try {
      await hidePWAApp(app.id);
      toast.success('App hidden successfully');
      onUpdate();
    } catch (error) {
      console.error('Error hiding app:', error);
      toast.error('Failed to hide app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restorePWAApp(app.id);
      toast.success('App restored successfully');
      onUpdate();
    } catch (error) {
      console.error('Error restoring app:', error);
      toast.error('Failed to restore app');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) return;

    setIsLoading(true);
    try {
      await deletePWAApp(app.id);
      toast.success('App deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error deleting app:', error);
      toast.error('Failed to delete app');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (app.status === 'hidden') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Hidden
        </span>
      );
    }
    if (app.status === 'removed') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          Removed
        </span>
      );
    }
    if (app.status === 'active') {
      if (app.validationStatus === 'pending') {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            Pending Review
          </span>
        );
      }
      if (app.validationStatus === 'approved') {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            Active
          </span>
        );
      }
      if (app.validationStatus === 'rejected') {
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Rejected
          </span>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-4">
        {/* App Icon */}
        <div className="flex-shrink-0">
          {app.icon ? (
            <img
              src={app.icon}
              alt={app.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-gray-200">
              <span className="text-white font-bold text-2xl">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onView(app.id)}
              className="text-base font-semibold text-gray-900 hover:text-blue-600 truncate transition-colors"
            >
              {app.name}
            </button>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">
            {app.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span>{app.lighthouseScore?.pwa || 'N/A'}</span>
            </div>
            <span className="text-gray-300">·</span>
            <div className="flex items-center gap-1">
              <ArrowDownTrayIcon className="h-3.5 w-3.5" />
              <span>{app.downloadCount}</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="capitalize">{app.category}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {app.status === 'active' && (
            <button
              onClick={handleHide}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <EyeSlashIcon className="h-4 w-4" />
              Hide
            </button>
          )}

          {app.status === 'hidden' && (
            <button
              onClick={handleRestore}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Restore
            </button>
          )}

          {app.status !== 'removed' && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
