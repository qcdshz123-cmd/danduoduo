import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';

export function useAuth() {
  const {
    session, user, profile, store,
    isAuthenticated, isLoading,
    setSession, setProfile, setLoading, signOut: storeSignOut,
  } = useAuthStore();

  // Check existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const sess = await authService.getSession();
        if (sess) {
          setSession(
            { access_token: sess.access_token, refresh_token: sess.refresh_token || '' },
            { id: sess.user.id, phone: sess.user.user_metadata?.phone || '' }
          );
          try {
            const prof = await authService.getProfile();
            setProfile(prof, prof.stores);
          } catch {
            // Profile may not exist yet (right after signup)
          }
        }
      } catch {
        // No session
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signIn = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const data = await authService.signIn({ phone, password });
      setSession(
        { access_token: data.session!.access_token, refresh_token: data.session!.refresh_token },
        { id: data.user!.id, phone: data.user!.user_metadata?.phone || phone }
      );
      const prof = await authService.getProfile();
      setProfile(prof, prof.stores);
      return prof;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (phone: string, password: string, displayName: string, storeName: string) => {
    setLoading(true);
    try {
      const data = await authService.signUp({ phone, password, displayName, storeName });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    storeSignOut();
  };

  return {
    session, user, profile, store,
    isAuthenticated, isLoading,
    signIn, signUp, signOut,
  };
}
