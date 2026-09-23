import { afterEach, describe, expect, it, vi } from 'vitest';

const VALID_URL = 'https://api.example.com';
const DEVELOPMENT_API_URL = 'http://localhost:3000';

const loadEnv = async () => {
  vi.resetModules();
  return import('./env');
};

describe('env', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('accepts an absolute API URL', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', VALID_URL);

    const { env } = await loadEnv();

    expect(env.NEXT_PUBLIC_API_URL).toBe(VALID_URL);
  });

  it('falls back to the local backend outside production', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    const { env } = await loadEnv();

    expect(env.NEXT_PUBLIC_API_URL).toBe(DEVELOPMENT_API_URL);
  });

  it('refuses to start a production build without the API URL', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');

    await expect(loadEnv()).rejects.toThrow(/NEXT_PUBLIC_API_URL/);
  });

  it.each([
    ['not-a-url', /absolute URL/],
    ['ftp://api.example.com', /http or https/],
    ['https://api.example.com/', /slash/],
  ])('rejects %s', async (value, message) => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', value);

    await expect(loadEnv()).rejects.toThrow(message);
  });
});
