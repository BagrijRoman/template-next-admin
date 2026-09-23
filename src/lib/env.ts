import { z } from 'zod';

/** Local backend for development and tests; a production build has to say where the API really is. */
const DEVELOPMENT_API_URL = 'http://localhost:3000';

const isProduction = process.env.NODE_ENV === 'production';

const apiUrlSchema = z
  .url({ message: 'must be an absolute URL, e.g. https://api.example.com' })
  .refine((value) => /^https?:\/\//.test(value), { message: 'must use http or https' })
  .refine((value) => !value.endsWith('/'), { message: 'must not end with a slash' });

const envSchema = z.object({ NEXT_PUBLIC_API_URL: apiUrlSchema });

/**
 * `NEXT_PUBLIC_*` values are inlined by the compiler at build time, so each one must be read as a
 * literal `process.env.X` property access: destructuring or iterating `process.env` yields nothing
 * in the browser bundle.
 */
const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (isProduction ? undefined : DEVELOPMENT_API_URL),
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  ${issue.path.join('.') || 'env'}: ${issue.message}`).join('\n');
  // Fail at build or boot rather than at the first request with a confusing 404 from nowhere.
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

/** The validated environment — the only way app code reads configuration. */
export const env = parsed.data;
