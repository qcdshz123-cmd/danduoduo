import { act } from '@testing-library/react-native';
import { useUIStore, Toast } from '../../stores/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    act(() => {
      // Clear all toasts
      for (const toast of useUIStore.getState().toasts) {
        useUIStore.getState().dismissToast(toast.id);
      }
      useUIStore.getState().setLoading(false);
    });
  });

  describe('initial state', () => {
    it('has empty toasts array', () => {
      expect(useUIStore.getState().toasts).toEqual([]);
    });

    it('is not loading', () => {
      expect(useUIStore.getState().isLoading).toBe(false);
    });
  });

  describe('showToast', () => {
    it('adds a toast to the array', () => {
      act(() => { useUIStore.getState().showToast('success', '操作成功'); });

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('操作成功');
    });

    it('assigns a unique id to each toast', () => {
      act(() => { useUIStore.getState().showToast('info', '消息1'); });
      act(() => { useUIStore.getState().showToast('info', '消息2'); });

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(2);
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('supports all toast types', () => {
      const types: Array<Toast['type']> = ['success', 'error', 'warning', 'info'];
      for (const type of types) {
        act(() => { useUIStore.getState().showToast(type, 'test'); });
      }
      expect(useUIStore.getState().toasts).toHaveLength(4);
    });

    it('accepts custom duration', () => {
      act(() => { useUIStore.getState().showToast('info', 'test', 5000); });
      expect(useUIStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('dismissToast', () => {
    it('removes a toast by id', () => {
      act(() => { useUIStore.getState().showToast('info', '消息'); });
      const id = useUIStore.getState().toasts[0].id;

      act(() => { useUIStore.getState().dismissToast(id); });
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('does nothing for non-existent id', () => {
      act(() => { useUIStore.getState().showToast('info', '消息'); });
      act(() => { useUIStore.getState().dismissToast('non-existent-id'); });
      expect(useUIStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('setLoading', () => {
    it('sets loading state', () => {
      act(() => { useUIStore.getState().setLoading(true); });
      expect(useUIStore.getState().isLoading).toBe(true);

      act(() => { useUIStore.getState().setLoading(false); });
      expect(useUIStore.getState().isLoading).toBe(false);
    });
  });
});
