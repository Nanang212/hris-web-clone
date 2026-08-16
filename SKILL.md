---
name: hris-feature-module
description: "Use this skill whenever creating or editing a feature module in the HRIS web app (src/features/**) — new pages, api.ts, hooks.ts, or types.ts files, React Query data fetching/mutation, i18n message usage, or any file/variable/type naming inside src/features. Also use this skill for any shadcn/ui work in this project — adding, searching, fixing, debugging, styling, or composing UI, working with components.json, presets, or --preset codes. Triggers include: 'buat fitur baru', 'tambah halaman', 'buat api.ts/hooks.ts/types.ts', 'pakai react query', 'tambah translation/i18n', 'shadcn init', 'add a component', or any request to scaffold a module following the auth/dashboard feature reference pattern. Every page component must be wrapped in <AppMain />. Do NOT use for backend code."
user-invocable: false
allowed-tools: Bash(npx shadcn@latest *), Bash(pnpm dlx shadcn@latest *), Bash(bunx --bun shadcn@latest *)
---

# HRIS Feature Module Conventions

Reference implementation: `src/features/auth/` and `src/features/dashboard/`.
Follow these exactly when creating or editing any feature module in `src/features/**`.
This skill also covers shadcn/ui usage (Part B) since every feature page is built from shadcn primitives in `src/shared/components/ui`.

## 1. Folder & file layout

```
src/features/<feature-name>/
  api.ts                  # all HTTP calls for the feature
  hooks.ts                # all React Query hooks for the feature
  types.ts                # all TS types/interfaces for the feature
  components/             # feature-local presentational components
  pages/                  # page-level components (or *-page.tsx at feature root for simple features)
    <feature>-page.tsx
```

- Simple feature (like `auth`): `pages/signin-page.tsx`, `pages/signout-page.tsx`, etc.
- Feature with sub-areas (like `dashboard`): one subfolder per sub-area (`employee/`, `hr/`, `manager/`, `executive/`), each with its own `<area>-dashboard-page.tsx` and local `components/`, while `api.ts`, `hooks.ts`, `types.ts` stay flat at the feature root and cover all sub-areas.
- File names: **kebab-case**, always. `employee-dashboard-page.tsx`, `checkin-banner.tsx`, `dashboard-feedback.tsx`.
- Component export names: **PascalCase**, matching the file's purpose, e.g. `export function EmployeeDashboardPage()`, `export function SignInPage()`.
- One page component per file. Small private sub-components used only within that page can live in the same file (see `SecureAccessNotice` inside `signin-page.tsx`), but anything reused across pages goes in `components/`.

## 1.1 Shared component first

Before building any feature UI, inspect `src/shared/components/` and reuse an existing component whenever it covers the need. Do not recreate a shared primitive or its behavior inside a feature page. This is the project-specific instance of shadcn's general principle: **use existing components before writing custom markup** — see Part B, §B.2.

- Use `@/shared/components/app-layout/app-main` for page chrome and `@/shared/components/app-layout/*` for app-layout concerns.
- Use the primitives in `@/shared/components/ui/` for controls and structure: for example `Button`, `Card`, `Table`, `Tabs`, `Select`, `Input`, `Textarea`, `Badge`, `Dialog`, `Drawer`, `Popover`, `Pagination`, `Tooltip`, `Skeleton`, `Spinner`, and `Map`.
- For dates, use the existing `DatePicker` from `@/shared/components/ui/date-picker` rather than building a date input or calendar popover.
- Feature-local components are only appropriate for domain-specific compositions that cannot be represented by a shared component. If that composition is reused across feature pages, place it in the feature's `components/` folder.
- Never copy shared component markup, variants, accessibility behavior, or styling into a feature just to make a small visual variation. Pass `className` or supported props to the shared component instead.
- If the component you need doesn't exist yet under `src/shared/components/ui/`, don't hand-roll it — follow the shadcn CLI workflow in Part B, §B.5 to search and add it first.

## 2. `types.ts`

- Plain `export interface Name { ... }` — no `type` aliases for object shapes, no default export.
- Field names: **camelCase** (the axios layer auto-converts `snake_case` <-> `camelCase`, see §5 — never hand-write snake_case fields).
- Interface names: **PascalCase**, singular for a single entity (`Auth`, `SignIn`, `RoleFilterParams`), and `<Feature><Purpose>Data` for page/dashboard payload shapes (`EmployeeDashboardData`, `HRDashboardData`).
- Group request/response shapes together: request payload interfaces (`SignIn`, `SignUp`, `CreateRolePayload`, `UpdateRolePayload`) separate from response/data interfaces (`Auth`, `Role`).
- Reuse shared generics from `@/shared/types` — `Envelope<T>` wraps every API response, `PaginatedData<T>` wraps list endpoints with cursor pagination. Don't redefine these per feature.

