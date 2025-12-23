import { useMutation } from '@tanstack/react-query';
import { trackPWADownload } from '@/services/pwaDatabase';

// Generate a simple session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('pwa_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pwa_session_id', sessionId);
  }
  return sessionId;
}

export function useTrackPWADownload() {
  return useMutation({
    mutationFn: (appId: string) => trackPWADownload(appId, getSessionId()),
  });
}
