@AGENTS.md

# Admin Web Template — Engineering Guidelines

Next.js admin panel starter template (React, Tailwind CSS, React Query, Zustand).
These rules are binding for any assistant or contributor working in this repo.

## Feature worklog

- `WORKLOG.md` is the atomic feature list used for project estimation (same format as the backend template). Every feature or meaningful change updates it **in the same commit**: one small feature per row, implemented work moves into "Implemented", planned work lives in "Not implemented (future scope)". The list must never lag behind the code.

## Testing

- **The template has no test setup yet, and everything implemented so far is untested** — adding it (Vitest + React Testing Library, Playwright for the sign-in flow) is the top-priority item in `WORKLOG.md`. It must retrofit coverage for the existing code, starting with the riskiest logic: `apiClient`'s refresh + cross-tab Web Lock, `tokenStorage` expiry handling, `loadSession`'s 401-vs-network branch, and both route guards.
- Once the setup exists, every feature and bug fix ships with its tests in the same commit, and a bug fix starts with a failing test that reproduces it (same rule as the backend template).

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
- Visual values (colors, spacing, typography, …) are not constants: they belong to the design system — see "Design system" below.

## Design system

- The client has a basic design system, and it is the single source of every visual value: colors, typography, spacing, radii, shadows, breakpoints, z-index, motion. Tokens live in the `@theme` block of `src/app/globals.css` (Tailwind 4 — there is no `tailwind.config`), and components consume them only through the Tailwind utilities those tokens generate.
- Components use **semantic** tokens (`bg-surface`, `text-muted`, `border-default`, `bg-primary`) — never raw palette classes (`bg-zinc-900`), hex values or arbitrary values (`p-[13px]`). A value the system lacks is added as a token first, then used.
- Light and dark themes are defined once, in the token layer: components never write paired `dark:` color classes.
- Anything visual used more than once belongs to the design system: a single value becomes a token; a repeated combination of classes (an input's styling, a card) becomes a component in `src/components/ui/` — never a copy-pasted class string.
- The current UI predates this rule and still uses raw palette classes; migrating it is tracked in `WORKLOG.md`. New code follows the rule from now on.

## Routing & auth

- Route groups split the app: `src/app/(auth)/` (centered card layout, signed-out visitors only) and `src/app/(app)/` (sidebar + header layout, session required). Groups do not affect URLs: pages live at `/login`, `/dashboard`, `/users`. Add every new URL to `ROUTES` in `src/lib/constants.ts` and never hard-code paths.
- `/` redirects to `/dashboard`; unknown paths render `src/app/not-found.tsx`.
- Classic bearer model: the backend returns JWTs in the response body and the client keeps both in **localStorage** (`src/features/auth/tokenStorage.ts`). localStorage is shared across tabs (the cross-tab refresh lock's re-check relies on that) but invisible to the server — so there is NO middleware/proxy auth and all route guarding is client-side; do not reintroduce a server-side auth check without moving tokens back into cookies. Every `tokenStorage` access is wrapped in try/catch: storage can be unavailable, and auth degrades to signed-out, never a crash.
- Guards are client-side and both read session state **only** from `useAuthStore` — never from `tokenStorage` directly: two sources of truth let the guards disagree and bounce a visitor between pages forever. `AuthGuard` in `(app)/layout.tsx` validates the session via `GET /users/me` and sends expired or revoked sessions to `/login?next=<path>` (path **and** query string); `GuestGuard` in `(auth)/layout.tsx` redirects signed-in users away, honouring `next`. Client guards are UX, not security — the API is the enforcement point (default-closed backend).
- Guarding is opt-in per route group now that the middleware is gone: **every new route group must wrap its layout in a guard** (`AuthGuard` for anything requiring a session, `GuestGuard` for signed-out-only pages). A page added outside a guarded group is public, and nothing in the build will warn about it.
- Only a `401` from the API means "session revoked" — a network or 5xx failure must never clear the stored tokens (see `loadSession`), or a short outage would sign every user out.
- All API calls go through `apiClient` (`src/lib/apiClient.ts`): it attaches the bearer token, retries once after a shared refresh on 401, and on a second 401 clears the session and notifies `useAuthStore`. Pass `skipAuth: true` only for token-issuing endpoints. The refresh runs under a Web Lock (`navigator.locks`, origin-scoped) with a token re-check, so parallel tabs never redeem the same single-use refresh token — the backend treats a second redemption as theft and revokes the session family; never remove the lock or the re-check.
- Auth state lives in `useAuthStore` (`src/features/auth/auth.store.ts`); components read it through selectors, never through `getState()` in render.
- The `next` query param is validated by `getSafeNextPath` (same-origin absolute paths only). Keep it that way to avoid open redirects.