```ts
// types.ts
export interface SignIn {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Auth {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
    createdAt: string;
    updatedAt: string;
  };
}
```

## 3. `api.ts`

- One `async` arrow function or `function` per endpoint, named as a verb phrase: `signIn`, `signOut`, `getEmployeeDashboardData`, `getRoleById`, `createRole`, `updateRole`, `deleteRole`.
- Always call through `apiClient` from `@/shared/lib/axios` — never raw `axios` or `fetch`.
- Always type the response with `Envelope<T>` from `@/shared/types`.
- **Reference pattern (preferred — mirrors auth/dashboard):** return `res.data` (the full envelope) directly. Let the calling hook's `select` pick out `.data` when needed. No try/catch — let errors propagate to React Query's `error` state.

```ts
// api.ts
import type { Auth, SignIn } from "@/features/auth/types";
import { apiClient } from "@/shared/lib/axios";
import type { Envelope } from "@/shared/types";

export const signIn = async (req: SignIn) => {
  const res = await apiClient.post<Envelope<Auth>>("/api/v1/auth/signin", req);
  return res.data;
};
```

- API paths are absolute and versioned: `'/api/v1/<resource>'`.
- Import order: external packages first, then `@/features/...`, then `@/shared/...` (see import-order in §7).

## 4. `hooks.ts`

- One hook per endpoint in `api.ts`. Naming:
  - Queries: `useGet<Thing>` for a single/page-scoped fetch (`useGetEmployeeDashboard`).
  - Mutations: `use<Verb><Thing>` (`useSignIn`, `useSignOut`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`).
- Query hooks: use `select` to unwrap the envelope so page components consume plain data, not `{ data, success, code, messages }`.

```ts
export const userRoleQueryKeys = {
  all: ["user-roles"] as const,
  stats: () => [...userRoleQueryKeys.all, "stats"] as const,
  list: (params?: RoleFilterParams) =>
    [...userRoleQueryKeys.all, "list", params] as const,
  detail: (id: string) => [...userRoleQueryKeys.all, "detail", id] as const,
};

export function useGetRoles(params?: RoleFilterParams) {
  return useQuery({
    queryKey: userRoleQueryKeys.list(params),
    queryFn: () => getRoles(params),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all });
    },
  });
}
```

- Mutations never do navigation, toasts, or side effects inside `hooks.ts` — that belongs in the page component's `onSuccess`/`onError` callbacks passed to `mutate()` (see §6).
- Don't call `useQueryClient` or invalidate anything from a query hook — only from mutation hooks.

## 5. Data conventions that api.ts/hooks.ts rely on

- `@/shared/lib/axios` (`apiClient`) auto-converts request bodies/params **camelCase → snake_case** on the way out and response bodies **snake_case → camelCase** on the way in. Always write and consume **camelCase** in `types.ts`, `api.ts`, and components — never snake_case.
- `@/shared/types.ts` exports `Envelope<T>` (`{ success, code, data, messages }`) and `PaginatedData<T>` (`{ items, hasNext, nextCursor }`). Every endpoint response is typed as `Envelope<SomeType>` or `Envelope<PaginatedData<SomeType>>`.
- On 401 with `code: 'TOKEN_EXPIRED'`, `apiClient` auto-refreshes the token and retries once; feature code never handles token refresh manually.
- `isAxiosError<Envelope<unknown>>(err)` from `@/shared/lib/axios` is the standard way to narrow a caught error to the envelope shape (used in `AppMain`'s error rendering and in `snackbar.exception`).

## 6. Page components — always use `<AppMain />`

Every route-level page component **must** render its content inside `<AppMain>` from `@/shared/components/app-layout/app-main`. Never build a page's own loading/error/not-found scaffolding — `AppMain` already handles `pending`, `error`, and `notFound` states.

```tsx
// pages/<feature>-page.tsx
import { useGetEmployeeDashboard } from "@/features/dashboard/hooks";
import { m } from "@/i18n/paraglide/messages";
import { AppMain } from "@/shared/components/app-layout/app-main";

