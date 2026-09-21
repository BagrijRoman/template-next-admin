@AGENTS.md

# Admin Web Template — Engineering Guidelines

Next.js admin panel starter template (React, Tailwind CSS, axios, TanStack Query, react-hook-form + zod, Zustand).
These rules are binding for any assistant or contributor working in this repo.

## Feature worklog

- `WORKLOG.md` is the atomic feature list used for project estimation (same format as the backend template). Every feature or meaningful change updates it **in the same commit**: one small feature per row, implemented work moves into "Implemented", planned work lives in "Not implemented (future scope)". The list must never lag behind the code. A row is one estimable unit: when a portion delivers several components or mechanisms, each gets its own row. Tests are work and get rows of their own: every feature with tests is followed by a `Web App: Tests: <feature>` row naming the test type (unit / component / e2e) and what it covers; test infrastructure has its own rows too.

## Testing

- Unit and component tests run on Vitest + React Testing Library in a jsdom environment (`vitest.config.mts`, global setup in `src/test/setup.ts`). Tests are colocated with the code they cover (`apiClient.test.ts`, `AuthGuard/AuthGuard.test.tsx`); shared helpers live in `src/test/`. Run `npm test` (or `npm run test:cov`) before finishing any task.
- Every feature and bug fix ships with its tests in the same commit, and a bug fix starts with a failing test that reproduces it (same rule as the backend template).
- HTTP is tested end to end through `apiClient` with `installAxiosMock` (`src/test/axiosMock.ts`), which swaps the axios adapter for scripted in-memory replies — interceptors included. Call it **before** importing `apiClient` (use `vi.resetModules()` + dynamic import), because `axios.create` copies the global defaults at creation time. Never mock `apiClient` methods away in a test of the auth flow: the refresh/retry logic is the thing under test.
- Next.js hooks (`useRouter`, `usePathname`) are mocked per test file via `vi.mock('next/navigation', …)`; guards and forms read the query string from `window.location`, so tests set it with `window.history.replaceState`.
- E2e tests run on Playwright (`playwright.config.ts`, specs in `e2e/`, `npm run test:e2e`). They start their own dev server on a dedicated port and never reuse a running one, so a foreign app on the usual port cannot be picked up by mistake. The backend is faked in the browser by `mockApi` (`e2e/apiMock.ts`): it checks credentials and bearers, rotates single-use refresh tokens and records every call — the suite runs without a backend or database. The e2e code never imports app modules; the few shared literals (storage keys, endpoints) are mirrored in `e2e/` on purpose.
- E2e gotchas: seed a session via `seedSession` (it uses the guard-free 404 page, so seeding cannot race a session load); match the form's `role="alert"` by text because Next.js adds its own route announcer; the dev server runs React StrictMode, so store actions triggered from effects must be idempotent (`loadSession` is).

## Code style

- A linter and Prettier are mandatory tooling: the project must have them installed and configured (ESLint with the Next.js preset unless decided otherwise), with the linter enforcing the style rules below. Both must pass cleanly; run them before finishing any task.
- CI (`.github/workflows/ci.yml`) runs lint, format check, typecheck, `npm audit --audit-level=high`, unit/component tests, the production build and the Playwright e2e suite on every push and PR. Keep it green and never weaken its gates; a new check script gets its CI step in the same change.
- A husky + lint-staged pre-commit hook must be set up (husky activated by the `prepare` script on `npm install`): it runs the linter and Prettier over the staged files and blocks the commit on errors (Prettier auto-formats and re-stages). Never bypass it with `--no-verify`; fix the reported problems instead.
- Prefer arrow functions over `function` declarations everywhere — components, hooks, handlers, utilities: `const UserCard = () => { ... }`.
- Prefer `const` over `let` wherever the binding is never reassigned; `var` is forbidden.
- Export through named `const` exports; avoid default exports and imports, except where Next.js requires a default (`page.tsx`, `layout.tsx`, other framework conventions and config files).

## Component structure

- Every component lives in its own folder named after it, and a large component is split by concern into separate files:
  - `UserCard.tsx` — the component itself: markup and wiring only.
  - `useUserCard.ts` — the component's logic as a hook (state, effects, handlers, store selectors, navigation). The component calls the hook and renders what it returns; no business logic in JSX files.
  - `UserCard.styles.ts` — styles, only when needed (class-name maps or variant helpers; with Tailwind most components need none).
  - `index.ts` — the public re-export; consumers always import from the folder path (`@/components/UserCard`), never from the inner files.
  - Tests (`UserCard.test.tsx`) and private subcomponents sit in the same folder.
