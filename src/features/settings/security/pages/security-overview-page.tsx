import {
  IconArrowRight,
  IconClock,
  IconDevices,
  IconHistory,
  IconLock,
  IconShieldCheck,
  IconUserX,
} from '@tabler/icons-react'
import { Link, type LinkProps } from '@tanstack/react-router'
import dayjs from 'dayjs'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { snackbar } from '@/shared/lib/snackbar'
import { useGetSecurityOverview } from '@/features/settings/security/hooks'
import type { SecurityHealthStatus } from '@/features/settings/security/types'
import { m } from '@/i18n/paraglide/messages'

interface SecurityStatCardProps {
  icon: typeof IconShieldCheck
  label: string
  value: string
  detail: string
  statusVariant: 'emerald' | 'amber' | 'red' | 'blue' | 'violet'
}

interface SecurityAreaCardProps {
  number: string
  icon: typeof IconLock
  title: string
  description: string
  summary: string
  statusVariant: 'blue' | 'emerald' | 'amber' | 'violet'
  to?: NonNullable<LinkProps['to']>
}

function getSecurityStatusLabel(status: SecurityHealthStatus) {
  const labels: Record<SecurityHealthStatus, string> = {
    Healthy: m.security_overview_status_healthy(),
    Attention: m.security_overview_status_attention(),
    Critical: m.security_overview_status_critical(),
  }
  return labels[status]
}

function getSecurityStatusVariant(status: SecurityHealthStatus) {
  const variants = {
    Healthy: 'emerald',
    Attention: 'amber',
    Critical: 'red',
  } as const
  return variants[status]
}

function SecurityStatCard({
  icon: Icon,
  label,
  value,
  detail,
  statusVariant,
}: Readonly<SecurityStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <span className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-primary'>
          <Icon />
        </span>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription className='truncate'>{label}</CardDescription>
          <CardTitle>{value}</CardTitle>
          <Badge variant={statusVariant}>{detail}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function SecurityAreaCard({
  number,
  icon: Icon,
  title,
  description,
  summary,
  statusVariant,
  to,
}: Readonly<SecurityAreaCardProps>) {
  return (
    <Card className='h-full'>
      <CardHeader className='grid grid-cols-[auto_minmax(0,1fr)] gap-3'>
        <Badge variant={statusVariant} className='size-11 rounded-xl p-0'>
          {number}
        </Badge>
        <div className='flex min-w-0 flex-col gap-1'>
          <CardTitle className='flex items-center gap-2'>
            <Icon />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant={statusVariant} className='max-w-full truncate px-4'>
          {summary}
        </Badge>
      </CardContent>
      <CardFooter>
        {to ? (
          <Button asChild variant='link' className='h-auto p-0'>
            <Link to={to}>
              {m.security_overview_open_button()}
              <IconArrowRight data-icon='inline-end' />
            </Link>
          </Button>
        ) : (
          <Button
            type='button'
            variant='link'
            className='h-auto p-0'
            onClick={() => snackbar.info(m.security_overview_coming_soon())}
          >
            {m.security_overview_open_button()}
            <IconArrowRight data-icon='inline-end' />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export function SecurityOverviewPage() {
  const overviewQuery = useGetSecurityOverview()

  if (overviewQuery.isPending || overviewQuery.error || !overviewQuery.data) {
    return (
      <AppMain
        pending={overviewQuery.isPending}
        error={overviewQuery.error}
        retry={() => void overviewQuery.refetch()}
        notFound={!overviewQuery.data}
      />
    )
  }

  const overview = overviewQuery.data

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { label: m.app_layout_nav_security() },
      ]}
      title={m.security_overview_title()}
      subtitle={m.security_overview_subtitle()}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {overviewQuery.isFetching && <Spinner />}
          {m.security_overview_last_updated({
            time: dayjs(overview.lastUpdated).format('DD MMM YYYY, HH:mm'),
          })}
        </div>

        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <SecurityStatCard
            icon={IconShieldCheck}
            label={m.security_overview_security_status()}
            value={getSecurityStatusLabel(overview.securityStatus.status)}
            detail={m.security_overview_critical_alerts({
              count: overview.securityStatus.criticalAlerts,
            })}
            statusVariant={getSecurityStatusVariant(overview.securityStatus.status)}
          />
          <SecurityStatCard
            icon={IconUserX}
            label={m.security_overview_locked_accounts()}
            value={overview.lockedAccounts.count.toLocaleString()}
            detail={
              overview.lockedAccounts.count > 0
                ? m.security_overview_accounts_need_attention()
                : m.security_overview_no_locked_accounts()
            }
            statusVariant={overview.lockedAccounts.count > 0 ? 'amber' : 'emerald'}
          />
          <SecurityStatCard
            icon={IconDevices}
            label={m.security_overview_registered_devices()}
            value={overview.registeredDevices.count.toLocaleString()}
            detail={m.security_overview_active_device_users({
              count: overview.registeredDevices.activeUsers.toLocaleString(),
            })}
            statusVariant='blue'
          />
          <SecurityStatCard
            icon={IconHistory}
            label={m.security_overview_audit_events_today()}
            value={overview.auditEvents.today.toLocaleString()}
            detail={m.security_overview_audited_modules({
              count: overview.auditEvents.auditedModules,
            })}
            statusVariant='violet'
          />
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <SecurityAreaCard
            number='01'
            icon={IconLock}
            title={m.security_overview_password_title()}
            description={m.security_overview_password_description()}
            summary={m.security_overview_password_summary({
              status: overview.passwordPolicy.configured
                ? m.security_overview_configured()
                : m.security_overview_not_configured(),
              locked: overview.lockedAccounts.count,
              recovery: overview.passwordPolicy.recoveryMethods,
            })}
            statusVariant='blue'
            to='/settings/security/password'
          />
          <SecurityAreaCard
            number='02'
            icon={IconDevices}
            title={m.security_overview_device_title()}
            description={m.security_overview_device_description()}
            summary={m.security_overview_device_summary({
              devices: overview.registeredDevices.count.toLocaleString(),
              unverified: overview.deviceSecurity.unverifiedDevices,
              binding: overview.deviceSecurity.bindingEnabled
                ? m.security_overview_enabled()
                : m.security_overview_disabled(),
            })}
            statusVariant='emerald'
            to='/settings/security/device'
          />
          <SecurityAreaCard
            number='03'
            icon={IconClock}
            title={m.security_overview_session_title()}
            description={m.security_overview_session_description()}
            summary={m.security_overview_session_summary({
              sessions: overview.sessionManagement.activeSessions.toLocaleString(),
              minutes: overview.sessionManagement.timeoutMinutes,
            })}
            statusVariant='amber'
          />
          <SecurityAreaCard
            number='04'
            icon={IconHistory}
            title={m.security_overview_audit_title()}
            description={m.security_overview_audit_description()}
            summary={m.security_overview_audit_summary({
              modules: overview.auditEvents.auditedModules,
              events: overview.auditEvents.today.toLocaleString(),
            })}
            statusVariant='violet'
          />
        </div>
      </div>
    </AppMain>
  )
}
