import { describe, expect, it } from 'vitest';
import { ROUTES } from '@/lib/constants';
import { buildLoginUrl, getNextParam, getReturnToPath, getSafeNextPath } from './auth.utils';

describe('getSafeNextPath', () => {
  it('accepts same-origin absolute paths', () => {
    expect(getSafeNextPath('/users?page=3')).toBe('/users?page=3');
  });

  it.each([null, '', 'users', 'https://evil.example', '//evil.example', '/\\evil.example'])(
    'falls back to the dashboard for %j',
    (next) => {
      expect(getSafeNextPath(next)).toBe(ROUTES.DASHBOARD);
    },
  );
});

describe('buildLoginUrl', () => {
  it('encodes the return path into the next param', () => {
    expect(buildLoginUrl('/users?page=3')).toBe('/login?next=%2Fusers%3Fpage%3D3');
  });
});

describe('window-based helpers', () => {
  it('keeps the query string in the return path', () => {
    window.history.replaceState(null, '', '/users?page=3');
    expect(getReturnToPath('/users')).toBe('/users?page=3');
  });

  it('reads the next param from the current URL', () => {
    window.history.replaceState(null, '', '/login?next=%2Fusers');
    expect(getNextParam()).toBe('/users');
    window.history.replaceState(null, '', '/login');
    expect(getNextParam()).toBeNull();
  });
});
