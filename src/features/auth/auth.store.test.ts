import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { HTTP_STATUS } from '@/lib/constants';
import { authApi } from './auth.api';
import { AUTH_STATUS } from './auth.constants';
import { useAuthStore } from './auth.store';
import type { User } from './auth.types';
import { tokenStorage } from './tokenStorage';

vi.mock('./auth.api', () => ({
  authApi: { signIn: vi.fn(), logout: vi.fn(), getMe: vi.fn() },
}));

const { onUnauthorizedHandlers } = vi.hoisted(() => ({ onUnauthorizedHandlers: [] as Array<() => void> }));

vi.mock('@/lib/apiClient', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/apiClient')>()),
  onUnauthorized: (handler: () => void) => {
    onUnauthorizedHandlers.push(handler);
    return () => undefined;
  },
}));

const HTTP_SERVER_ERROR = 500;
const user: User = {
  id: 'u1',
  email: 'a@b.c',
  firstName: 'A',
  lastName: 'B',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};
const tokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const credentials = { email: 'a@b.c', password: 'secret' };

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, status: AUTH_STATUS.IDLE });
  });

  describe('loadSession', () => {
    it('is signed out without a refresh token and never calls the API', async () => {
      await useAuthStore.getState().loadSession();

      expect(authApi.getMe).not.toHaveBeenCalled();
      expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
    });

    it('restores the session from a valid refresh token', async () => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.getMe).mockResolvedValue(user);

      const pending = useAuthStore.getState().loadSession();
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.LOADING);
      await pending;

      expect(useAuthStore.getState()).toMatchObject({ user, status: AUTH_STATUS.AUTHENTICATED });
    });

    it('clears the stored tokens when the API answers 401', async () => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.getMe).mockRejectedValue(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Unauthorized'));

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
      expect(tokenStorage.getRefreshToken()).toBeUndefined();
    });

    it.each([
      ['a network failure', new TypeError('Failed to fetch')],
      ['a server error', new ApiError(HTTP_SERVER_ERROR, 'Internal Server Error')],
    ])('keeps the stored tokens on %s', async (_label, error) => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.getMe).mockRejectedValue(error);

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
      expect(tokenStorage.getRefreshToken()).toBe(tokens.refreshToken);
    });
  });

  describe('signIn', () => {
    it('stores the tokens and the user', async () => {
      vi.mocked(authApi.signIn).mockResolvedValue({ ...tokens, user });

      await useAuthStore.getState().signIn(credentials);

      expect(authApi.signIn).toHaveBeenCalledWith(credentials);
      expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
      expect(tokenStorage.getRefreshToken()).toBe(tokens.refreshToken);
      expect(useAuthStore.getState()).toMatchObject({ user, status: AUTH_STATUS.AUTHENTICATED });
    });

    it('propagates the error and leaves the store untouched', async () => {
      const error = new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials');
      vi.mocked(authApi.signIn).mockRejectedValue(error);

      await expect(useAuthStore.getState().signIn(credentials)).rejects.toBe(error);
      expect(tokenStorage.getAccessToken()).toBeUndefined();
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.IDLE);
    });
  });

  describe('signOut', () => {
    it('revokes the refresh token on the server and clears the session', async () => {
      tokenStorage.setTokens(tokens);
      useAuthStore.setState({ user, status: AUTH_STATUS.AUTHENTICATED });
      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      await useAuthStore.getState().signOut();

      expect(authApi.logout).toHaveBeenCalledWith(tokens.refreshToken);
      expect(tokenStorage.getRefreshToken()).toBeUndefined();
      expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
    });

    it('clears the local session even when the logout call fails', async () => {
      tokenStorage.setTokens(tokens);
      useAuthStore.setState({ user, status: AUTH_STATUS.AUTHENTICATED });
      vi.mocked(authApi.logout).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();
      expect(tokenStorage.getRefreshToken()).toBeUndefined();
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    });

    it('skips the server call when there is no refresh token', async () => {
      useAuthStore.setState({ user, status: AUTH_STATUS.AUTHENTICATED });

      await useAuthStore.getState().signOut();

      expect(authApi.logout).not.toHaveBeenCalled();
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.UNAUTHENTICATED);
    });
  });

  it('clears the session when apiClient reports a revoked session', () => {
    tokenStorage.setTokens(tokens);
    useAuthStore.setState({ user, status: AUTH_STATUS.AUTHENTICATED });

    expect(onUnauthorizedHandlers).toHaveLength(1);
    onUnauthorizedHandlers[0]();

    expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
    expect(tokenStorage.getRefreshToken()).toBeUndefined();
  });
});
