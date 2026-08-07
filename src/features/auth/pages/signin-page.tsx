import {
  IconBuilding,
  IconCalendarCheck,
  IconChartAreaLine,
  IconLayoutGrid,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconShieldLock,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import IconHris from '@/shared/components/icon-hris'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

export type SignInPageProps = React.ComponentProps<'div'>

const FEATURES = [
  {
    icon: IconLayoutGrid,
    title: m.auth_signin_feature_platform_title,
    description: m.auth_signin_feature_platform_desc,
  },
  {
    icon: IconShieldLock,
    title: m.auth_signin_feature_secure_title,
    description: m.auth_signin_feature_secure_desc,
  },
  {
    icon: IconChartAreaLine,
    title: m.auth_signin_feature_insight_title,
    description: m.auth_signin_feature_insight_desc,
  },
] as const

const ATTENDANCE_SUMMARY = [
  {
    label: m.auth_signin_summary_present_label,
    value: 1183,
    tone: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: m.auth_signin_summary_late_label,
    value: 45,
    tone: 'text-amber-600 dark:text-amber-400',
  },
  {
    label: m.auth_signin_summary_absent_label,
    value: 20,
    tone: 'text-red-600 dark:text-red-400',
  },
  {
    label: m.auth_signin_summary_leave_label,
    value: 32,
    tone: 'text-emerald-600 dark:text-emerald-400',
  },
] as const

function BrandMark() {
  return (
    <Link
      to="/"
      className="relative z-10 flex items-center gap-2 text-lg font-semibold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <IconHris />
      </span>
      <span>{m.auth_signin_brand_name()}</span>
    </Link>
  )
}

function HeroPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary/5 p-10 text-foreground lg:flex">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <BrandMark />
        </div>

        <div className="max-w-md space-y-2">
          <h1 className="text-3xl leading-tight font-bold text-balance">
            {m.auth_signin_hero_headline()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {m.auth_signin_hero_subheadline()}
          </p>
        </div>

        <div className="grid grid-cols-[1fr_auto] items-start gap-6">
          <ul className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title()} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{title()}</p>
                  <p className="text-xs text-muted-foreground">
                    {description()}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3">
            <div className="w-44 space-y-1 rounded-xl border bg-background/80 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconUsers size={14} />
                {m.auth_signin_stat_total_employees_label()}
              </div>
              <p className="text-xl font-bold">1,248</p>
              <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <IconTrendingUp size={12} />
                {m.auth_signin_stat_total_employees_growth({
                  percent: '12,5%',
                })}
              </p>
            </div>

            <div className="w-44 space-y-1 rounded-xl border bg-background/80 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <IconCalendarCheck size={14} />
                {m.auth_signin_stat_attendance_today_label()}
              </div>
              <p className="text-xl font-bold">98.2%</p>
              <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <IconTrendingUp size={12} />
                {m.auth_signin_stat_attendance_today_growth({
                  percent: '3,6%',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="w-fit space-y-2 rounded-xl border bg-background/80 p-3 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold">
            {m.auth_signin_summary_title()}
          </p>
          <div className="flex gap-6">
            {ATTENDANCE_SUMMARY.map(({ label, value, tone }) => (
              <div key={label()} className="space-y-1 text-center">
                <p className="text-[0.65rem] text-muted-foreground">
                  {label()}
                </p>
                <p className={cn('text-sm font-bold', tone)}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground">
        <p>
          {m.auth_signin_footer_copyright({ year: new Date().getFullYear() })}
        </p>
        <p>{m.auth_signin_footer_help()}</p>
      </div>
    </div>
  )
}

function SignInForm() {
  return (
    <div className="w-full max-w-sm space-y-8">
      <Link
        to="/"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight lg:hidden"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <IconShieldCheck size={18} />
        </span>
        <span>{m.auth_signin_brand_name()}</span>
      </Link>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {m.auth_signin_welcome_title()}
        </h1>
        <p className="text-sm text-muted-foreground">
          {m.auth_signin_welcome_subtitle()}
        </p>
      </div>

      <form className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="company">
              {m.auth_signin_company_field_label()}
            </FieldLabel>
            <div className="relative">
              <IconBuilding
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="company"
                placeholder={m.auth_signin_company_field_placeholder()}
                className="pl-9"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">
              {m.auth_signin_email_field_label()}
            </FieldLabel>
            <div className="relative">
              <IconMail
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                placeholder={m.auth_signin_email_field_placeholder()}
                className="pl-9"
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">
              {m.auth_signin_password_field_label()}
            </FieldLabel>
            <div className="relative">
              <IconLock
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type="password"
                placeholder={m.auth_signin_password_field_placeholder()}
                className="pl-9"
                required
              />
            </div>
          </Field>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember-me" defaultChecked />
              <FieldLabel
                htmlFor="remember-me"
                className="text-sm font-normal text-muted-foreground"
              >
                {m.auth_signin_remember_me_label()}
              </FieldLabel>
            </div>
            <Link
              to="."
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {m.auth_signin_forgot_password_link()}
            </Link>
          </div>

          <Button type="submit" className="w-full">
            {m.auth_signin_submit_button()}
          </Button>
        </FieldGroup>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {m.auth_signin_divider_or()}
          </span>
        </div>
      </div>

      <Button variant="outline" type="button" className="w-full">
        {m.auth_signin_sso_button()}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {m.auth_signin_terms_prefix()}{' '}
        <Link to="/" className="underline underline-offset-4">
          {m.auth_signin_terms_privacy_link()}
        </Link>{' '}
        {m.auth_signin_terms_and()}{' '}
        <Link to="/" className="underline underline-offset-4">
          {m.auth_signin_terms_service_link()}
        </Link>
        .
      </p>
    </div>
  )
}

export function SignInPage({ className, ...props }: SignInPageProps) {
  return (
    <div
      className={cn('grid min-h-screen w-full lg:grid-cols-2', className)}
      {...props}
    >
      <HeroPanel />
      <div className="flex items-center justify-center p-6 sm:p-10">
        <SignInForm />
      </div>
    </div>
  )
}
