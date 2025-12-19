// 음성 녹음 컴포넌트
// 시니어 친화적인 큰 버튼과 명확한 상태 표시

import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Pause, Play, Trash2, Check } from 'lucide-react';

interface VoiceRecorderProps {
  onComplete: (audioBlob: Blob, transcribedText: string, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onComplete, onCancel }: VoiceRecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    transcribedText,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    togglePause,
    cancelRecording,
    transcribe,
  } = useVoiceRecorder();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (audioBlob && transcribedText) {
      onComplete(audioBlob, transcribedText, duration);
    }
  };

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* 상태 표시 */}
        <div className="text-center">
          {isRecording ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-2xl font-bold">{formatDuration(duration)}</span>
              </div>
              <p className="text-gray-600">녹음 중... (최대 3분)</p>
            </div>
          ) : audioUrl ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold">녹음 완료 ({formatDuration(duration)})</p>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          ) : (
            <p className="text-lg text-gray-600">
              마이크 버튼을 눌러 녹음을 시작하세요
            </p>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="flex flex-col gap-3">
          {!isRecording && !audioUrl && (
            <Button
              size="lg"
              onClick={startRecording}
              className="h-16 text-lg gap-2"
            >
              <Mic className="w-6 h-6" />
              녹음 시작
            </Button>
          )}

          {isRecording && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={togglePause}
                className="h-16 text-lg gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="w-6 h-6" />
                    재개
                  </>
                ) : (
                  <>
                    <Pause className="w-6 h-6" />
                    일시정지
                  </>
                )}
              </Button>

              <Button
                size="lg"
                onClick={stopRecording}
                className="h-16 text-lg gap-2"
              >
                <Square className="w-6 h-6" />
                중지
              </Button>
            </div>
          )}

          {audioUrl && !transcribedText && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={cancelRecording}
                className="h-16 text-lg gap-2"
              >
                <Trash2 className="w-6 h-6" />
                다시 녹음
              </Button>

              <Button
                size="lg"
                onClick={transcribe}
                disabled={isTranscribing}
                className="h-16 text-lg gap-2"
              >
                {isTranscribing ? '변환 중...' : '텍스트 변환'}
              </Button>
            </div>
          )}

          {transcribedText && (
            <>
              {/* 변환된 텍스트 */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-sm text-gray-600 mb-2">변환된 텍스트:</p>
                <p className="text-base leading-relaxed">{transcribedText}</p>
              </div>

              {/* 완료/취소 버튼 */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onCancel}
                  className="h-16 text-lg"
                >
                  취소
                </Button>

                <Button
                  size="lg"
                  onClick={handleComplete}
                  className="h-16 text-lg gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-6 h-6" />
                  완료
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 안내 메시지 */}
        {!isRecording && !audioUrl && (
          <div className="text-center text-sm text-gray-500 space-y-1">
            <p>✓ 최대 3분까지 녹음 가능합니다</p>
            <p>✓ 녹음된 음성은 자동으로 텍스트로 변환됩니다</p>
            <p>✓ 변환된 텍스트를 수정할 수 있습니다</p>
          </div>
        )}
      </div>
    </Card>
  );
}
