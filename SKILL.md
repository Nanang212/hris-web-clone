---
name: hris-feature-module
description: "Use this skill whenever creating or editing a feature module in the HRIS web app (src/features/**) — new pages, api.ts, hooks.ts, or types.ts files, React Query data fetching/mutation, i18n message usage, or any file/variable/type naming inside src/features. Triggers include: 'buat fitur baru', 'tambah halaman', 'buat api.ts/hooks.ts/types.ts', 'pakai react query', 'tambah translation/i18n', or any request to scaffold a module following the auth/dashboard feature reference pattern. Every page component must be wrapped in <AppMain />. Do NOT use for shared UI primitives in src/shared/components/ui (shadcn components) or for backend code."
---

# HRIS Feature Module Conventions

Reference implementation: `src/features/auth/` and `src/features/dashboard/`.
Follow these exactly when creating or editing any feature module in `src/features/**`.

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

## 10. Checklist for a new feature module

1. `types.ts` — request payload interfaces + response data interfaces, camelCase fields, reuse `Envelope<T>`/`PaginatedData<T>`.
2. `api.ts` — one function per endpoint via `apiClient`, typed `Envelope<T>` responses, returns `res.data`.
3. `hooks.ts` — one `useQuery`/`useMutation` per endpoint; query key factory if the feature has list/detail/stats; `select` to unwrap envelope on queries; `invalidateQueries` on mutation `onSuccess`.
4. `en.json` + `id.json` — add every new message key in both files.
5. `pages/<feature>-page.tsx` — fetch via hook, render inside `<AppMain>` with `title`/`subtitle`/`breadcrumbs`/`actions`, guard `pending`/`error`/`notFound` before the full render.
6. `src/routes/...` — a `createFileRoute` file that renders the page component.

## 11. React Hook Form & Form Field components

All feature forms must use **React Hook Form** (`react-hook-form`) combined with **Zod** validation. Form UI must be built with the shared `Field` primitives — never hand-roll `<label>` / `<input>` / `<span>` for errors.

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

| Component    | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| `FieldGroup` | Wrapper around the whole form (adds spacing).                                  |
| `Field`      | Wrapper around a single label + input + error.                                 |
| `FieldLabel` | Label text. Use `htmlFor` matching the input `id`.                             |
| `FieldError` | Error message list. Pass `errors={errors.field ? [errors.field] : undefined}`. |

Rules:

- Every `Field` must have `data-invalid={!!errors.<fieldName>}` so the UI can style invalid states.
- Every `Input` must have `aria-invalid={!!errors.<fieldName>}` for a11y.
- Every `Input` must have a matching `id` and the `FieldLabel` must reference it via `htmlFor`.
- Place icons (e.g. `IconMail`, `IconLock`) as decorative elements with `pointer-events-none` inside a relative wrapper; do **not** use them as labels.

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
- Show a loading spinner inside the button when `isPending` is true.

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
6. Submit button is disabled during `isPending` and shows a spinner.
7. No hardcoded strings — all labels, placeholders, errors, and aria-labels come from `m.<key>()`.

---
