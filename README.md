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

| Script                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Dev server on <http://localhost:3001>   |
| `npm run build`        | Production build                        |
| `npm run start`        | Serve the production build on port 3001 |
| `npm run lint`         | ESLint                                  |
| `npm run typecheck`    | `tsc --noEmit` (run `build` once first) |
| `npm run format`       | Prettier over the whole repo            |
| `npm run format:check` | Prettier in check mode                  |

## Routing and auth

See the "Routing & auth" section in `CLAUDE.md` for the layout of routes, the localStorage session storage and the client-side route guards.