export function EmployeeDashboardPage() {
  const { data, isPending, error } = useGetEmployeeDashboard();

  // Guard clause: let AppMain render the loading/error/empty state
  if (isPending || error || !data) {
    return <AppMain pending={isPending} error={error} notFound={!data} />;
  }

  return (
    <AppMain
      breadcrumbs={[
        { to: "/", label: "Dashboard" },
        { to: ".", label: "Employee" },
      ]}
      title={m.dashboard_employee_title()}
      subtitle={m.dashboard_employee_subtitle()}
      actions={<Button size="sm">{m.dashboard_customize()}</Button>}
    >
      {/* page content */}
    </AppMain>
  );
}
```

Rules for this pattern:

- Fetch data with a query hook from `hooks.ts` at the top of the page.
- If the page has a single primary query, use the two-branch guard-clause pattern above: an early `pending/error/notFound`-only `<AppMain>` return, then the full `<AppMain>` with real content once data is available.
- Pass `title`/`subtitle`/`breadcrumbs`/`actions` as props to `AppMain`, not as hand-rolled JSX headers.
- All page copy (`title`, `subtitle`, button labels, toasts) comes from `m.<key>()` (see §8) — never hardcode English/Indonesian strings in a page.
- For mutation-driven pages (forms, sign-in, create/update), call `.mutate()` in a submit handler and do navigation + toast in the `onSuccess`/`onError` callbacks:

```tsx
const { mutate: signIn, isPending } = useSignIn();

const handleSignIn = (values: FormValues) => {
  signIn(values, {
    onSuccess: () => {
      snackbar.success(m.auth_signin_toast_success());
      navigate({ to: "/" });
    },
    onError: (error) => {
      snackbar.exception(error);
    },
  });
};
```

- Wire the page into routing with a matching file under `src/routes/`, e.g. `src/routes/(app)/(dashboard)/dashboard.employee.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDashboardPage } from "@/features/dashboard/employee/employee-dashboard-page";

export const Route = createFileRoute("/(app)/(dashboard)/dashboard/employee")({
  component: RouteComponent,
});

