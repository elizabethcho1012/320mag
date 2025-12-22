import { useCallback, useState } from 'react';
import { PhotoIcon, XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export type ScreenshotItem = File | string;

export interface PWAScreenshotUploadProps {
  value: ScreenshotItem[];
  onChange: (files: ScreenshotItem[]) => void;
  featuredIndex?: number;
  onFeaturedChange?: (index: number) => void;
  maxFiles?: number;
  error?: string;
}

export function PWAScreenshotUpload({
  value,
  onChange,
  featuredIndex = 0,
  onFeaturedChange,
  maxFiles = 5,
  error,
}: PWAScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const setFeatured = useCallback(
    (index: number) => {
      if (onFeaturedChange) {
        onFeaturedChange(index);
      }
    },
    [onFeaturedChange]
  );

  const getImageUrl = useCallback((item: ScreenshotItem): string => {
    if (typeof item === 'string') {
      return item;
    }
    return URL.createObjectURL(item);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      const newFiles = [...value, ...droppedFiles].slice(0, maxFiles);
      onChange(newFiles);
    },
    [value, onChange, maxFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const newFiles = [...value, ...selectedFiles].slice(0, maxFiles);
        onChange(newFiles);
      }
    },
    [value, onChange, maxFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles);
      // If removed featured screenshot, set first as featured
      if (index === featuredIndex && newFiles.length > 0) {
        setFeatured(0);
      }
    },
    [value, onChange, featuredIndex, setFeatured]
  );

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Screenshots <span className="text-red-500">*</span>
        <span className="text-gray-500 font-normal ml-2">
          (2-{maxFiles} images, max 5MB each)
        </span>
      </label>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400',
          value.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label
            htmlFor="screenshot-upload"
            className={clsx(
              'cursor-pointer text-blue-600 hover:text-blue-700 font-medium',
              value.length >= maxFiles && 'pointer-events-none'
            )}
          >
            Upload screenshots
          </label>
          <input
            id="screenshot-upload"
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={value.length >= maxFiles}
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-1">
            or drag and drop
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          PNG, JPG, WebP up to 5MB each
        </p>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Preview */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {value.map((item, index) => {
            const isFile = item instanceof File;
            const fileName = isFile ? item.name : `Screenshot ${index + 1}`;
            const isFeatured = index === featuredIndex;

            return (
              <div key={index} className="relative group">
                <img
                  src={getImageUrl(item)}
                  alt={`Screenshot ${index + 1}`}
                  className={clsx(
                    "w-full h-32 object-cover rounded-lg border-2 transition-all",
                    isFeatured ? "border-yellow-400 ring-2 ring-yellow-400" : "border-transparent"
                  )}
                />
                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                    <StarIconSolid className="h-3 w-3" />
                    Main
                  </div>
                )}
                {/* Set as Main Button */}
                {!isFeatured && onFeaturedChange && (
                  <button
                    type="button"
                    onClick={() => setFeatured(index)}
                    className="absolute top-2 left-2 p-1 bg-white/90 text-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-50"
                    title="Set as main screenshot"
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                )}
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove screenshot"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
                <p className="mt-1 text-xs text-gray-500 truncate">
                  {fileName}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
