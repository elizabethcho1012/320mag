import { useRef } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

export interface PWAIconUploadProps {
  value?: File | string | null;
  onChange: (file: File | string | null) => void;
  error?: string;
}

export function PWAIconUpload({ value, onChange, error }: PWAIconUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          onClick={handleClick}
          className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors overflow-hidden"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="App icon preview"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <PhotoIcon className="w-10 h-10 text-gray-400" />
          )}
        </div>

        {/* Info and actions */}
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">
            Upload app icon (512x512 recommended)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              {value ? 'Change' : 'Select'}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 text-sm text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