function RouteComponent() {
  return <EmployeeDashboardPage />;
}
```

## 7. Imports & general style

- Import order (enforced by `@ianvs/prettier-plugin-sort-imports`): external packages → blank line → `@/features/...` → `@/i18n/...` → `@/shared/...` (alphabetical within each group).
- No semicolons, single quotes, 2-space indent (match existing files exactly — run `prettier --write` if unsure).
- Use `type` keyword for type-only imports: `import type { Auth, SignIn } from '@/features/auth/types'`.
- Variables/functions: camelCase. Components/types/interfaces: PascalCase. Constants that are truly global/static may be SCREAMING_SNAKE_CASE (rare in features).

## 7.1 Dates and times

- Use `dayjs` for all parsing, manipulation, comparison, and display formatting of dates and times. Do not use native `Date` formatting, `Intl.DateTimeFormat`, `date-fns`, or hand-written date strings in feature code.
- Import it as `import dayjs from 'dayjs'` and format display values explicitly, for example `dayjs(value).format('DD MMM YYYY')` or `dayjs(value).format('HH:mm')`.
- When the interface needs a locale-specific month/day name, configure the required Day.js locale/plugin before formatting; keep format tokens consistent within the feature.
- Use the shared `DatePicker` for date selection, and use Day.js to convert API values to and from the `Date` values it requires.

## 8. i18n (Paraglide)

- Never hardcode user-facing strings in a feature. Import the message bundle and call the message as a function: `import { m } from '@/i18n/paraglide/messages'` then `m.auth_signin_submit_button()`.
- Add every new string to **both** `src/i18n/locales/en.json` and `src/i18n/locales/id.json` (English and Indonesian) with identical keys.
- Message key naming: `<feature>_<page-or-area>_<element>_<purpose>`, all snake_case, e.g.:
  - `auth_signin_welcome_title`, `auth_signin_password_field_placeholder`, `auth_signin_toast_success`
  - `dashboard_employee_title`, `dashboard_stat_leave_balance`, `dashboard_customize`
  - `app_layout_nav_dashboard`, `app_layout_main_not_found`
- Group: `<feature>_<page>_<field>_field_label` / `_field_placeholder` for form fields, `_required` / `_invalid` for zod validation messages, `_toast_success` / `_toast_error` for mutation feedback.
- For zod schemas that need locale-aware messages, use `useSchema` from `@/shared/lib/schema` (it re-derives the schema when the locale changes) instead of a module-level `z.object(...)`:

```ts
const formSchema = useSchema(() => ({
  email: z.email({ message: m.auth_signin_email_invalid() }),
  password: z.string().min(1, { message: m.auth_signin_password_required() }),
}));
```

## 9. Toasts & errors

- Use `snackbar` from `@/shared/lib/snackbar` for all toasts (`snackbar.success(...)`, `snackbar.error(...)`).
- On a mutation's `onError`, always call `snackbar.exception(error)` — it already extracts backend `messages[]` from the `Envelope` error response and falls back to a generic message.
- shadcn's default toast primitive is `sonner` (Part B, §B.2). This project's `snackbar` wrapper is the sanctioned layer on top of it — call `snackbar.*`, never `toast()` from `sonner` directly in feature code.

## 10. Checklist for a new feature module

1. `types.ts` — request payload interfaces + response data interfaces, camelCase fields, reuse `Envelope<T>`/`PaginatedData<T>`.
2. `api.ts` — one function per endpoint via `apiClient`, typed `Envelope<T>` responses, returns `res.data`.
3. `hooks.ts` — one `useQuery`/`useMutation` per endpoint; query key factory if the feature has list/detail/stats; `select` to unwrap envelope on queries; `invalidateQueries` on mutation `onSuccess`.
4. `en.json` + `id.json` — add every new message key in both files.
5. `pages/<feature>-page.tsx` — fetch via hook, render inside `<AppMain>` with `title`/`subtitle`/`breadcrumbs`/`actions`, guard `pending`/`error`/`notFound` before the full render.
6. `src/routes/...` — a `createFileRoute` file that renders the page component.
7. Any new UI primitive needed → check `src/shared/components/ui/` first, then Part B, §B.5 (shadcn CLI) before writing custom markup.

## 11. React Hook Form & Form Field components

All feature forms must use **React Hook Form** (`react-hook-form`) combined with **Zod** validation. Form UI must be built with the shared `Field` primitives — never hand-roll `<label>` / `<input>` / `<span>` for errors. This section is the feature-layer application of shadcn's forms rules (Part B, §B.3) — read both together.

### 11.1 Schema definition

- Derive the Zod schema with `useSchema` from `@/shared/lib/schema` so validation messages re-render when the locale changes. Do **not** define a module-level `z.object(...)`.
- Import `z` from `zod` (not from any other package).
- Use `z.email()` for e-mail fields, `z.string().min(1, ...)` for required fields.
- Message keys follow the pattern `<feature>_<page>_<field>_required` / `_invalid`.

```ts
const formSchema = useSchema(() => ({
  email: z.email({ message: m.auth_signin_email_invalid() }),
  password: z.string().min(1, { message: m.auth_signin_password_required() }),
  rememberMe: z.boolean().optional(),
}))
```

### 11.2 `useForm` setup

- Always pass `resolver: zodResolver(formSchema)`.
- Provide `defaultValues` for every field to keep the form controlled from the start.
- Destructure `register`, `handleSubmit`, `control`, and `formState: { errors }`.

```ts
const {
  register,
  handleSubmit,
  control,
  formState: { errors },
} = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    email: '',
    password: '',
    rememberMe: false,
  },
})
```

### 11.3 Form markup with `Field` primitives

Import from `@/shared/components/ui/field`:

| Component    | Purpose                                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `FieldGroup` | Wrapper around the whole form (adds spacing). Never a raw `div` with `space-y-*`/`grid gap-*` — see Part B, §B.1. |
| `Field`      | Wrapper around a single label + input + error.                                                                    |
| `FieldLabel` | Label text. Use `htmlFor` matching the input `id`.                                                                |
| `FieldError` | Error message list. Pass `errors={errors.field ? [errors.field] : undefined}`.                                    |

Rules:

- Every `Field` must have `data-invalid={!!errors.<fieldName>}` so the UI can style invalid states.
- Every `Input` must have `aria-invalid={!!errors.<fieldName>}` for a11y.
- Every `Input` must have a matching `id` and the `FieldLabel` must reference it via `htmlFor`.
- Place icons (e.g. `IconMail`, `IconLock`) as decorative elements with `pointer-events-none` inside a relative wrapper; do **not** use them as labels. This applies to icons placed _inside an input_ — icons inside a `Button` follow the different `data-icon` convention in Part B, §B.4.
- For a set of 2–7 mutually-exclusive choices, use `ToggleGroup` (Part B, §B.1) instead of looping `Button` with manual active state.
- Group related checkboxes/radios with `FieldSet` + `FieldLegend`, not a `div` with a heading.

```tsx
<Field data-invalid={!!errors.email}>
  <FieldLabel htmlFor='email'>{m.auth_signin_email_field_label()}</FieldLabel>
  <div className='relative'>
    <IconMail size={16} className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground' />
    <Input
      id='email'
      placeholder={m.auth_signin_email_field_placeholder()}
      className='pl-9'
      aria-invalid={!!errors.email}
      {...register('email')}
    />
  </div>
  <FieldError errors={errors.email ? [errors.email] : undefined} />
