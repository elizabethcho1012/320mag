// 챌린지 참여 폼
// 텍스트로 참여 가능

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { CreateChallengeRequest } from '@/types/ai-editor';

interface ChallengeFormProps {
  articleId: string;
  challengeQuestion: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChallengeForm({
  articleId,
  challengeQuestion,
  onSuccess,
  onCancel,
}: ChallengeFormProps) {
  const [textContent, setTextContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextSubmit = async () => {
    if (!textContent.trim()) {
      alert('내용을 입력해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다');
        return;
      }

      const challenge: CreateChallengeRequest = {
        article_id: articleId,
        participation_type: 'text',
        text_content: textContent.trim(),
      };

      const { error } = await supabase.from('challenges').insert(challenge);

      if (error) throw error;

      alert('챌린지에 참여했습니다!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting challenge:', error);
      alert('참여에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Card className="p-6 bg-purple-50 border-purple-200">
      <div className="space-y-6">
        {/* 챌린지 질문 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full mb-4">
            <span className="text-2xl">💭</span>
            <span className="font-semibold">챌린지</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{challengeQuestion}</h3>
        </div>

        {/* 텍스트 입력 */}
        <div className="space-y-4">
            <Textarea
              placeholder="당신의 생각을 자유롭게 적어주세요..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[200px] text-base p-4"
              maxLength={1000}
            />
            <div className="text-sm text-gray-500 text-right">
              {textContent.length} / 1000
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-14 text-base"
              >
                취소
              </Button>
              <Button
                size="lg"
                onClick={handleTextSubmit}
                disabled={isSubmitting || !textContent.trim()}
                className="h-14 text-base"
              >
                {isSubmitting ? '제출 중...' : '참여하기'}
              </Button>
            </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-white rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">💡 참여 팁</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>솔직하고 개인적인 경험을 공유해주세요</li>
            <li>다른 분들에게 도움이 될 수 있는 인사이트를 담아주세요</li>
            <li>긍정적이고 따뜻한 언어를 사용해주세요</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
