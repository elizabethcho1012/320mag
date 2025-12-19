import React from 'react';
import { X } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (mode: boolean) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  fontSize, 
  setFontSize, 
  isDarkMode, 
  setIsDarkMode, 
  highContrast, 
  setHighContrast 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">접근성 설정</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            aria-label="설정 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              폰트 크기
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'small', label: '작게', size: 'text-sm' },
                { value: 'medium', label: '보통', size: 'text-base' },
                { value: 'large', label: '크게', size: 'text-lg' }
              ].map((size) => (
                <button
                  key={size.value}
                  onClick={() => setFontSize(size.value)}
                  className={`px-4 py-3 rounded-lg border transition-all duration-200 ${size.size} ${
                    fontSize === size.value
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  고대비 모드
                </label>
                <p className="text-xs text-gray-500">
                  텍스트와 배경의 대비를 높여 가독성을 향상시킵니다
                </p>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  highContrast ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                aria-label={`고대비 모드 ${highContrast ? '끄기' : '켜기'}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  다크모드
                </label>
                <p className="text-xs text-gray-500">
                  어두운 배경으로 눈의 피로를 줄입니다
                </p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-200'
                }`}
                aria-label={`다크모드 ${isDarkMode ? '끄기' : '켜기'}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          설정 적용
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;