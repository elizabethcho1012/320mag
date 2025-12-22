import { useState } from 'react';
import { submitPWAApp, updatePWAApp } from '@/services/pwaDatabase';
import { uploadPWAScreenshots, uploadPWAIcon } from '@/services/pwaStorage';
import { useAuth } from '@/contexts/AuthContext';
import type { PWAAppSubmissionData } from '@/types/pwa.types';

export function useSubmitPWAApp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const { user } = useAuth();

  const submit = async (data: PWAAppSubmissionData & { icon: File }): Promise<string | null> => {
    setIsSubmitting(true);
    setSubmittedAppId(null);

    try {
      // Prepare developer object
      const developer = {
        name: data.developerName,
        email: data.developerEmail,
        ...(data.developerWebsite && { website: data.developerWebsite }),
      };

      // Prepare submission data
      const submissionData: any = {
        name: data.name,
        description: data.description,
        url: data.url,
        category: data.category,
        categories: data.additionalCategories || [],
        pricing: data.pricing,
        developer,
        screenshots: [],
        icon: '',
        ...(data.targetAudience && { targetAudience: data.targetAudience }),
        ...(data.price && { price: data.price }),
      };

      // Create the app document to get an ID
      if (!user) {
        throw new Error('User must be logged in to submit a PWA app');
      }
      const appId = await submitPWAApp(submissionData, user.id);

      // Upload icon and screenshots in parallel
      const [iconUrl, screenshotUrls] = await Promise.all([
        uploadPWAIcon(data.icon, appId),
        uploadPWAScreenshots(data.screenshots, appId),
      ]);

      // Update app with icon and screenshot URLs
      await updatePWAApp(appId, {
        icon: iconUrl,
        screenshots: screenshotUrls,
      });

      setSubmittedAppId(appId);
      return appId;
    } catch (error) {
      console.error('Error submitting PWA app:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submit,
    isSubmitting,
    submittedAppId,
  };
}
