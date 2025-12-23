import { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/outline';
import { PWAReportModal, PWAReportReason } from './PWAReportModal';
import { submitPWAReport } from '@/services/pwaDatabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface PWAReportButtonProps {
  appId: string;
  appName: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export function PWAReportButton({
  appId,
  appName,
  variant = 'icon',
  className = ''
}: PWAReportButtonProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = async (reason: PWAReportReason, comment?: string) => {
    if (!user) {
      toast.error('Please sign in to report apps');
      throw new Error('User not authenticated');
    }

    try {
      await submitPWAReport({
        appId,
        reportedBy: user.id,
        reason,
        comment,
      });
      toast.success('Report submitted successfully. Thank you for helping keep our directory safe!');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
      throw error;
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
        >
          <FlagIcon className="h-4 w-4" />
          Report
        </button>
        <PWAReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleReport}
          appName={appName}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`text-gray-400 hover:text-red-500 transition-colors ${className}`}
        title="Report"
        aria-label="Report"
      >
        <FlagIcon className="h-5 w-5" />
      </button>
      <PWAReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReport}
        appName={appName}
      />
    </>
  );
}
