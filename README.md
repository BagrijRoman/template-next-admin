# template-next-web

Starter template for admin panel web frontends.

**Stack:** Next.js (App Router), React, Tailwind CSS (token-based design system), axios, TanStack Query, react-hook-form + zod, Zustand. Tests: Vitest + React Testing Library (unit/component), Playwright (e2e).

## Getting started with a new project

1. Clone this template into a new repo.
2. Update `name` and `description` in `package.json`.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL` to the backend URL.
4. Add the panel origin (`http://localhost:3001` in development) to the backend `CORS_ORIGINS`.
5. Replace this README with the project's own.

## Scripts

| Script                 | What it does                                                                     |
| ---------------------- | -------------------------------------------------------------------------------- |
| `npm run dev`          | Dev server on <http://localhost:3001>                                            |
| `npm run build`        | Production build                                                                 |
| `npm run start`        | Serve the production build on port 3001                                          |
| `npm run lint`         | ESLint                                                                           |
| `npm run typecheck`    | `tsc --noEmit`                                                                   |
| `npm run format`       | Prettier over the whole repo                                                     |
| `npm run format:check` | Prettier in check mode                                                           |
| `npm test`             | Unit and component tests (Vitest)                                                |
| `npm run test:watch`   | Vitest in watch mode                                                             |
| `npm run test:cov`     | Unit tests with coverage                                                         |
| `npm run test:e2e`     | Playwright e2e suite (starts its own dev server on port 3101, no backend needed) |
| `npm run test:e2e:ui`  | Playwright UI mode                                                               |

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on Node from `.nvmrc` on every push and pull request: lint, format check, typecheck, `npm audit` (high and above blocks), unit/component tests, production build and the Playwright e2e suite. Browsers are cached per Playwright version; traces of failed e2e tests are uploaded as the `playwright-traces` artifact.

## Routing and auth

See the "Routing & auth" section in `CLAUDE.md` for the layout of routes, the localStorage session storage and the client-side route guards.
