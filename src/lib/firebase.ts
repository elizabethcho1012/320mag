// Firebase Cloud Messaging 설정
// 앱 푸시 알림을 위한 Firebase 초기화

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let messaging: Messaging | null = null;

// Firebase 초기화 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

/**
 * FCM 토큰 요청
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.error('Firebase messaging not initialized');
    return null;
  }

  try {
    // 알림 권한 요청
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // FCM 토큰 가져오기
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, { vapidKey });

    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * 포그라운드 메시지 리스너
 */
export function onMessageListener() {
  if (!messaging) {
    return Promise.reject('Firebase messaging not initialized');
  }

  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });
}

/**
 * 푸시 알림 표시 (커스텀)
 */
export function showNotification(title: string, options: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
}
