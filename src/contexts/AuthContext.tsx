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
    let isInitialized = false;

    console.log('🔷 AuthContext: useEffect 시작');

    // 인증 상태 변화 구독 (INITIAL_SESSION이 가장 먼저 실행됨)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔔 Auth event:', event, 'session:', !!currentSession);

        if (!isMounted) {
          console.log('🔔 Component unmounted, ignoring event');
          return;
        }

        // INITIAL_SESSION 처리 (앱 시작/새로고침 시 가장 먼저 발생)
        if (event === 'INITIAL_SESSION') {
          console.log('🔔 INITIAL_SESSION - processing');

          if (currentSession?.user) {
            console.log('🔔 User found in INITIAL_SESSION:', currentSession.user.email);
            setSession(currentSession);
            setUser(currentSession.user);

            // 프로필 조회 (백그라운드)
            fetchProfile(currentSession.user.id).then(async (userProfile) => {
              if (!isMounted) return;
              if (!userProfile && currentSession.user.email) {
                const username = currentSession.user.user_metadata?.username ||
                               currentSession.user.email.split('@')[0];
                userProfile = await createProfile(
                  currentSession.user.id,
                  currentSession.user.email,
                  username
                );
              }
              if (isMounted) {
                setProfile(userProfile);
                console.log('🔔 INITIAL_SESSION profile set');
              }
            }).catch(err => console.error('프로필 조회/생성 실패:', err));
          } else {
            console.log('🔔 No user in INITIAL_SESSION');
            setSession(null);
            setUser(null);
            setProfile(null);
          }

          // 초기화 완료
          if (!isInitialized) {
            isInitialized = true;
            setLoading(false);
            console.log('✅ INITIAL_SESSION processed, loading=false');
          }
          return;
        }

        // SIGNED_IN 이벤트 처리 (로그인 후)
        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log('🔔 SIGNED_IN event - updating user and profile');
          setSession(currentSession);
          setUser(currentSession.user);

          // SIGNED_IN이 초기 로딩 중에 발생한 경우 즉시 loading 해제
          if (!isInitialized) {
            isInitialized = true;
            setLoading(false);
            console.log('✅ SIGNED_IN processed (initial), loading=false');
          }

          // 프로필 조회 및 생성 (백그라운드)
          fetchProfile(currentSession.user.id).then(async (userProfile) => {
            if (!isMounted) return;
            if (!userProfile && currentSession.user.email) {
              const username = currentSession.user.user_metadata?.username ||
                             currentSession.user.email.split('@')[0];
              userProfile = await createProfile(
                currentSession.user.id,
                currentSession.user.email,
                username
              );
            }
            if (isMounted) {
              setProfile(userProfile);
              console.log('🔔 SIGNED_IN profile updated');
            }
          }).catch(err => console.error('프로필 조회/생성 실패:', err));

          return;
        }

        // SIGNED_OUT 처리
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          console.log('🔔 User signed out');
          return;
        }

        // TOKEN_REFRESHED 처리
        if (event === 'TOKEN_REFRESHED' && currentSession?.user) {
          console.log('🔔 TOKEN_REFRESHED - updating session');
          setSession(currentSession);
          setUser(currentSession.user);

          // 초기화가 안 된 상태에서 TOKEN_REFRESHED가 먼저 오는 경우
          if (!isInitialized) {
            isInitialized = true;
            setLoading(false);
            console.log('✅ TOKEN_REFRESHED processed (initial), loading=false');
          }

          fetchProfile(currentSession.user.id).then(userProfile => {
            if (isMounted) {
              setProfile(userProfile);
              console.log('🔔 Token refreshed, profile updated');
            }
          });
        }
      }
    );

    // 무한 로딩 방지용 타임아웃 (1초 후 강제로 loading 해제)
    const timeoutId = setTimeout(() => {
      if (isMounted && !isInitialized) {
        console.warn('⚠️ Auth initialization timeout (1초) - 강제로 loading=false');
        isInitialized = true;
        setLoading(false);
      }
    }, 1000);

    return () => {
      console.log('🔷 AuthContext: cleanup');
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

  console.log('🟡 AuthContext: Creating context value with loading:', loading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