- Small, simple components — presentational, no state or effects (a loader, an icon, a badge) — may be a single file plus `index.ts`. The moment a component grows non-trivial state, effects or handlers, extract them into its hook.
- Every export is a named `export const` — the component, its hook, its styles, its constants. No default exports and no default imports (framework files like `page.tsx` and `layout.tsx` are the only exception).

## Constants

- No magic numbers or strings — every meaningful literal gets a named constant.
- A value reused within one file is extracted to a `const` at the top of that file.
- A value reused within one feature (but not beyond it) goes to a `<feature>.constants.ts` file inside that feature's folder.
- A value reused across features goes to global constants in `src/lib/constants.ts` (create the file when the first shared constant appears) — the same literal must never be duplicated in two files.
- Visual values (colors, spacing, typography, …) are not constants: they belong to the design system — see "Design system" below.

## Design system

- The design system is the single source of every visual value: colours, typography, spacing, radii, shadows, layering, motion. Raw values live as private CSS variables on `:root` in `src/app/globals.css` and are mapped to semantic Tailwind tokens in its `@theme` block (Tailwind 4 — there is no `tailwind.config`); components consume them only through the utilities those tokens generate.
- Components use **semantic** tokens (`bg-surface`, `bg-page`, `text-foreground`, `text-muted`, `text-subtle`, `border-default`, `border-emphasis`, `bg-primary`, `text-danger`, `bg-success-soft`, `rounded-control`, `rounded-card`, `shadow-card`, `w-sidebar`, `h-header`, `max-w-form`, `z-(--z-modal)`, `duration-(--duration-fast)`) — never raw palette classes (`bg-zinc-900`), hex values or arbitrary values (`p-[13px]`). A value the system lacks is added as a token first (raw value on `:root`, light and dark, then the `@theme` mapping), then used, then shown on the showcase page.
- Light and dark themes are defined once, in the `:root` / `prefers-color-scheme: dark` blocks of `globals.css`: components never write `dark:` colour classes.
- Enforced by lint: the local ESLint rule `design-system/no-raw-visual-values` (`eslint/noRawVisualValues.mjs`) fails the build on raw palette classes, `bg-white`/`text-black`, hex colours, arbitrary values with units or colours, and `dark:` colour pairs in `src/**` (tests and `src/test/` excepted). Do not disable it inline — add a token.
- The UI kit lives in `src/components/ui/` (Button, Input, Table + DataTable, Modal, toasts via `toast.*` + `Toaster`, Spinner, FullScreenLoader) and is built only on tokens. Anything visual used more than once belongs there: a repeated combination of classes becomes a component, never a copy-pasted class string. Compose class names with `cn` from `src/lib/cn.ts`.
- Four-states convention: every data-driven screen renders loading, error, empty and data states — `DataTable` implements it for tables; other views follow the same order (loading → error → empty → data).
- `/design-system` (inside the `(app)` group, linked from the sidebar) is the living reference: it renders every token and every UI-kit component in every state. A new token or component is added there in the same commit.

## Data layer & forms

- Server state is TanStack Query; the session (`useAuthStore`) is the only client-side state that mirrors the server, everything else is fetched through queries. `QueryProvider` (`src/components/providers/`) wraps the app; `getQueryClient()` (`src/lib/queryClient.ts`) returns the browser singleton — also outside React, which is how sign-out clears the cache — and a fresh client per server render.
- Query keys come from the factory in `src/lib/queryKeys.ts` (`queryKeys.users.list(filters)`, `queryKeys.users.detail(id)` …), never inline arrays: invalidation sweeps by prefix (`invalidateQueries({ queryKey: queryKeys.users.all })`). Add a domain to the factory when a feature starts fetching.
- Feature query/mutation hooks live in `<feature>.queries.ts` / `<feature>.mutations.ts` and wrap `<feature>.api.ts` calls (which go through `apiClient`). Wrap store actions in an explicit arrow inside `mutationFn` — it receives a mutation context as a second argument that the action must not see. Mutations invalidate the keys they affect in `onSuccess`; optimistic updates use `onMutate` + `onError` rollback and are reserved for interactions where the wait is noticeable.
- Retry policy is set once in `createQueryClient`: 4xx never retries, network failures and 5xx retry a bounded number of times; mutations never retry. Session loading uses the store directly and does not retry.
- Forms are react-hook-form with zod schemas (`zodResolver`). Field schemas that mirror backend validation live in `src/lib/schemas.ts` (`emailSchema`, `passwordSchema`, `requiredString`), feature form schemas in `<feature>.schemas.ts`; keep them in sync with the backend DTOs — the form must reject exactly what the API would. Form logic (`useForm`, submit, mutation) lives in the component's hook; the component only registers fields on `Input` and renders `errors.<field>?.message`. User-facing failure text and field mapping follow the "Error handling & user feedback" section.

## Error handling & user feedback