</Field>
```

### 11.4 Controlled components (`Controller`)

For components that do not expose a native ref (e.g. `Checkbox`, custom selects, date pickers), use `Controller` from `react-hook-form` instead of `register`.

```tsx
<Controller
  name='rememberMe'
  control={control}
  render={({ field }) => (
    <Checkbox
      id='remember-me'
      checked={field.value}
      onCheckedChange={field.onChange}
    />
  )}
/>
```

Rules:

- Always wire `field.value` → component value prop.
- Always wire component change handler → `field.onChange`.
- If the component uses `checked` (boolean), map it explicitly; do not spread `field` blindly.

### 11.5 Submit handler

- Call `handleSubmit(yourHandler)` on the `<form>` element.
- Inside the handler, call the mutation's `.mutate()` and put navigation / toast side effects in the mutation's `onSuccess` / `onError` callbacks (see §6).
- Disable the submit button with `disabled={isPending}` while the mutation is in flight.
- Show a loading spinner inside the button when `isPending` is true. shadcn's `Button` has no built-in `isPending`/`isLoading` prop — compose `Spinner` + `disabled` yourself, as below.

```tsx
<form className='space-y-5' onSubmit={handleSubmit(onSubmit)} noValidate>
  <FieldGroup>
    {/* fields */}
    <Button type='submit' className='w-full' disabled={isPending}>
      {isPending && <IconLoader2 className='animate-spin' />}
      {m.auth_signin_submit_button()}
    </Button>
  </FieldGroup>
</form>
```

> **Note (needs a decision):** shadcn's icon rule (Part B, §B.4) says icons inside a `Button` should carry `data-icon="inline-start"`/`"inline-end"` and no manual sizing classes, so the component handles spacing/sizing itself. The spinner above uses a bare `animate-spin` class with no `data-icon`, and existing HRIS code follows this older pattern. Decide once and apply consistently:
>
> - Adopt shadcn's convention: `<IconLoader2 data-icon="inline-start" className="animate-spin" />`, and audit existing buttons for the same fix, or
> - Keep the current HRIS pattern as an intentional project deviation and note it here explicitly.
>   This skill currently documents the existing HRIS pattern above; update this section once the team decides.

### 11.6 Password visibility toggle

When a password field needs a show/hide toggle:

- Use a local `useState` for `showPassword`.
- Render a `<button type='button'>` (not an `<IconButton>`) absolutely positioned inside the input wrapper.
- Provide an `aria-label` that switches based on state, using i18n message keys.
- Toggle `Input` type between `'text'` and `'password'`.

```tsx
const [showPassword, setShowPassword] = useState(false)

<Input
  id='password'
  type={showPassword ? 'text' : 'password'}
  {...register('password')}
/>
<button
  type='button'
  onClick={() => setShowPassword((prev) => !prev)}
  aria-label={showPassword ? m.auth_signin_password_hide_label() : m.auth_signin_password_show_label()}
>
  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
