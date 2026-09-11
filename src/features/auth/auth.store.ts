import { create } from 'zustand';
import { ApiError, onUnauthorized } from '@/lib/apiClient';
import { HTTP_STATUS } from '@/lib/constants';
import { authApi } from './auth.api';
import { AUTH_STATUS } from './auth.constants';
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
  status: AUTH_STATUS.IDLE,

  loadSession: async () => {
    if (!tokenStorage.getRefreshToken()) {
      set({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
      return;
    }
    set({ status: AUTH_STATUS.LOADING });
    try {
      const user = await authApi.getMe();
      set({ user, status: AUTH_STATUS.AUTHENTICATED });
    } catch (error) {
      if (error instanceof ApiError && error.status === HTTP_STATUS.UNAUTHORIZED) {
        get().clearSession();
        return;
      }
      // A network or server failure is not a revoked session: keep the tokens so the next
      // attempt can still restore it, and only drop the user into the signed-out state.
      set({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
    }
  },

  signIn: async (payload) => {
    const { user, ...tokens } = await authApi.signIn(payload);
    tokenStorage.setTokens(tokens);
    set({ user, status: AUTH_STATUS.AUTHENTICATED });
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
    set({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
  },
}));

onUnauthorized(() => useAuthStore.getState().clearSession());
