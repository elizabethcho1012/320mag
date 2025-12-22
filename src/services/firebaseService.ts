import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration - these should be in environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let messaging: Messaging | null = null;

// Initialize Firebase
const initializeFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      if (!messaging) {
        initializeFirebase();
      }

      if (!messaging) {
        throw new Error('Failed to initialize Firebase Messaging');
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = (): Promise<any> => {
  return new Promise((resolve) => {
    if (!messaging) {
      initializeFirebase();
    }

    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Message received in foreground:', payload);
        resolve(payload);
      });
    }
  });
};

// Save FCM token to user profile
export const saveFCMToken = async (userId: string, token: string) => {
  try {
    const { supabase } = await import('../integrations/supabase/client');

    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', userId);

    if (error) throw error;

    console.log('FCM token saved to profile');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

// Initialize Firebase on module load only if config is available
if (typeof window !== 'undefined' && firebaseConfig.projectId) {
  initializeFirebase();
}