</button>
```

### 11.7 Form checklist

1. Schema created with `useSchema`, messages from `m.<key>()`, imported `z` from `zod`.
2. `useForm` configured with `zodResolver`, explicit `defaultValues`, and typed with `z.infer<typeof formSchema>`.
3. Every field wrapped in `<Field data-invalid={!!errors.x}>`.
4. Every input has matching `id` / `htmlFor`, `aria-invalid`, and `FieldError`.
5. Controlled non-native inputs use `<Controller name='x' control={control} render={...} />`.
6. Submit button is disabled during `isPending` and shows a spinner (see the data-icon note in §11.5).
7. No hardcoded strings — all labels, placeholders, errors, and aria-labels come from `m.<key>()`.
8. Option sets of 2–7 choices use `ToggleGroup`, not looped `Button`s.

---

# Part B: shadcn/ui (component library rules)

Everything under `src/shared/components/ui/` in this project is a shadcn component — source code added to the repo via the CLI, not an npm dependency. The rules below govern how those primitives are added, updated, styled, and composed. Feature code (Part A) consumes these; it should never fork or restyle them.

> **IMPORTANT:** Run all CLI commands using the project's package runner: `npx shadcn@latest`, `pnpm dlx shadcn@latest`, or `bunx --bun shadcn@latest` — based on the project's `packageManager` field from project context. Examples below use `npx shadcn@latest`; substitute the correct runner.

## B.0 Current project context

```json
!`npx shadcn@latest info --json`
```

Use `npx shadcn@latest docs <component>` to get documentation and example URLs for any component.

## B.1 Critical rules — Styling & Tailwind

- **`className` for layout, not styling.** Never override component colors or typography.
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*`. For vertical stacks, `flex flex-col gap-*`.
- **Use `size-*` when width and height are equal.** `size-10` not `w-10 h-10`.
- **Use `truncate` shorthand.** Not `overflow-hidden text-ellipsis whitespace-nowrap`.
- **No manual `dark:` color overrides.** Use semantic tokens (`bg-background`, `text-muted-foreground`).
- **Use `cn()` for conditional classes.** Don't write manual template literal ternaries.
- **No manual `z-index` on overlay components.** Dialog, Sheet, Popover, etc. handle their own stacking.
- **Use semantic colors.** `bg-primary`, `text-muted-foreground` — never raw values like `bg-blue-500`.
- **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`, etc.

## B.2 Critical rules — Composition & existing components

- **Use existing components first.** Run `npx shadcn@latest search` to check registries (and community registries) before writing custom UI. In this project, also check `src/shared/components/ui/` per Part A, §1.1.
- **Compose, don't reinvent.** Settings page = Tabs + Card + form controls. Dashboard = Sidebar + Card + Chart + Table.
- **Items always inside their Group.** `SelectItem` → `SelectGroup`. `DropdownMenuItem` → `DropdownMenuGroup`. `CommandItem` → `CommandGroup`.
- **Use `asChild` (radix) or `render` (base) for custom triggers.** Check the `base` field from `npx shadcn@latest info`.
- **Dialog, Sheet, and Drawer always need a Title.** `DialogTitle`, `SheetTitle`, `DrawerTitle` required for accessibility. Use `className="sr-only"` if visually hidden.
- **Use full Card composition.** `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`. Don't dump everything in `CardContent`.
- **Button has no `isPending`/`isLoading`.** Compose with `Spinner` + `data-icon` + `disabled` (see Part A, §11.5 for this project's current pattern and the open decision on `data-icon`).
- **`TabsTrigger` must be inside `TabsList`.** Never render triggers directly in `Tabs`.
- **`Avatar` always needs `AvatarFallback`.** For when the image fails to load.
- **Callouts use `Alert`.** Don't build custom styled divs.
- **Empty states use `Empty`.** Don't build custom empty state markup.
- **Toast via `sonner`** at the primitive level — in this project, always go through the `snackbar` wrapper (Part A, §9), never call `toast()` directly in feature code.
- **Use `Separator`** instead of `<hr>` or `<div className="border-t">`.
- **Use `Skeleton`** for loading placeholders. No custom `animate-pulse` divs.
- **Use `Badge`** instead of custom styled spans.

## B.3 Critical rules — Forms & Inputs

- **Forms use `FieldGroup` + `Field`.** Never use raw `div` with `space-y-*` or `grid gap-*` for form layout. See Part A, §11.3 for this project's `Field` import path and usage.
- **`InputGroup` uses `InputGroupInput`/`InputGroupTextarea`.** Never raw `Input`/`Textarea` inside `InputGroup`.
- **Buttons inside inputs use `InputGroup` + `InputGroupAddon`.**
- **Option sets (2–7 choices) use `ToggleGroup`.** Don't loop `Button` with manual active state.
- **`FieldSet` + `FieldLegend` for grouping related checkboxes/radios.** Don't use a `div` with a heading.
- **Field validation uses `data-invalid` + `aria-invalid`.** `data-invalid` on `Field`, `aria-invalid` on the control. For disabled: `data-disabled` on `Field`, `disabled` on the control.

## B.4 Critical rules — Icons

- **Icons in `Button` use `data-icon`.** `data-icon="inline-start"` or `data-icon="inline-end"` on the icon.
- **No sizing classes on icons inside components.** Components handle icon sizing via CSS. No `size-4` or `w-4 h-4`.
- **Pass icons as objects, not string keys.** `icon={CheckIcon}`, not a string lookup.
- **Check `iconLibrary` from project context before importing.** Don't assume `lucide-react` — this project's form examples (Part A, §11) use Tabler-style names (`IconMail`, `IconLock`, `IconEye`, `IconEyeOff`, `IconLoader2`), which points to `@tabler/icons-react`. Confirm against `npx shadcn@latest info --json` rather than assuming.
- Icons placed _decoratively inside an input_ (Part A, §11.3) are a different case from icons inside a `Button` — the `pointer-events-none` wrapper pattern there is correct and is not superseded by `data-icon`.

## B.5 Key Patterns

```tsx
// Form layout: FieldGroup + Field, not div + Label.
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>

// Validation: data-invalid on Field, aria-invalid on the control.
<Field data-invalid>
  <FieldLabel>Email</FieldLabel>
  <Input aria-invalid />
  <FieldDescription>Invalid email.</FieldDescription>
