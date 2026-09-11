@AGENTS.md

# Admin Web Template — Engineering Guidelines

Next.js admin panel starter template (React, Tailwind CSS, React Query, Zustand).
These rules are binding for any assistant or contributor working in this repo.

## Feature worklog

- `WORKLOG.md` is the atomic feature list used for project estimation (same format as the backend template). Every feature or meaningful change updates it **in the same commit**: one small feature per row, implemented work moves into "Implemented", planned work lives in "Not implemented (future scope)". The list must never lag behind the code.

## Code style

- A linter and Prettier are mandatory tooling: the project must have them installed and configured (ESLint with the Next.js preset unless decided otherwise), with the linter enforcing the style rules below. Both must pass cleanly; run them before finishing any task.
- A husky + lint-staged pre-commit hook must be set up (husky activated by the `prepare` script on `npm install`): it runs the linter and Prettier over the staged files and blocks the commit on errors (Prettier auto-formats and re-stages). Never bypass it with `--no-verify`; fix the reported problems instead.
- Prefer arrow functions over `function` declarations everywhere — components, hooks, handlers, utilities: `const UserCard = () => { ... }`.
- Prefer `const` over `let` wherever the binding is never reassigned; `var` is forbidden.
- Export through named `const` exports; avoid default exports and imports, except where Next.js requires a default (`page.tsx`, `layout.tsx`, other framework conventions and config files).
- Group components into folders where possible (`UserCard/UserCard.tsx` plus its styles, tests, and subcomponents) and re-export the public ones through a shared `index.ts`, so consumers import from the folder path.

## Constants

- No magic numbers or strings — every meaningful literal gets a named constant.
- A value reused within one file is extracted to a `const` at the top of that file.
- A value reused within one feature (but not beyond it) goes to a `<feature>.constants.ts` file inside that feature's folder.
- A value reused across features goes to global constants in `src/lib/constants.ts` (create the file when the first shared constant appears) — the same literal must never be duplicated in two files.
- Design tokens (colors, spacing, breakpoints) live in the Tailwind config, not in ad-hoc constants.

## Routing & auth

- Route groups split the app: `src/app/(auth)/` (centered card layout, signed-out visitors only) and `src/app/(app)/` (sidebar + header layout, session required). Groups do not affect URLs: pages live at `/login`, `/dashboard`, `/users`. Add every new URL to `ROUTES` in `src/lib/constants.ts` and never hard-code paths.
- `/` redirects to `/dashboard`; unknown paths render `src/app/not-found.tsx`.
- The backend returns JWTs in the response body; the client stores them in two cookies (`accessToken`, `refreshToken`, see `src/features/auth/tokenStorage.ts`) whose lifetime mirrors each token's `exp`. Cookies are not httpOnly, so XSS-wise this equals localStorage; the gain is that the server can see them.
- Guard chain, in order: (1) `src/proxy.ts` (Next 16 name for middleware) does an optimistic check on cookie presence and redirects before rendering: guests off `(app)` routes to `/login?next=<path>`, signed-in users off `(auth)` routes to `/dashboard`. (2) `AuthGuard` in `(app)/layout.tsx` validates the session via `GET /users/me` and sends expired or revoked sessions back to `/login`. Never rely on the proxy alone: it does not verify tokens.
- All API calls go through `apiClient` (`src/lib/apiClient.ts`): it attaches the bearer token, retries once after a shared refresh on 401, and on a second 401 clears the session and notifies `useAuthStore`. Pass `skipAuth: true` only for token-issuing endpoints.
- Auth state lives in `useAuthStore` (`src/features/auth/auth.store.ts`); components read it through selectors, never through `getState()` in render.
- The `next` query param is validated by `getSafeNextPath` (same-origin absolute paths only). Keep it that way to avoid open redirects.
