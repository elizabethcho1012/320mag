import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { audioRecorder, RecordingResult } from '../services/audioService';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface VoiceRecorderProps {
  challengeId: string;
  onSubmitSuccess?: () => void;
  maxDuration?: number; // in seconds
}

export const VoiceRecorder = ({
  challengeId,
  onSubmitSuccess,
  maxDuration = 120, // 2 minutes default
}: VoiceRecorderProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingResult, setRecordingResult] = useState<RecordingResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Check browser support
    if (!audioRecorder.isSupported()) {
      toast({
        title: '지원되지 않는 브라우저',
        description: '이 브라우저는 음성 녹음을 지원하지 않습니다.',
        variant: 'destructive',
      });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [toast]);

  const startRecording = async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        const currentDuration = audioRecorder.getCurrentDuration();
        setDuration(currentDuration);

        // Auto-stop if max duration reached
        if (currentDuration >= maxDuration) {
          stopRecording();
        }
      }, 100);
    } catch (error: any) {
      toast({
        title: '녹음 시작 실패',
        description: error.message || '마이크 접근 권한을 확인해주세요.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorder.stopRecording();
      setRecordingResult(result);
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: '녹음 완료',
        description: `${result.duration}초 녹음되었습니다.`,
      });
    } catch (error: any) {
      toast({
        title: '녹음 정지 실패',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !recordingResult) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const discardRecording = () => {
    if (recordingResult?.url) {
      URL.revokeObjectURL(recordingResult.url);
    }
    setRecordingResult(null);
    setDuration(0);
  };

  const uploadRecording = async () => {
    if (!recordingResult || !profile) return;

    setIsUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `challenge_${challengeId}_${profile.id}_${timestamp}.webm`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(filename, recordingResult.audioBlob, {
          contentType: recordingResult.audioBlob.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(filename);

      // Save challenge participation to database
      const { error: dbError } = await supabase
        .from('challenge_participations')
        .insert({
          challenge_id: challengeId,
          user_id: profile.id,
          audio_url: urlData.publicUrl,
          duration: recordingResult.duration,
        });

      if (dbError) throw dbError;

      toast({
        title: '제출 완료',
        description: '음성 녹음이 성공적으로 제출되었습니다!',
      });

      // Reset state
      discardRecording();

      // Callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: '제출 실패',
        description: error.message || '음성 녹음 제출 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>음성 녹음</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording controls */}
        {!recordingResult && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-4xl font-mono font-bold">
              {formatTime(duration)}
            </div>

            <Progress
              value={(duration / maxDuration) * 100}
              className="w-full"
            />

            <div className="text-sm text-muted-foreground">
              최대 {formatTime(maxDuration)}까지 녹음 가능
            </div>

            <Button
              size="lg"
              variant={isRecording ? 'destructive' : 'default'}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
              className="w-full"
            >
              {isRecording ? (
                <>
                  <Square className="mr-2 h-5 w-5" />
                  녹음 정지
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  녹음 시작
                </>
              )}
            </Button>
          </div>
        )}

        {/* Playback controls */}
        {recordingResult && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold">
                {formatTime(recordingResult.duration)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                녹음 완료
              </div>
            </div>

            <audio
              ref={audioRef}
              src={recordingResult.url}
              onEnded={handleAudioEnded}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={togglePlayback}
                className="flex-1"
                disabled={isUploading}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    재생
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={discardRecording}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={uploadRecording}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                '제출 중...'
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  제출하기
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
