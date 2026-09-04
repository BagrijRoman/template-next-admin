# Admin Web Template — Engineering Guidelines

Next.js admin panel starter template (React, Tailwind CSS, React Query, Zustand).
These rules are binding for any assistant or contributor working in this repo.

## Code style

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
