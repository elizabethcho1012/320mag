import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { updatePWAApp } from '@/services/pwaDatabase';
import { toast } from 'sonner';
import type { PWAApp } from '@/types/pwa.types';

interface PWAAdminAppCardProps {
  app: PWAApp;
  onUpdate: () => void;
  onView: (appId: string) => void;
}

export function PWAAdminAppCard({ app, onUpdate, onView }: PWAAdminAppCardProps) {
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'hidden':
        return 'bg-gray-100 text-gray-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationColor = (validationStatus: string) => {
    switch (validationStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async () => {
    if (!confirm(`Approve "${app.name}"?`)) return;

    setLoading(true);
    try {
      await updatePWAApp(app.id, {
        validationStatus: 'approved',
        status: 'active',
        isHidden: false,
      });
      toast.success('App approved successfully');
      onUpdate();
    } catch (error) {
      console.error('Error approving app:', error);
      toast.error('Failed to approve app');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await updatePWAApp(app.id, {
        validationStatus: 'rejected',
        validationMessage: reason,
      });
      toast.success('App rejected');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting app:', error);
      toast.error('Failed to reject app');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* App Icon */}
          {app.icon && (
            <img
              src={app.icon}
              alt={app.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}

          {/* App Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <button
                onClick={() => onView(app.id)}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 truncate"
              >
                {app.name}
              </button>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                  app.status
                )}`}
              >
                {app.status}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getValidationColor(
                  app.validationStatus
                )}`}
              >
                {app.validationStatus}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {app.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📥 {app.downloadCount || 0} downloads</span>
              <span>📁 {app.category}</span>
              {app.developer && <span>👤 {app.developer.name}</span>}
            </div>

            {app.validationMessage && app.validationStatus === 'rejected' && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <strong>Rejection reason:</strong> {app.validationMessage}
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions */}
        {app.validationStatus === 'pending' && (
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
