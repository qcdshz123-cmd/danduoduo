import { act } from '@testing-library/react-native';
import { useAppStore } from '../../stores/appStore';

describe('appStore', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.getState().setThemeMode('system');
      useAppStore.getState().setActiveStoreId(null!);
      useAppStore.getState().setOnline(true);
    });
  });

  describe('initial state', () => {
    it('has system theme mode by default', () => {
      expect(useAppStore.getState().themeMode).toBe('system');
    });

    it('has null activeStoreId', () => {
      expect(useAppStore.getState().activeStoreId).toBeNull();
    });

    it('is online by default', () => {
      expect(useAppStore.getState().isOnline).toBe(true);
    });

    it('has not completed onboarding', () => {
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(false);
    });
  });

  describe('setThemeMode', () => {
    it('changes theme mode to dark', () => {
      act(() => { useAppStore.getState().setThemeMode('dark'); });
      expect(useAppStore.getState().themeMode).toBe('dark');
    });

    it('supports all theme modes', () => {
      const modes = ['light', 'dark', 'system'] as const;
      for (const mode of modes) {
        act(() => { useAppStore.getState().setThemeMode(mode); });
        expect(useAppStore.getState().themeMode).toBe(mode);
      }
    });
  });

  describe('setResolvedTheme', () => {
    it('changes resolved theme', () => {
      act(() => { useAppStore.getState().setResolvedTheme('dark'); });
      expect(useAppStore.getState().resolvedTheme).toBe('dark');
    });
  });

  describe('setActiveStoreId', () => {
    it('changes active store id', () => {
      act(() => { useAppStore.getState().setActiveStoreId('store-123'); });
      expect(useAppStore.getState().activeStoreId).toBe('store-123');
    });
  });

  describe('setOnline', () => {
    it('changes online status', () => {
      act(() => { useAppStore.getState().setOnline(false); });
      expect(useAppStore.getState().isOnline).toBe(false);

      act(() => { useAppStore.getState().setOnline(true); });
      expect(useAppStore.getState().isOnline).toBe(true);
    });
  });

  describe('completeOnboarding', () => {
    it('marks onboarding as completed', () => {
      act(() => { useAppStore.getState().completeOnboarding(); });
      expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
    });
  });
});
