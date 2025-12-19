import React, { useState } from 'react';
import { supabaseAny as supabase } from '../../lib/supabase';

interface CreatorRegistrationFormProps {
  isDarkMode: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreatorRegistrationForm: React.FC<CreatorRegistrationFormProps> = ({
  isDarkMode,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    bio: '',
    email: '',
    age: '',
    experience: '',
    specialty: '',
    image_url: '',
    instagram: '',
    youtube: '',
    blog: '',
    website: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputBgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorderClass = isDarkMode ? 'border-gray-600' : 'border-gray-300';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `creator-profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('이미지 업로드 에러:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // 필수 필드 검증
      if (!formData.name || !formData.profession || !formData.bio) {
        setError('이름, 직업, 자기소개는 필수 항목입니다.');
        setIsSubmitting(false);
        return;
      }

      // 이미지 업로드
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // 소셜 링크 구성
      const socialLinks: Record<string, string> = {};
      if (formData.instagram) socialLinks.instagram = formData.instagram;
      if (formData.youtube) socialLinks.youtube = formData.youtube;
      if (formData.blog) socialLinks.blog = formData.blog;
      if (formData.website) socialLinks.website = formData.website;

      // Supabase에 저장
      const { error: insertError } = await supabase
        .from('creators')
        .insert({
          name: formData.name,
          profession: formData.profession,
          bio: formData.bio,
          email: formData.email || null,
          age: formData.age ? parseInt(formData.age) : null,
          experience: formData.experience || null,
          specialty: formData.specialty || null,
          image_url: imageUrl || null,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
          verified: false,
          status: 'active',
        });

      if (insertError) {
        console.error('크리에이터 등록 에러:', insertError);
        setError('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        setIsSubmitting(false);
        return;
      }

      // 성공
      onSuccess();
      onClose();
    } catch (error) {
      console.error('크리에이터 등록 실패:', error);
      setError('등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${bgClass} rounded-2xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">크리에이터 등록</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-white/80">
            당신의 이야기를 Third Twenty 커뮤니티와 공유하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 프로필 이미지 */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
              프로필 이미지
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                  {formData.name[0] || '?'}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`flex-1 ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass}`}
              />
            </div>
            <p className={`mt-1 text-xs ${subtextClass}`}>
              또는 이미지 URL을 직접 입력하세요
            </p>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className={`mt-2 w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
          </div>

          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="홍길동"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                직업 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="패션 스타일리스트"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* 자기소개 */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
              자기소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              placeholder="자신을 소개하는 글을 작성해주세요 (최소 50자)"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
            <p className={`mt-1 text-xs ${subtextClass}`}>
              {formData.bio.length}자
            </p>
          </div>

          {/* 추가 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                이메일
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                나이
              </label>
              <input
                type="number"
                placeholder="50"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                경력
              </label>
              <input
                type="text"
                placeholder="10년"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${textClass}`}>
                전문 분야
              </label>
              <input
                type="text"
                placeholder="패션, 뷰티"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* 소셜 미디어 링크 */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${textClass}`}>
              소셜 미디어 링크
            </label>
            <div className="space-y-3">
              <input
                type="url"
                placeholder="Instagram URL (https://instagram.com/...)"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <input
                type="url"
                placeholder="YouTube URL (https://youtube.com/...)"
                value={formData.youtube}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <input
                type="url"
                placeholder="블로그 URL"
                value={formData.blog}
                onChange={(e) => setFormData({ ...formData, blog: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
              <input
                type="url"
                placeholder="웹사이트 URL"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className={`w-full ${inputBgClass} ${inputBorderClass} border rounded-lg px-4 py-2 ${textClass} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorRegistrationForm;
