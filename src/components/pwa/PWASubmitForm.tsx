import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PWAScreenshotUpload } from './PWAScreenshotUpload';
import { PWAIconUpload } from './PWAIconUpload';
import { usePWACategories } from '@/hooks/usePWACategories';
import { useSubmitPWAApp } from '@/hooks/useSubmitPWAApp';
import { toast } from 'sonner';
import type { PWAAppSubmissionData } from '@/types/pwa.types';

export interface PWASubmitFormProps {
  onClose: () => void;
}

export function PWASubmitForm({ onClose }: PWASubmitFormProps) {
  const { data: categories } = usePWACategories();
  const { mutateAsync: submitApp, isPending } = useSubmitPWAApp();
  const [featuredScreenshotIndex, setFeaturedScreenshotIndex] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PWAAppSubmissionData>({
    defaultValues: {
      name: '',
      description: '',
      url: '',
      category: '',
      pricing: 'free',
      price: '',
      developerName: '',
      developerEmail: '',
      developerWebsite: '',
      icon: '',
      screenshots: [],
    },
  });

  const screenshots = watch('screenshots');
  const icon = watch('icon');
  const pricing = watch('pricing');

  const onSubmit = async (data: PWAAppSubmissionData) => {
    try {
      await submitApp({
        ...data,
        featuredScreenshot: screenshots[featuredScreenshotIndex],
      });
      toast.success('App submitted successfully! We will review it soon.');
      onClose();
    } catch (error) {
      toast.error('Failed to submit app. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Submit Your App</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* App Information */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">App Information</h3>

            <Controller
              name="name"
              control={control}
              rules={{ required: 'App name is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Awesome App"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...field}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your app..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="url"
              control={control}
              rules={{ required: 'App URL is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...field}
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://myapp.com"
                  />
                  {errors.url && (
                    <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="pricing"
              control={control}
              rules={{ required: 'Pricing is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...field}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="free">Free</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Paid</option>
                    <option value="subscription">Subscription</option>
                  </select>
                  {errors.pricing && (
                    <p className="mt-1 text-sm text-red-600">{errors.pricing.message}</p>
                  )}
                </div>
              )}
            />

            {pricing !== 'free' && (
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      {...field}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="$9.99/month"
                    />
                  </div>
                )}
              />
            )}
          </div>

          {/* Media */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">App Icon</h3>
              <PWAIconUpload
                value={icon}
                onChange={(file) => setValue('icon', file)}
                error={errors.icon?.message}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>
              <PWAScreenshotUpload
                value={screenshots}
                onChange={(files) => setValue('screenshots', files)}
                featuredIndex={featuredScreenshotIndex}
                onFeaturedChange={setFeaturedScreenshotIndex}
                error={errors.screenshots?.message}
              />
            </div>
          </div>

          {/* Developer Info */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Developer Information</h3>

            <Controller
              name="developerName"
              control={control}
              rules={{ required: 'Developer name is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Developer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                  {errors.developerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.developerName.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="developerEmail"
              control={control}
              rules={{ required: 'Developer email is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Developer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...field}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                  {errors.developerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.developerEmail.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="developerWebsite"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Developer Website
                  </label>
                  <input
                    {...field}
                    type="url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://johndoe.com"
                  />
                </div>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {isPending ? 'Submitting...' : 'Submit App'}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Your app will be reviewed by our team</li>
              <li>We'll validate the PWA requirements</li>
              <li>You'll receive an email notification</li>
              <li>Once approved, your app will be published</li>
            </ol>
          </div>
        </form>
      </div>
    </div>
  );
}
