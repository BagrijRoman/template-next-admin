import type { NextConfig } from 'next';
import { env } from './src/lib/env';

const isDevelopment = process.env.NODE_ENV !== 'production';
/** Two years, the value the HSTS preload list requires. */
const HSTS_MAX_AGE_SECONDS = 63_072_000;

/** The API is the only cross-origin the app is allowed to talk to. */
const apiOrigin = new URL(env.NEXT_PUBLIC_API_URL).origin;

/**
 * A static policy, not a nonce-based one: nonces need a middleware that rewrites every response,
 * which would make every page dynamic and reintroduce the middleware this app deliberately does
 * without (see "Routing & auth"). The cost is `'unsafe-inline'` for the scripts Next injects —
 * the upgrade path is a nonce middleware, and it is worth taking the day this app serves
 * untrusted HTML.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // Tailwind's runtime styles and Next's injected style tags carry no nonce.
  "style-src 'self' 'unsafe-inline'",
  // Dev needs eval for React Refresh; production must never allow it.
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  // Dev also opens a websocket to the dev server for HMR.
  `connect-src 'self' ${apiOrigin}${isDevelopment ? ' ws:' : ''}`,
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: `max-age=${HSTS_MAX_AGE_SECONDS}; includeSubDomains; preload` },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Belt and braces next to frame-ancestors, for the browsers that still read it.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig: NextConfig = {
  // Never advertise the framework and its version.
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
};

export default nextConfig;
