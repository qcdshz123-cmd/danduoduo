import { create } from 'zustand';
import { ThemeMode } from '../constants/theme';

interface AppState {
  // Theme
  themeMode: ThemeMode;
  resolvedTheme: 'light' | 'dark';

  // Store context
  activeStoreId: string | null;

  // Network
  isOnline: boolean;

  // App-level flags
  hasCompletedOnboarding: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
  setActiveStoreId: (id: string) => void;
  setOnline: (online: boolean) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  themeMode: 'system',
  resolvedTheme: 'light',
  activeStoreId: null,
  isOnline: true,
  hasCompletedOnboarding: false,

  setThemeMode: (themeMode) => set({ themeMode }),
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
  setActiveStoreId: (activeStoreId) => set({ activeStoreId }),
  setOnline: (isOnline) => set({ isOnline }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));
