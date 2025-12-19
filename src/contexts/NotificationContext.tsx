import React, { createContext, useContext, useEffect, useState } from 'react';
import { requestNotificationPermission, onMessageListener, saveFCMToken } from '../services/firebaseService';
import { useAuth } from './AuthContext';
import { useToast } from '../hooks/use-toast';

interface NotificationContextType {
  isNotificationSupported: boolean;
  isNotificationEnabled: boolean;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsNotificationSupported(true);
      setIsNotificationEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    // Listen for foreground messages
    if (isNotificationEnabled) {
      onMessageListener()
        .then((payload: any) => {
          toast({
            title: payload.notification?.title || '새 알림',
            description: payload.notification?.body || '',
          });
        })
        .catch((err) => console.error('Error listening for messages:', err));
    }
  }, [isNotificationEnabled, toast]);

  const requestPermission = async () => {
    try {
      const token = await requestNotificationPermission();

      if (token) {
        setIsNotificationEnabled(true);

        // Save token to user profile
        if (profile?.id) {
          await saveFCMToken(profile.id, token);
        }

        toast({
          title: '알림 설정 완료',
          description: '이제 새로운 소식을 알림으로 받을 수 있습니다.',
        });
      } else {
        toast({
          title: '알림 권한 거부',
          description: '알림을 받으려면 브라우저 설정에서 권한을 허용해주세요.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: '알림 설정 실패',
        description: '알림 설정 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        isNotificationSupported,
        isNotificationEnabled,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
