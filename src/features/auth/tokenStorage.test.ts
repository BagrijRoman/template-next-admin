import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeJwt } from '@/test/jwt';
import { ACCESS_TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from './auth.constants';
import { tokenStorage } from './tokenStorage';

const SECOND = 1;
const HOUR_IN_SECONDS = 3600;

describe('tokenStorage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stores and reads back both tokens', () => {
    tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r' });

    expect(tokenStorage.getAccessToken()).toBe('a');
    expect(tokenStorage.getRefreshToken()).toBe('r');
    expect(window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)).toBe('a');
    expect(window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)).toBe('r');
  });

  it('returns undefined when nothing is stored', () => {
    expect(tokenStorage.getAccessToken()).toBeUndefined();
    expect(tokenStorage.getRefreshToken()).toBeUndefined();
  });

  it('treats an expired JWT as absent', () => {
    tokenStorage.setTokens({ accessToken: makeJwt(-SECOND), refreshToken: makeJwt(-SECOND) });

    expect(tokenStorage.getAccessToken()).toBeUndefined();
    expect(tokenStorage.getRefreshToken()).toBeUndefined();
  });

  it('returns a JWT that has not expired yet', () => {
    const accessToken = makeJwt(HOUR_IN_SECONDS);
    tokenStorage.setTokens({ accessToken, refreshToken: makeJwt(HOUR_IN_SECONDS) });

    expect(tokenStorage.getAccessToken()).toBe(accessToken);
  });

  it('returns a token it cannot parse and leaves validation to the backend', () => {
    tokenStorage.setTokens({ accessToken: 'opaque', refreshToken: 'not.base64!.x' });

    expect(tokenStorage.getAccessToken()).toBe('opaque');
    expect(tokenStorage.getRefreshToken()).toBe('not.base64!.x');
  });

  it('clears both tokens', () => {
    tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r' });
    tokenStorage.clear();

    expect(tokenStorage.getAccessToken()).toBeUndefined();
    expect(tokenStorage.getRefreshToken()).toBeUndefined();
  });

  it('degrades to signed-out when storage is unavailable', () => {
    const error = new Error('SecurityError');
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw error;
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw error;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw error;
    });

    expect(() => tokenStorage.setTokens({ accessToken: 'a', refreshToken: 'r' })).not.toThrow();
    expect(tokenStorage.getAccessToken()).toBeUndefined();
    expect(tokenStorage.getRefreshToken()).toBeUndefined();
    expect(() => tokenStorage.clear()).not.toThrow();
  });
});
