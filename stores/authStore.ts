import { create } from 'zustand';
import { Profile, Store } from '../types/models';

interface AuthState {
  // Session
  session: { access_token: string; refresh_token: string } | null;
  user: { id: string; phone: string } | null;

  // Profile + store
  profile: Profile | null;
  store: Store | null;

  // Derived
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;

  // Actions
  setSession: (session: AuthState['session'], user: AuthState['user']) => void;
  setProfile: (profile: Profile, store: Store) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  profile: null,
  store: null,
  isAuthenticated: false,
  isLoading: false,
  isAdmin: false,
  isStaff: false,

  setSession: (session, user) =>
    set({ session, user, isAuthenticated: !!session }),
  setProfile: (profile, store) =>
    set({
      profile,
      store,
      isAdmin: profile?.role_id === 'admin',
      isStaff: profile?.role_id === 'admin' || profile?.role_id === 'staff',
    }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () =>
    set({
      session: null,
      user: null,
      profile: null,
      store: null,
      isAuthenticated: false,
      isAdmin: false,
      isStaff: false,
    }),
}));