</Field>

// Icons in buttons: data-icon, no sizing classes.
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>

// Spacing: gap-*, not space-y-*.
<div className="flex flex-col gap-4">  // correct
<div className="space-y-4">           // wrong

// Equal dimensions: size-*, not w-* h-*.
<Avatar className="size-10">   // correct
<Avatar className="w-10 h-10"> // wrong

// Status colors: Badge variants or semantic tokens, not raw colors.
<Badge variant="secondary">+20.1%</Badge>    // correct
<span className="text-emerald-600">+20.1%</span> // wrong
```

## B.6 Component selection

| Need                       | Use                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Button/action              | `Button` with appropriate variant                                                                   |
| Form inputs                | `Input`, `Select`, `Combobox`, `Switch`, `Checkbox`, `RadioGroup`, `Textarea`, `InputOTP`, `Slider` |
| Toggle between 2–5 options | `ToggleGroup` + `ToggleGroupItem`                                                                   |
| Data display               | `Table`, `Card`, `Badge`, `Avatar`                                                                  |
| Navigation                 | `Sidebar`, `NavigationMenu`, `Breadcrumb`, `Tabs`, `Pagination`                                     |
| Overlays                   | `Dialog` (modal), `Sheet` (side panel), `Drawer` (bottom sheet), `AlertDialog` (confirmation)       |
| Feedback                   | `sonner` (toast, via `snackbar` in this project), `Alert`, `Progress`, `Skeleton`, `Spinner`        |
| Command palette            | `Command` inside `Dialog`                                                                           |
| Charts                     | `Chart` (wraps Recharts)                                                                            |
| Layout                     | `Card`, `Separator`, `Resizable`, `ScrollArea`, `Accordion`, `Collapsible`                          |
| Empty states               | `Empty`                                                                                             |
| Menus                      | `DropdownMenu`, `ContextMenu`, `Menubar`                                                            |
| Tooltips/info              | `Tooltip`, `HoverCard`, `Popover`                                                                   |

## B.7 Key fields from project context

- **`aliases`** → use the actual alias prefix for imports (e.g. `@/`), never hardcode.
- **`isRSC`** → when `true`, components using `useState`, `useEffect`, event handlers, or browser APIs need `"use client"` at the top of the file.
- **`tailwindVersion`** → `"v4"` uses `@theme inline` blocks; `"v3"` uses `tailwind.config.js`.
- **`tailwindCssFile`** → the global CSS file where custom CSS variables are defined. Always edit this file, never create a new one.
- **`style`** → component visual treatment (e.g. `nova`, `vega`).
- **`base`** → primitive library (`radix` or `base`). Affects component APIs and available props.
- **`iconLibrary`** → determines icon imports (see B.4).
- **`resolvedPaths`** → exact file-system destinations for components, utils, hooks, etc. — in this project, `resolvedPaths.ui` should resolve to `src/shared/components/ui`.
- **`framework`** → routing and file conventions (this project uses TanStack Router file routes, see Part A, §6).
- **`packageManager`** → use this for any non-shadcn dependency installs.
- **`preset`** → resolved preset code and values for the current project.

## B.8 Component docs, examples, and usage

Run `npx shadcn@latest docs <component>` to get the URLs for a component's documentation, examples, and API reference, then fetch those URLs.

```bash
npx shadcn@latest docs button dialog select
```

**When creating, fixing, debugging, or using a component, always run `npx shadcn@latest docs` and fetch the URLs first.** This ensures you're working with the correct API and usage patterns rather than guessing.

## B.9 Workflow — adding/updating shadcn components in this project

1. **Get project context** — `npx shadcn@latest info` (or `--json`).
2. **Check installed components first** — before running `add`, check the `components` list from project context or list `resolvedPaths.ui` (`src/shared/components/ui`). Don't import components that haven't been added, and don't re-add ones already installed. Cross-check against Part A, §1.1's list of shared primitives already in use.
3. **Find components** — `npx shadcn@latest search`.
4. **Get docs and examples** — `npx shadcn@latest docs <component>`, then fetch the URLs. Use `npx shadcn@latest view` to browse registry items not yet installed. Use `npx shadcn@latest add --diff` to preview changes to installed components.
5. **Install or update** — `npx shadcn@latest add`. When updating existing components, use `--dry-run` and `--diff` first (§B.10).
6. **Fix imports in third-party components** — after adding from a community registry (e.g. `@bundui`, `@magicui`), check added non-UI files for hardcoded `@/components/ui/...` paths that won't match this project's `@/shared/components/ui` alias. Rewrite them.
7. **Review added components** — always read the added files. Check for missing sub-components (e.g. `SelectItem` without `SelectGroup`), missing imports, incorrect composition, or violations of §B.1–B.4. Swap icon imports to match this project's `iconLibrary` (§B.4). Fix all issues before moving on.
8. **Registry must be explicit** — when the user asks to add a block or component, do not guess the registry (`@shadcn`, `@tailark`, `owner/repo`, etc.). If unspecified, ask.
9. **Switching presets** — ask the user first: overwrite, partial, merge, or skip? See §B.11 for the exact commands. Always run preset commands inside the project directory (`components.json` must exist).

## B.10 Updating components from upstream

**NEVER fetch raw files from GitHub manually — always use the CLI.**

1. `npx shadcn@latest add <component> --dry-run` to see all files that would be affected.
2. `npx shadcn@latest add <component> --diff <file>` per file to see upstream vs local changes.
3. Decide per file: no local changes → safe to overwrite; has local changes → read the local file, analyze the diff, apply upstream updates while preserving local modifications.
4. **Never use `--overwrite` without the user's explicit approval**, even if they say "just update everything" — confirm first.

## B.11 Preset commands

- Inspect current preset: `npx shadcn@latest preset resolve` (`--json` for structured values).
- Inspect incoming preset: `npx shadcn@latest preset decode <code>`; share/open with `preset url <code>` / `preset open <code>`.
- Overwrite: `npx shadcn@latest apply <code>`.
- Partial: `npx shadcn@latest apply <code> --only theme,font` (only `theme`/`font` supported; `icon` intentionally excluded since it may require full component reinstall).
- Merge: `npx shadcn@latest init --preset <code> --force --no-reinstall`, then `npx shadcn@latest info` to list installed components, then `--dry-run`/`--diff` (§B.10) per component.
- Skip: `npx shadcn@latest init --preset <code> --force --no-reinstall`.
- The CLI preserves the current `base` (`radix` vs `base`) from `components.json` automatically. If working from a scratch directory, pass `--base <current-base>` explicitly.

## B.12 Quick reference

```bash
# Project context
npx shadcn@latest info
npx shadcn@latest info --json

