import {
  IconArrowsExchange,
  IconDeviceMobile,
  IconDeviceMobilePlus,
  IconDevices,
  IconLink,
  IconRefresh,
  IconSettings,
  IconShieldX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
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
import { useGetDeviceSecurity } from '@/features/settings/security/hooks'
import { m } from '@/i18n/paraglide/messages'

interface DeviceSecurityStatCardProps {
  icon: typeof IconDevices
  label: string
  value: string
  detail: string
  variant: 'blue' | 'amber' | 'red' | 'emerald'
}

interface DeviceSecurityAreaCardProps {
  number: string
  icon: typeof IconDevices
  title: string
  description: string
  actionLabel: string
  variant: 'blue' | 'emerald' | 'amber' | 'violet'
  onAction: () => void
}

function DeviceSecurityStatCard({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: Readonly<DeviceSecurityStatCardProps>) {
  return (
    <Card size='sm'>
      <CardContent className='flex items-center gap-3'>
        <Badge variant={variant} className='size-11 rounded-xl p-0'>
          <Icon />
        </Badge>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <CardDescription className='truncate'>{label}</CardDescription>
          <CardTitle>{value}</CardTitle>
          <Badge variant={variant}>{detail}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function DeviceSecurityAreaCard({
  number,
  icon: Icon,
  title,
  description,
  actionLabel,
  variant,
  onAction,
}: Readonly<DeviceSecurityAreaCardProps>) {
  return (
    <Card className='h-full'>
      <CardHeader className='grid grid-cols-[auto_minmax(0,1fr)] gap-3'>
        <Badge variant={variant} className='size-11 rounded-xl p-0'>
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
      <CardFooter>
        <Button type='button' onClick={onAction}>
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  )
}

export function DeviceSecurityPage() {
  const navigate = useNavigate()
  const deviceSecurityQuery = useGetDeviceSecurity()

  if (deviceSecurityQuery.isPending || deviceSecurityQuery.error || !deviceSecurityQuery.data) {
    return (
      <AppMain
        pending={deviceSecurityQuery.isPending}
        error={deviceSecurityQuery.error}
        retry={() => void deviceSecurityQuery.refetch()}
        notFound={!deviceSecurityQuery.data}
      />
    )
  }

  const deviceSecurity = deviceSecurityQuery.data

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { to: '/settings/security', label: m.app_layout_nav_security() },
        { label: m.security_device_title() },
      ]}
      backTo='/settings/security'
      title={m.security_device_title()}
      subtitle={m.security_device_subtitle()}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {deviceSecurityQuery.isFetching && <Spinner />}
          {m.security_device_last_updated({
            time: dayjs(deviceSecurity.updatedAt).format('DD MMM YYYY, HH:mm'),
          })}
        </div>

        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <DeviceSecurityStatCard
            icon={IconDeviceMobile}
            label={m.security_overview_registered_devices()}
            value={deviceSecurity.registeredDevices.count.toLocaleString()}
            detail={m.security_overview_active_device_users({
              count: deviceSecurity.registeredDevices.activeUsers.toLocaleString(),
            })}
            variant='blue'
          />
          <DeviceSecurityStatCard
            icon={IconArrowsExchange}
            label={m.security_device_pending_changes()}
            value={deviceSecurity.pendingChanges.count.toLocaleString()}
            detail={m.security_device_need_review()}
            variant='amber'
          />
          <DeviceSecurityStatCard
            icon={IconShieldX}
            label={m.security_device_blocked_devices()}
            value={deviceSecurity.blockedDevices.count.toLocaleString()}
            detail={m.security_device_security_blocked()}
            variant='red'
          />
          <DeviceSecurityStatCard
            icon={IconLink}
            label={m.security_device_binding_policy()}
            value={
              deviceSecurity.bindingPolicy.enabled
                ? m.security_overview_enabled()
                : m.security_overview_disabled()
            }
            detail={m.security_device_active_binding({
              count: deviceSecurity.bindingPolicy.activeBindings.toLocaleString(),
            })}
            variant='emerald'
          />
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <DeviceSecurityAreaCard
            number='01'
            icon={IconDevices}
            title={m.security_device_registered_title()}
            description={m.security_device_registered_description()}
            actionLabel={m.security_device_registered_button()}
            variant='blue'
            onAction={() => void navigate({ to: '/settings/security/device/registered-devices' })}
          />
          <DeviceSecurityAreaCard
            number='02'
            icon={IconDeviceMobilePlus}
            title={m.security_device_register_title()}
            description={m.security_device_register_description()}
            actionLabel={m.security_device_register_button()}
            variant='emerald'
            onAction={() => void navigate({ to: '/settings/security/device/register' })}
          />
          <DeviceSecurityAreaCard
            number='03'
            icon={IconRefresh}
            title={m.security_device_changes_title()}
            description={m.security_device_changes_description()}
            actionLabel={m.security_device_changes_button()}
            variant='amber'
            onAction={() => void navigate({ to: '/settings/security/device/change-requests' })}
          />
          <DeviceSecurityAreaCard
            number='04'
            icon={IconSettings}
            title={m.security_device_policy_title()}
            description={m.security_device_policy_description()}
            actionLabel={m.security_device_policy_button()}
            variant='violet'
            onAction={() => void navigate({ to: '/settings/security/device/binding-policy' })}
          />
        </div>
      </div>
    </AppMain>
  )
}
