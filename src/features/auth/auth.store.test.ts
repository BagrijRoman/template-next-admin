import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HTTP_STATUS } from '@/lib/constants';
import { getQueryClient } from '@/lib/queryClient';
import { makeApiError } from '@/test/apiError';
import { authApi } from './auth.api';
import { AUTH_STATUS } from './auth.constants';
import { useAuthStore } from './auth.store';
import type { User } from './auth.types';
import { tokenStorage } from './tokenStorage';
import { USER_ROLES } from '@/features/users/users.types';

vi.mock('./auth.api', () => ({
  authApi: { signIn: vi.fn(), logout: vi.fn(), getMe: vi.fn(), changePassword: vi.fn() },
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
  emailVerified: true,
  role: USER_ROLES.ADMIN,
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

  describe('changePassword', () => {
    it('adopts the replacement session the backend returns, so the next request still works', async () => {
      tokenStorage.setTokens(tokens);
      const rotated = { accessToken: 'access-2', refreshToken: 'refresh-2' };
      vi.mocked(authApi.changePassword).mockResolvedValue({ ...rotated, user });

      await useAuthStore.getState().changePassword({ currentPassword: 'old', newPassword: 'NewSecret123' });

      // The old pair was revoked server-side the moment the password changed.
      expect(tokenStorage.getAccessToken()).toBe(rotated.accessToken);
      expect(tokenStorage.getRefreshToken()).toBe(rotated.refreshToken);
      expect(useAuthStore.getState()).toMatchObject({ user, status: AUTH_STATUS.AUTHENTICATED });
    });

    it('keeps the current session when the change is refused', async () => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.changePassword).mockRejectedValue(
        makeApiError({ status: HTTP_STATUS.UNAUTHORIZED, message: 'Current password is incorrect' }),
      );

      await expect(
        useAuthStore.getState().changePassword({ currentPassword: 'wrong', newPassword: 'NewSecret123' }),
      ).rejects.toThrow();

      expect(tokenStorage.getAccessToken()).toBe(tokens.accessToken);
    });
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

    it('ignores a second call while the first one is still validating', async () => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.getMe).mockResolvedValue(user);

      await Promise.all([useAuthStore.getState().loadSession(), useAuthStore.getState().loadSession()]);

      expect(authApi.getMe).toHaveBeenCalledTimes(1);
      expect(useAuthStore.getState().status).toBe(AUTH_STATUS.AUTHENTICATED);
    });

    it('clears the stored tokens when the API answers 401', async () => {
      tokenStorage.setTokens(tokens);
      vi.mocked(authApi.getMe).mockRejectedValue(
        makeApiError({ status: HTTP_STATUS.UNAUTHORIZED, code: 'UNAUTHENTICATED', message: 'Unauthorized' }),
      );

      await useAuthStore.getState().loadSession();

      expect(useAuthStore.getState()).toMatchObject({ user: null, status: AUTH_STATUS.UNAUTHENTICATED });
      expect(tokenStorage.getRefreshToken()).toBeUndefined();
    });

    it.each([
      ['a network failure', new TypeError('Failed to fetch')],
      ['a server error', makeApiError({ status: HTTP_SERVER_ERROR, message: 'Internal Server Error' })],
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
      const error = makeApiError({
        status: HTTP_STATUS.UNAUTHORIZED,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
      });
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

  it('drops cached server state together with the session', () => {
    getQueryClient().setQueryData(['users', 'list'], [user]);

    useAuthStore.getState().clearSession();

    expect(getQueryClient().getQueryData(['users', 'list'])).toBeUndefined();
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