# Add components
npx shadcn@latest add button card dialog
npx shadcn@latest add @magicui/shimmer-button
npx shadcn@latest add owner/repo/item
npx shadcn@latest add --all

# Preview changes before adding/updating
npx shadcn@latest add button --dry-run
npx shadcn@latest add button --diff button.tsx
npx shadcn@latest add owner/repo/item --dry-run

# Search registries
npx shadcn@latest search @shadcn -q "sidebar"
npx shadcn@latest search @tailark -q "stats"
npx shadcn@latest search owner/repo -q "login"
npx shadcn@latest search
npx shadcn@latest search @shadcn -q "menu" -t ui

# Component docs
npx shadcn@latest docs button dialog select

# View registry item details
npx shadcn@latest view @shadcn/button
npx shadcn@latest view owner/repo/item

# Presets
npx shadcn@latest preset decode a2r6bw
npx shadcn@latest preset url a2r6bw
npx shadcn@latest preset open a2r6bw
npx shadcn@latest preset resolve
npx shadcn@latest preset resolve --json
npx shadcn@latest apply a2r6bw
npx shadcn@latest apply a2r6bw --only theme,font
```

**Named presets:** `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`
**Templates:** `next`, `vite`, `start`, `react-router`, `astro` (all support `--monorepo`) and `laravel` (not supported for monorepo)
**Preset codes:** Version-prefixed base62 strings (e.g. `a2r6bw` or `b0`), from [ui.shadcn.com](https://ui.shadcn.com).

## B.13 Detailed references (upstream shadcn skill files — not bundled here)

If your environment has the full shadcn skill package installed alongside this one, these files contain the exhaustive Incorrect/Correct pairs behind each rule above:

- `rules/forms.md` — FieldGroup, Field, InputGroup, ToggleGroup, FieldSet, validation states
- `rules/composition.md` — Groups, overlays, Card, Tabs, Avatar, Alert, Empty, Toast, Separator, Skeleton, Badge, Button loading
- `rules/icons.md` — data-icon, icon sizing, passing icons as objects
- `rules/styling.md` — Semantic colors, variants, className, spacing, size, truncate, dark mode, cn(), z-index
- `rules/base-vs-radix.md` — asChild vs render, Select, ToggleGroup, Slider, Accordion
- `cli.md` — Commands, flags, presets, templates
- `registry.md` — Authoring source registries, include, item definitions, dependencies, GitHub registry rules
- `customization.md` — Theming, CSS variables, extending components
