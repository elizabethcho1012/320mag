// Supabase Auth Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

// 사용자 역할 타입
export type UserRole = 'guest' | 'member' | 'subscriber' | 'admin';

// 확장된 사용자 프로필
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  isSubscriber: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 사용자 프로필 조회
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // 프로필이 없으면 기본 프로필 생성
        if (error.code === 'PGRST116') {
          console.log('프로필이 존재하지 않습니다. userId:', userId);
          return null;
        }
        console.error('프로필 조회 오류:', error);
        return null;
      }

      console.log('프로필 조회 성공:', {
        id: data.id,
        email: data.email,
        username: data.username,
        role: data.role,
      });

      return {
        id: data.id,
        email: data.email || '',
        username: data.username || '',
        role: (data.role as UserRole) || 'member',
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
      };
    } catch (error) {
      // Timeout 등의 에러 발생 시에도 null 반환하고 앱은 계속 작동
      console.error('프로필 조회 실패 (timeout 가능):', error);
      return null;
    }
  };

  // 프로필 생성 (회원가입 시)
  const createProfile = async (userId: string, email: string, username: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          username,
          role: 'member',
          display_name: username,
        })
        .select()
        .single();

      if (error) {
        console.error('프로필 생성 오류:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email || '',
        username: data.username || '',
        role: (data.role as UserRole) || 'member',
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('프로필 생성 실패:', error);
      return null;
    }
  };

  // 회원가입
  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) {
        return { error };
      }

      // 회원가입 성공 시 프로필 생성
      if (data.user) {
        await createProfile(data.user.id, email, username);
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // 로그인
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // 로그아웃
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: updates.username,
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl,
        })
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // 프로필 새로고침
      const newProfile = await fetchProfile(user.id);
      if (newProfile) {
        setProfile(newProfile);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // 인증 상태 변화 감지
  useEffect(() => {
    let isMounted = true;
    let authInitialized = false;

    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        // getSession이 timeout 등으로 실패한 경우
        if (sessionError) {
          console.error('세션 조회 오류:', sessionError);
          // 로그인 안 한 상태로 간주하고 계속 진행
          setSession(null);
          setUser(null);
          setProfile(null);
          authInitialized = true;
          setLoading(false);
          return;
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // 프로필 조회 (타임아웃되면 null 반환)
          let userProfile = await fetchProfile(currentSession.user.id);

          // 프로필이 없으면 생성 시도 (타임아웃되면 null로 유지)
          if (!userProfile && currentSession.user.email) {
            const username = currentSession.user.user_metadata?.username ||
                           currentSession.user.email.split('@')[0];
            userProfile = await createProfile(
              currentSession.user.id,
              currentSession.user.email,
              username
            );
          }

          if (!isMounted) return;
          setProfile(userProfile);
        } else {
          // 로그인하지 않은 상태
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        // 에러 발생 시에도 로그인 안 한 상태로 진행
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          authInitialized = true;
          setLoading(false);
        }
      }
    };

    // 무한 로딩 방지용 타임아웃 (3초 후 강제로 loading 해제)
    const timeoutId = setTimeout(() => {
      if (isMounted && !authInitialized) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 3000);

    initializeAuth();

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);

        if (!isMounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);

          // 프로필 조회
          const userProfile = await fetchProfile(currentSession.user.id);
          if (isMounted) {
            setProfile(userProfile);
          }
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: profile?.role === 'admin',
    isSubscriber: profile?.role === 'subscriber' || profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
