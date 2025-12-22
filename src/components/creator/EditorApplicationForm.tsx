import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseAny as supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface EditorApplicationFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditorApplicationForm: React.FC<EditorApplicationFormProps> = ({
  isDarkMode,
  onClose,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    applicationText: '',
    writingSamples: '',
    experience: '',
    specialty: '',
  });

  // 크리에이터 목록 가져오기
  const { data: creators = [] } = useQuery({
    queryKey: ['creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!formData.applicationText.trim()) {
      setError('지원 동기를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 에디터 신청 제출
      const { error: insertError } = await supabase
        .from('editor_applications')
        .insert({
          user_id: profile.id,
          creator_id: selectedCreatorId || null,
          application_text: formData.applicationText,
          writing_samples: formData.writingSamples || null,
          experience: formData.experience || null,
          specialty: formData.specialty || null,
          status: 'pending',
        });

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          setError('이미 에디터 신청을 하셨습니다.');
        } else {
          setError(insertError.message);
        }
        setIsSubmitting(false);
        return;
      }

      // 성공
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || '에디터 신청 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-white';
  const inputBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${bgClass} rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className={`sticky top-0 ${bgClass} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-6 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${textClass}`}>에디터 지원하기</h2>
              <p className={`text-sm ${subtextClass} mt-1`}>
                에디터가 되어 Third Twenty에 당신의 이야기를 공유하세요
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${subtextClass} hover:${textClass} transition-colors`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 지원 동기 */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              지원 동기 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.applicationText}
              onChange={(e) => setFormData({ ...formData, applicationText: e.target.value })}
              className={`w-full px-4 py-3 border ${inputBorderClass} ${inputBgClass} ${textClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]`}
              placeholder="Third Twenty의 에디터가 되고 싶은 이유를 작성해주세요..."
              required
            />
          </div>

          {/* 전문 분야 */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              전문 분야
            </label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className={`w-full px-4 py-2 border ${inputBorderClass} ${inputBgClass} ${textClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="예: 패션, 뷰티, 여행, 푸드 등"
            />
          </div>

          {/* 경력 */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              경력
            </label>
            <textarea
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className={`w-full px-4 py-3 border ${inputBorderClass} ${inputBgClass} ${textClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]`}
              placeholder="관련 경력이나 활동 내역을 작성해주세요..."
            />
          </div>

          {/* 글 샘플 */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              글 샘플 링크
            </label>
            <textarea
              value={formData.writingSamples}
              onChange={(e) => setFormData({ ...formData, writingSamples: e.target.value })}
              className={`w-full px-4 py-3 border ${inputBorderClass} ${inputBgClass} ${textClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]`}
              placeholder="작성하신 글의 링크를 입력해주세요 (여러 개인 경우 줄바꿈으로 구분)"
            />
          </div>

          {/* 크리에이터 선택 (선택사항) */}
          <div>
            <label className={`block text-sm font-medium ${textClass} mb-2`}>
              소속을 희망하는 크리에이터 (선택사항)
            </label>
            <select
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className={`w-full px-4 py-2 border ${inputBorderClass} ${inputBgClass} ${textClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
            >
              <option value="">선택 안 함</option>
              {creators.map((creator: any) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name} - {creator.profession}
                </option>
              ))}
            </select>
            <p className={`text-xs ${subtextClass} mt-1`}>
              특정 크리에이터의 에디터를 희망하시면 선택해주세요
            </p>
          </div>

          {/* 안내 문구 */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-900/50' : 'bg-purple-50 border border-purple-100'}`}>
            <h4 className={`font-medium ${textClass} mb-2 flex items-center gap-2`}>
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              에디터 역할 안내
            </h4>
            <ul className={`text-sm ${subtextClass} space-y-1 ml-7`}>
              <li>• 에디터로 승인되면 마이페이지에서 글을 작성할 수 있습니다</li>
              <li>• 작성한 글은 AI 검토를 거쳐 적절한 카테고리에 게시됩니다</li>
              <li>• 승인 결과는 이메일로 안내드립니다</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 border ${inputBorderClass} ${textClass} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '제출 중...' : '지원하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditorApplicationForm;
