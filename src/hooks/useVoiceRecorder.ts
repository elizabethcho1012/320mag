// 음성 녹음 커스텀 훅
// Web Audio API를 사용한 음성 녹음 및 Whisper API 변환

import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '@/lib/openai';

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  transcribedText: string | null;
  isTranscribing: boolean;
  error: string | null;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    transcribedText: null,
    isTranscribing: false,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * 녹음 시작
   */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        setState((prev) => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
        }));

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();

      // 타이머 시작 (최대 3분)
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

        setState((prev) => ({ ...prev, duration: elapsed }));

        // 3분 제한
        if (elapsed >= 180) {
          stopRecording();
        }
      }, 1000);

      setState((prev) => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
      }));
    } catch (error) {
      console.error('Error starting recording:', error);
      setState((prev) => ({
        ...prev,
        error: '마이크 권한이 필요합니다.',
      }));
    }
  }, []);

  /**
   * 녹음 중지
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state.isRecording]);

  /**
   * 녹음 일시정지/재개
   */
  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (state.isPaused) {
      mediaRecorderRef.current.resume();
      startTimeRef.current = Date.now() - state.duration * 1000;

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setState((prev) => ({ ...prev, duration: elapsed }));

        if (elapsed >= 180) {
          stopRecording();
        }
      }, 1000);

      setState((prev) => ({ ...prev, isPaused: false }));
    } else {
      mediaRecorderRef.current.pause();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, [state.isPaused, state.duration, stopRecording]);

  /**
   * 녹음 취소
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        transcribedText: null,
        isTranscribing: false,
        error: null,
      });
    }
  }, []);

  /**
   * 음성을 텍스트로 변환 (Whisper API)
   */
  const transcribe = useCallback(async () => {
    if (!state.audioBlob) {
      setState((prev) => ({ ...prev, error: '녹음된 음성이 없습니다.' }));
      return;
    }

    setState((prev) => ({ ...prev, isTranscribing: true, error: null }));

    try {
      // Blob을 File 객체로 변환
      const audioFile = new File([state.audioBlob], 'recording.webm', {
        type: 'audio/webm',
      });

      const text = await transcribeAudio(audioFile);

      setState((prev) => ({
        ...prev,
        transcribedText: text,
        isTranscribing: false,
      }));
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setState((prev) => ({
        ...prev,
        isTranscribing: false,
        error: '음성 변환에 실패했습니다.',
      }));
    }
  }, [state.audioBlob]);

  /**
   * 리셋
   */
  const reset = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      transcribedText: null,
      isTranscribing: false,
      error: null,
    });
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    togglePause,
    cancelRecording,
    transcribe,
    reset,
  };
}