- The backend answers every failure in one shape (`{ statusCode, error, code, message, details?, meta?, timestamp, path }`, see `template-backend/src/common/errors/`). `apiClient` parses it once into `ApiError` (`src/lib/apiError.ts`): `code` (stable, from `ERROR_CODES` — a mirror of the backend enum, keep the two in sync), `details` as `{ field, rule, message }[]`, `meta` (e.g. `retryAfterSeconds` on every 429), plus helpers (`fieldErrors`, `isValidation`, `isRateLimited`, `is(code)`). A malformed body degrades to `INTERNAL_ERROR` — never crash on an error.
- Branch on `code`, never on message text: messages are free to change, codes are not. Network failures are not `ApiError` (no response) — `getErrorMessage` names them.
- User-facing text comes only from `getErrorMessage` (`src/lib/errors.ts`): client wording for the codes it knows better, the backend message otherwise, the wait time appended for rate limits. No component formats an error on its own.
- **Toasts are the default channel**: `createQueryClient` reports every failed query and mutation with `toast.error(getErrorMessage(error))`. A query/mutation that shows its failure itself (a form with inline errors) opts out with `meta: { silent: true }` — then it must actually render the error. A 401 is never toasted: `apiClient` and the auth store own it and the user lands on the login page.
- Forms: catch the mutation error and call `applyFieldErrors(form.setError, error, FIELDS)` (`src/lib/forms.ts`). Field-bound `details` land under their inputs (typed `server:<rule>`, cleared on the next edit); the returned string, if any, is the form-level alert. Every form has both: field errors via `Input`'s `error` prop and one `role="alert"` for the rest.
- Success feedback for actions without a page change also goes through `toast.success(...)` in the mutation's `onSuccess`.

## Routing & auth

- Route groups split the app: `src/app/(auth)/` (centered card layout, signed-out visitors only) and `src/app/(app)/` (sidebar + header layout, session required). Groups do not affect URLs: pages live at `/login`, `/dashboard`, `/users`. Add every new URL to `ROUTES` in `src/lib/constants.ts` and never hard-code paths.
- `/` redirects to `/dashboard`; unknown paths render `src/app/not-found.tsx`.
- Classic bearer model: the backend returns JWTs in the response body and the client keeps both in **localStorage** (`src/features/auth/tokenStorage.ts`). localStorage is shared across tabs (the cross-tab refresh lock's re-check relies on that) but invisible to the server — so there is NO middleware/proxy auth and all route guarding is client-side; do not reintroduce a server-side auth check without moving tokens back into cookies. Every `tokenStorage` access is wrapped in try/catch: storage can be unavailable, and auth degrades to signed-out, never a crash.
- Guards are client-side and both read session state **only** from `useAuthStore` — never from `tokenStorage` directly: two sources of truth let the guards disagree and bounce a visitor between pages forever. `AuthGuard` in `(app)/layout.tsx` validates the session via `GET /users/me` and sends expired or revoked sessions to `/login?next=<path>` (path **and** query string); `GuestGuard` in `(auth)/layout.tsx` redirects signed-in users away, honouring `next`. Client guards are UX, not security — the API is the enforcement point (default-closed backend).
- Guarding is opt-in per route group now that the middleware is gone: **every new route group must wrap its layout in a guard** (`AuthGuard` for anything requiring a session, `GuestGuard` for signed-out-only pages). A page added outside a guarded group is public, and nothing in the build will warn about it.
- Only a `401` from the API means "session revoked" — a network or 5xx failure must never clear the stored tokens (see `loadSession`), or a short outage would sign every user out.
- All API calls go through `apiClient` (`src/lib/apiClient.ts`), a thin wrapper over an **axios** instance. All cross-cutting HTTP logic lives in its interceptors, never in callers: the request interceptor attaches the bearer token; the response interceptor retries once after a shared refresh on 401, on a second 401 (or a failed refresh) clears the session and notifies `useAuthStore`, and normalises every HTTP error to `ApiError` (`status`, backend `message`/`details`, raw `body`). Network failures are rethrown as-is, so callers can tell an outage from a revoked session. Pass `skipAuth: true` only for token-issuing endpoints; `retriedAfterRefresh` is internal to the interceptor. The refresh call itself uses bare `axios`, not the instance, so it never re-enters the interceptors. The refresh runs under a Web Lock (`navigator.locks`, origin-scoped) with a token re-check, so parallel tabs never redeem the same single-use refresh token — the backend treats a second redemption as theft and revokes the session family; never remove the lock or the re-check.
- Auth state lives in `useAuthStore` (`src/features/auth/auth.store.ts`); components read it through selectors, never through `getState()` in render.
- The `next` query param is validated by `getSafeNextPath` (same-origin absolute paths only). Keep it that way to avoid open redirects.
