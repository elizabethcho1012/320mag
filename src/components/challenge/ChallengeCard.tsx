// 챌린지 참여 카드 컴포넌트
// 다른 사용자들의 챌린지 참여 내용 표시

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { CHALLENGE_LEVELS } from '@/types/ai-editor';
import type { Challenge } from '@/types/ai-editor';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ChallengeCardProps {
  challenge: Challenge;
  onLike: () => void;
  onReply: () => void;
  isLiked: boolean;
}

export function ChallengeCard({
  challenge,
  onLike,
  onReply,
  isLiked,
}: ChallengeCardProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const userLevel =
    challenge.user_profile?.challenge_level || 'newcomer';
  const levelInfo = CHALLENGE_LEVELS[userLevel];

  const formatVoiceDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = () => {
    if (challenge.voice_url) {
      const audio = new Audio(challenge.voice_url);
      audio.play();
      setIsPlayingAudio(true);

      audio.onended = () => {
        setIsPlayingAudio(false);
      };
    }
  };

  return (
    <Card className={`p-6 ${challenge.is_featured ? 'border-2 border-purple-500 bg-purple-50/30' : ''}`}>
      <div className="space-y-4">
        {/* 헤더: 사용자 정보 */}
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={challenge.user_profile?.avatar_url || undefined} />
            <AvatarFallback>
              {challenge.user_profile?.display_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg">
                {challenge.user_profile?.display_name || '익명'}
              </span>
              {challenge.user_profile?.age && (
                <span className="text-gray-500">
                  {challenge.user_profile.age}세
                </span>
              )}
              <Badge variant="secondary" className="gap-1">
                {levelInfo.icon} {levelInfo.label}
              </Badge>
            </div>

            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(challenge.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </div>

          {challenge.is_featured && (
            <Badge className="bg-purple-600">에디터 추천</Badge>
          )}
        </div>

        {/* 음성 플레이어 (음성 챌린지인 경우) */}
        {challenge.participation_type === 'voice' && challenge.voice_url && (
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full w-12 h-12"
                onClick={handlePlayAudio}
              >
                {isPlayingAudio ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-8 flex items-center gap-1">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-purple-400 rounded-full"
                        style={{
                          height: `${Math.random() * 32}px`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {formatVoiceDuration(challenge.voice_duration || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 텍스트 내용 */}
        <div className="prose prose-sm max-w-none">
          <p className="text-base leading-relaxed text-gray-800">
            {challenge.text_content}
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLike}
            className={`gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-semibold">{challenge.likes_count}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="gap-2 text-gray-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">{challenge.replies_count}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
