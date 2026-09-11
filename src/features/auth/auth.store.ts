import { create } from 'zustand';
import { onUnauthorized } from '@/lib/apiClient';
import { authApi } from './auth.api';
import type { AuthStatus, SignInPayload, User } from './auth.types';
import { tokenStorage } from './tokenStorage';

type AuthState = {
  user: User | null;
  status: AuthStatus;
  /** Restores the session from the stored tokens; runs once per page load via AuthGuard. */
  loadSession: () => Promise<void>;
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',

  loadSession: async () => {
    if (!tokenStorage.getRefreshToken()) {
      set({ user: null, status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const user = await authApi.getMe();
      set({ user, status: 'authenticated' });
    } catch {
      get().clearSession();
    }
  },

  signIn: async (payload) => {
    const { user, ...tokens } = await authApi.signIn(payload);
    tokenStorage.setTokens(tokens);
    set({ user, status: 'authenticated' });
  },

  signOut: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      // Best effort: the local session is dropped regardless of the server answer.
      await authApi.logout(refreshToken).catch(() => undefined);
    }
    get().clearSession();
  },

  clearSession: () => {
    tokenStorage.clear();
    set({ user: null, status: 'unauthenticated' });
  },
}));

onUnauthorized(() => useAuthStore.getState().clearSession());
