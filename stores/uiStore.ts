import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UIState {
  // Toast
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  dismissToast: (id: string) => void;

  // Global loading
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  showToast: (type, message, duration = 3000) => {
    const id = `${++toastId}-${Date.now()}`;
    const toast: Toast = { id, type, message, duration };
    set((s) => ({ toasts: [...s.toasts, toast] }));

    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  dismissToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
}));
