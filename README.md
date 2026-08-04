# HRIS Web

An HRIS (Human Resource Information System) web app — React + TypeScript + Vite, with file-based routing (TanStack Router) and shadcn/ui components.

## Tech Stack

| Layer         | Tools                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Framework     | React 19 + Vite                                                                               |
| Language      | TypeScript (strict mode)                                                                      |
| Routing       | [TanStack Router](https://tanstack.com/router) — file-based routing, automatic code-splitting |
| Styling       | Tailwind CSS v4                                                                               |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (style: `radix-luma`, base color: `stone`)                 |
| Icons         | [@tabler/icons-react](https://tabler.io/icons)                                                |
| Client state  | [Zustand](https://zustand.docs.pmnd.rs)                                                       |
| Formatting    | Prettier (+ `prettier-plugin-tailwindcss`)                                                    |
| Linting       | ESLint (flat config)                                                                          |

## Getting Started

```bash
pnpm install       # or npm install
pnpm dev           # start dev server
pnpm build         # tsc -b && vite build
pnpm lint          # eslint .
pnpm format        # prettier --write "**/*.{ts,tsx}"
pnpm typecheck     # tsc --noEmit
```

Before committing / finishing a task, always run `pnpm typecheck` and `pnpm lint` — this repo is strict about it (see [Code Style](#code-style)).

## Project Structure

```
src/
├── routes/                    # TanStack Router — file-based routing (NO business logic here)
│   ├── __root.tsx               # root layout (ThemeProvider, devtools)
│   ├── (auth)/                  # route group: auth pages (no sidebar/navbar)
│   │   ├── signin.tsx
│   │   └── signout.tsx
│   └── (app)/                   # route group: main app pages (with sidebar/navbar)
│       ├── route.tsx            # layout: AppSidebar + AppNavbar + <Outlet/>
│       ├── (dashboard)/index.tsx
│       ├── employee/index.tsx
│       ├── attendance/index.tsx
│       ├── leave/index.tsx
│       ├── payroll/index.tsx
│       ├── performance/index.tsx
│       ├── report/index.tsx
│       └── settings/index.tsx
├── features/                  # logic & UI grouped by business domain
│   ├── auth/
│   │   ├── api.ts               # API calls for this feature
│   │   ├── hooks.ts             # Custom hooks for this feature using tanstack query
│   │   ├── types.ts             # types/interfaces for this feature
│   │   └── pages/
│   │       ├── signin-page.tsx
│   │       └── signout-page.tsx
│   └── dashboard/
│       ├── api.ts
│       ├── types.ts
│       ├── pages/
│       │   └── dashboard-page.tsx
│       └── components/          # components specific to this feature only
│           └── summary-section.tsx
└── shared/                    # used across features, no feature-specific business logic
    ├── components/
    │   ├── ui/                  # shadcn/ui components (auto-generated, avoid manual edits)
    │   ├── app-layout/           # AppNavbar, AppSidebar
    │   └── theme-provider.tsx
    ├── hooks/                   # generic hooks (e.g. use-mobile.ts)
    └── lib/                     # generic utilities (e.g. utils.ts -> cn())
```

### The `routes/` vs `features/` Split

This is the single most important pattern in this repo:

- **`routes/*`** contains only _wiring_: `createFileRoute(...)` plus a thin component that renders a page from `features/`. No complex JSX or business logic lives here.
- **`features/<feature-name>/pages/*`** contains the actual implementation of the page.

Example (`employee`):

```tsx
// src/routes/(app)/employee/index.tsx
import { EmployeePage } from '@/features/employee/pages/employee-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/employee/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeePage />
}
```

## Conventions

- **Path alias**: always use `@/...` (points to `src/`), avoid relative imports that cross multiple folders (`../../..`).
- **File names**: `kebab-case.tsx` for every file (components, pages, hooks, utils).
- **Component names**: `PascalCase`; page components are suffixed with `Page` (`DashboardPage`, `SignInPage`).
- **Root component props** typically extend `React.ComponentProps<'div'>` and accept `className` + spread `...props`, merged via `cn()`.
- **Import order** within a file: external packages first, then `@/...` aliases, then relative imports — let Prettier/ESLint handle the rest.
- **Styling**: always merge classNames with `cn()` from `@/shared/lib/utils`, never string concatenation.
- **Icons**: use `@tabler/icons-react` (`Icon...`) only, don't mix in other icon sets (lucide, heroicons, etc.).
- **Lightweight global state**: use Zustand. Feature-specific stores live inside `features/<feature>/`; cross-feature stores live in `shared/`.

## Adding a New Feature (Feature + Route)

Follow these steps to stay consistent with the existing pattern (example: adding an `employee` feature):

1. **Create the feature folder**: `src/features/employee/` containing:
   - `types.ts` — domain types (e.g. `Employee`, `EmployeeListResponse`)
   - `api.ts` — API call functions (fetch/create/update/delete)
   - `pages/employee-page.tsx` — the main page component
   - `components/` — small components specific to this feature (optional)
2. **Wire it to the route**: edit the existing route file at `src/routes/(app)/employee/index.tsx` (the route stub is usually already created by the TanStack Router plugin) so it renders `<EmployeePage />` from `features/employee/pages/employee-page.tsx`, following the example above.
3. **Never manually regenerate `routeTree.gen.ts`** — this file is auto-generated by `@tanstack/router-plugin` while `pnpm dev` / `pnpm build` runs.
4. If the page needs a sidebar entry, add it to the `mainMenu` array in `src/shared/components/app-layout/app-sidebar.tsx`.
5. Run `pnpm typecheck` and `pnpm lint` before considering the task done.

## Adding a shadcn/ui Component

```bash
npx shadcn@latest add <component-name>
```

Alias configuration is already set in `components.json`, so components land automatically in `src/shared/components/ui/` (not the default `src/components/ui/`). The style used is `radix-luma` with base color `stone` and icon library `tabler` — don't override this per component.

## Code Style

- Prettier: **no semicolons**, **single quotes**, `printWidth` 80, trailing comma `es5`, Tailwind classes auto-sorted via `prettier-plugin-tailwindcss`.
- ESLint flat config (`eslint.config.js`) includes `typescript-eslint`, `react-hooks`, and `react-refresh`.
- TypeScript strict mode is on (`noUnusedLocals`, `noUnusedParameters`, etc.) — don't disable these rules for a "quick fix".

## Branch Naming

Format: `<type>/<short-description>`, using `kebab-case`, in English, describing what the branch does.

| Type        | Use for                                                                          |
| ----------- | -------------------------------------------------------------------------------- |
| `feature/`  | new feature or page (e.g. `feature/employee-list`)                               |
| `fix/`      | bug fix (e.g. `fix/signin-redirect-loop`)                                        |
| `chore/`    | tooling, config, dependency, or non-code changes (e.g. `chore/upgrade-tailwind`) |
| `refactor/` | code change with no behavior change (e.g. `refactor/dashboard-page-structure`)   |
| `docs/`     | documentation only (e.g. `docs/update-readme`)                                   |

Examples: `feature/leave-request-form`, `fix/sidebar-active-state`, `chore/add-eslint-rule`.

Branch off `main`/`develop` (whichever is the team's integration branch) and keep the description short — 2-5 words is enough, the ticket/issue number can be appended if there is one (`feature/payroll-export-JIRA-123`).

## Commit Message Convention

This repo follows **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

- **type** — one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `build`, `ci`.
- **scope** (optional but encouraged) — the feature or area touched, matching the folder name where possible: `auth`, `dashboard`, `employee`, `attendance`, `leave`, `payroll`, `performance`, `report`, `settings`, `shared`, `routes`.
- **summary** — imperative mood, lowercase, no trailing period, under ~72 characters (e.g. `add employee list page`, not `Added employee list page.`).

Examples:

```
feat(employee): add employee list page with search
fix(auth): prevent redirect loop on expired session
refactor(dashboard): extract summary section into its own component
chore: upgrade tailwindcss to v4.1
docs: document branch and commit conventions
```

Breaking changes: add `!` after the type/scope and explain in the footer:

```
feat(auth)!: replace session cookie with JWT

BREAKING CHANGE: existing sessions will be invalidated on deploy.
```

Keep each commit focused on one logical change — avoid bundling an unrelated feature, a formatting pass, and a dependency bump into a single commit.

## Additional Notes

See also `.claude/skills/hris-web-dev/SKILL.md` for the same guidance in skill format, automatically picked up by Claude when doing further development in this repo.
