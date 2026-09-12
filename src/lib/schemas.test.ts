import { describe, expect, it } from 'vitest';
import { emailSchema, passwordSchema, requiredString } from './schemas';

describe('emailSchema', () => {
  it('trims and lower-cases like the backend transform', () => {
    expect(emailSchema.parse('  Jane@Example.COM ')).toBe('jane@example.com');
  });

  it('rejects an invalid address', () => {
    expect(emailSchema.safeParse('jane').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts a password that satisfies every backend rule', () => {
    expect(passwordSchema.safeParse('Secret123').success).toBe(true);
  });

  it.each([
    ['too short', 'Sh0rt'],
    ['no lowercase', 'SECRET123'],
    ['no uppercase', 'secret123'],
    ['no digit', 'SecretPass'],
  ])('rejects a password with %s', (_label, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });
});

describe('requiredString', () => {
  it('names the field in the message', () => {
    const result = requiredString('Password').safeParse('');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Password is required');
  });
});
