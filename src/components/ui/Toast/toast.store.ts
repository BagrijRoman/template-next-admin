import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export type Toast = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastState = {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => number;
  dismiss: (id: number) => void;
};

const TOAST_DURATION_MS = 5000;

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) => {
    nextId += 1;
    const id = nextId;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })), TOAST_DURATION_MS);
    return id;
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

const notify = (variant: ToastVariant) => (title: string, description?: string) =>
  useToastStore.getState().add({ variant, title, description });

/** Imperative API usable from anywhere — mutation callbacks included, not only components. */
export const toast = {
  success: notify('success'),
  error: notify('error'),
  info: notify('info'),
};
