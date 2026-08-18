import {
  IconActivityHeartbeat,
  IconArrowRight,
  IconBrandWhatsapp,
  IconDeviceMobile,
  IconEye,
  IconMail,
  IconPlus,
  IconSearch,
  IconTemplate,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Spinner } from '@/shared/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { useGetNotificationOverview } from '@/features/settings/notification/hooks'
import type {
  NotificationChannel,
  NotificationDeliveryMetric,
  NotificationDeliveryStatus,
  NotificationEvent,
  NotificationOverviewPeriod,
} from '@/features/settings/notification/types'
import { m } from '@/i18n/paraglide/messages'

interface DeliveryStatCardProps {
  icon: typeof IconMail
  label: string
  value: string
  summary: string
  change: string
  tone: 'emerald' | 'blue' | 'rose' | 'violet'
  changeDown?: boolean
}

const statToneClasses = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
} as const

function DeliveryStatCard({
  icon: Icon,
  label,
  value,
  summary,
  change,
  tone,
  changeDown = false,
}: Readonly<DeliveryStatCardProps>) {
  return (
    <Card size='sm' className='gap-0 rounded-2xl border border-border py-0 shadow-sm'>
      <CardContent className='flex items-start gap-3 p-4'>
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl',
            statToneClasses[tone],
          )}
        >
          <Icon size={20} stroke={1.8} />
        </span>
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-medium text-muted-foreground'>{label}</p>
          <p className='mt-1 text-2xl leading-none font-bold tracking-tight text-foreground'>
            {value}
          </p>
          <p className='mt-2 truncate text-xs text-muted-foreground'>{summary}</p>
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              changeDown
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400',
            )}
          >
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getChannelLabel(channel: NotificationChannel) {
  const labels: Record<NotificationChannel, string> = {
    Email: m.notification_overview_channel_email(),
    Push: m.notification_overview_channel_push(),
    WhatsApp: m.notification_overview_channel_whatsapp(),
  }
  return labels[channel]
}

function getStatusLabel(status: NotificationDeliveryStatus) {
  const labels: Record<NotificationDeliveryStatus, string> = {
    Delivered: m.notification_overview_status_delivered(),
    Failed: m.notification_overview_status_failed(),
    Pending: m.notification_overview_status_pending(),
    Retrying: m.notification_overview_status_retrying(),
  }
  return labels[status]
}

function getStatusVariant(status: NotificationDeliveryStatus) {
  const variants = {
    Delivered: 'emerald',
    Failed: 'red',
    Pending: 'amber',
    Retrying: 'blue',
  } as const
  return variants[status]
}

function getChannelIcon(channel: NotificationChannel) {
  const icons = {
    Email: IconMail,
    Push: IconDeviceMobile,
    WhatsApp: IconBrandWhatsapp,
  }
  return icons[channel]
}

function formatDeliveryRate(rate: number) {
  return `${rate.toFixed(1)}%`
}

function formatDeliveryChange(changePercentage: number) {
  const value = `${Math.abs(changePercentage).toFixed(1)}%`
  return changePercentage < 0
    ? m.notification_overview_change_down({ value })
    : m.notification_overview_change_up({ value })
}

function getDeliverySummary(metric: NotificationDeliveryMetric) {
  return m.notification_overview_delivery_summary({
    sent: metric.sent.toLocaleString(),
    failed: metric.failed.toLocaleString(),
  })
}

function formatTemplateChange(change: number) {
  const value = Math.abs(change).toLocaleString()
  return change < 0
    ? m.notification_overview_change_down({ value })
    : m.notification_overview_change_up({ value })
}

export function NotificationOverviewPage() {
  const [period, setPeriod] = useState<NotificationOverviewPeriod>('7-days')
  const [search, setSearch] = useState('')
  const [channelFilter, setChannelFilter] = useState<NotificationChannel | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<NotificationDeliveryStatus | 'All'>('All')
  const [selectedEvent, setSelectedEvent] = useState<NotificationEvent | null>(null)
  const overviewQuery = useGetNotificationOverview(period)

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
  const degradedChannels = overview.channels
    .filter((channel) => channel.status === 'Degraded')
    .map((channel) => getChannelLabel(channel.channel))
    .join(', ')

  const normalizedSearch = search.trim().toLowerCase()
  const filteredEvents = overview.events.filter((event) => {
    const matchesSearch =
      !normalizedSearch ||
      event.title.toLowerCase().includes(normalizedSearch) ||
      event.recipient.toLowerCase().includes(normalizedSearch)
    const matchesChannel = channelFilter === 'All' || event.channels.includes(channelFilter)
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter
    return matchesSearch && matchesChannel && matchesStatus
  })

  return (
    <AppMain
      breadcrumbs={[
        { to: '/', label: m.app_layout_nav_settings() },
        { label: m.notification_overview_title() },
      ]}
      title={m.notification_overview_title()}
      subtitle={m.notification_overview_subtitle()}
      actions={
        <Button asChild>
          <Link to='/settings/notification/templates'>
            <IconPlus data-icon='inline-start' />
            {m.notification_overview_manage_templates()}
          </Link>
        </Button>
      }
    >
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          {overviewQuery.isFetching && <Spinner className='size-3' />}
          <p>
            {m.notification_overview_last_updated({
              time: dayjs(overview.lastUpdated).format('DD MMM YYYY, HH:mm'),
            })}
          </p>
        </div>
        <Select
          value={period}
          onValueChange={(value) => setPeriod(value as NotificationOverviewPeriod)}
        >
          <SelectTrigger
            aria-label={m.notification_overview_period_label()}
            className='h-9 w-full rounded-lg bg-background sm:w-48'
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='today'>{m.notification_overview_period_today()}</SelectItem>
            <SelectItem value='7-days'>{m.notification_overview_period_last_7_days()}</SelectItem>
            <SelectItem value='30-days'>{m.notification_overview_period_last_30_days()}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <DeliveryStatCard
          icon={IconMail}
          label={m.notification_overview_email_delivery()}
          value={formatDeliveryRate(overview.stats.emailDelivery.rate)}
          summary={getDeliverySummary(overview.stats.emailDelivery)}
          change={formatDeliveryChange(overview.stats.emailDelivery.changePercentage)}
          tone='emerald'
          changeDown={overview.stats.emailDelivery.changePercentage < 0}
        />
        <DeliveryStatCard
          icon={IconDeviceMobile}
          label={m.notification_overview_push_delivery()}
          value={formatDeliveryRate(overview.stats.pushDelivery.rate)}
          summary={getDeliverySummary(overview.stats.pushDelivery)}
          change={formatDeliveryChange(overview.stats.pushDelivery.changePercentage)}
          tone='blue'
          changeDown={overview.stats.pushDelivery.changePercentage < 0}
        />
        <DeliveryStatCard
          icon={IconBrandWhatsapp}
          label={m.notification_overview_whatsapp_delivery()}
          value={formatDeliveryRate(overview.stats.whatsappDelivery.rate)}
          summary={getDeliverySummary(overview.stats.whatsappDelivery)}
          change={formatDeliveryChange(overview.stats.whatsappDelivery.changePercentage)}
          tone='rose'
          changeDown={overview.stats.whatsappDelivery.changePercentage < 0}
        />
        <DeliveryStatCard
          icon={IconTemplate}
          label={m.notification_overview_active_templates()}
          value={overview.stats.activeTemplates.active.toLocaleString()}
          summary={m.notification_overview_template_summary({
            active: overview.stats.activeTemplates.active.toLocaleString(),
            draft: overview.stats.activeTemplates.draft.toLocaleString(),
          })}
          change={formatTemplateChange(overview.stats.activeTemplates.change)}
          tone='violet'
          changeDown={overview.stats.activeTemplates.change < 0}
        />
      </div>

      <div className='grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]'>
        <Card className='gap-0 rounded-2xl border border-border py-0 shadow-sm'>
          <CardHeader className='border-b border-border p-5 sm:p-6'>
            <CardTitle className='font-bold'>
              {m.notification_overview_recent_events_title()}
            </CardTitle>
            <CardDescription>{m.notification_overview_recent_events_description()}</CardDescription>
            <div className='mt-4 grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_180px]'>
              <div className='relative'>
                <IconSearch
                  size={16}
                  className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={m.notification_overview_search_placeholder()}
                  className='h-10 rounded-lg bg-background pl-9'
                />
              </div>
              <Select
                value={channelFilter}
                onValueChange={(value) => setChannelFilter(value as NotificationChannel | 'All')}
              >
                <SelectTrigger
                  aria-label={m.notification_overview_filter_channel()}
                  className='h-10 w-full rounded-lg bg-background'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='All'>{m.notification_overview_all_channels()}</SelectItem>
                  <SelectItem value='Email'>{m.notification_overview_channel_email()}</SelectItem>
                  <SelectItem value='Push'>{m.notification_overview_channel_push()}</SelectItem>
                  <SelectItem value='WhatsApp'>
                    {m.notification_overview_channel_whatsapp()}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as NotificationDeliveryStatus | 'All')
                }
              >
                <SelectTrigger
                  aria-label={m.notification_overview_filter_status()}
                  className='h-10 w-full rounded-lg bg-background'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='All'>{m.notification_overview_all_statuses()}</SelectItem>
                  <SelectItem value='Delivered'>
                    {m.notification_overview_status_delivered()}
                  </SelectItem>
                  <SelectItem value='Failed'>{m.notification_overview_status_failed()}</SelectItem>
                  <SelectItem value='Pending'>
                    {m.notification_overview_status_pending()}
                  </SelectItem>
                  <SelectItem value='Retrying'>
                    {m.notification_overview_status_retrying()}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <Table className='min-w-205'>
              <TableHeader>
                <TableRow className='bg-muted/40'>
                  <TableHead className='px-5'>{m.notification_overview_table_event()}</TableHead>
                  <TableHead>{m.notification_overview_table_channel()}</TableHead>
                  <TableHead>{m.notification_overview_table_recipient()}</TableHead>
                  <TableHead>{m.notification_overview_table_sent_at()}</TableHead>
                  <TableHead>{m.notification_overview_table_status()}</TableHead>
                  <TableHead className='px-5 text-right'>
                    {m.notification_overview_table_action()}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className='px-5 font-semibold'>{event.title}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {event.channels.map(getChannelLabel).join(' + ')}
                    </TableCell>
                    <TableCell>{event.recipient}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {dayjs(event.sentAt).format('DD MMM YYYY, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(event.status)}>
                        {getStatusLabel(event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-5 text-right'>
                      <Button
                        type='button'
                        size='icon-xs'
                        variant='ghost'
                        aria-label={m.notification_overview_view_detail()}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <IconEye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEvents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className='h-32 text-center text-muted-foreground'>
                      {m.notification_overview_no_events()}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className='gap-0 rounded-2xl border border-border py-0 shadow-sm'>
          <CardHeader className='p-5 pb-4'>
            <CardTitle className='font-bold'>{m.notification_overview_channels_title()}</CardTitle>
            <CardDescription>{m.notification_overview_channels_description()}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 px-5 pb-5'>
            {overview.channels.map((channel) => {
              const Icon = getChannelIcon(channel.channel)
              const healthy = channel.status === 'Healthy'
              return (
                <div
                  key={channel.channel}
                  className='flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3'
                >
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      healthy
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='font-semibold'>{getChannelLabel(channel.channel)}</p>
                    <p className='truncate text-xs text-muted-foreground'>{channel.description}</p>
                  </div>
                  <div className='flex flex-col items-end gap-1'>
                    <Badge variant={healthy ? 'emerald' : 'amber'}>
                      {healthy
                        ? m.notification_overview_health_healthy()
                        : m.notification_overview_health_degraded()}
                    </Badge>
                    <span className='text-[10px] font-medium text-muted-foreground'>
                      {channel.enabled
                        ? m.notification_overview_enabled()
                        : m.notification_overview_disabled()}
                    </span>
                  </div>
                </div>
              )
            })}

            <div className='rounded-xl bg-blue-50 p-4 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'>
              <div className='flex items-center gap-2 font-semibold'>
                <IconActivityHeartbeat size={18} />
                {m.notification_overview_delivery_health_title()}
              </div>
              <p className='mt-2 text-xs leading-relaxed text-blue-700/80 dark:text-blue-300/80'>
                {degradedChannels
                  ? m.notification_overview_delivery_health_description({
                      channels: degradedChannels,
                    })
                  : m.notification_overview_delivery_health_all_healthy()}
              </p>
              <Button
                type='button'
                variant='link'
                className='mt-3 h-auto p-0 text-blue-700 dark:text-blue-300'
                onClick={() => snackbar.info(m.notification_overview_logs_coming_soon())}
              >
                {m.notification_overview_open_logs()}
                <IconArrowRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.notification_overview_detail_title()}</DialogTitle>
            <DialogDescription>{m.notification_overview_detail_description()}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className='space-y-4 text-sm'>
              <div className='grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>
                    {m.notification_overview_table_event()}
                  </p>
                  <p className='mt-1 font-semibold'>{selectedEvent.title}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>
                    {m.notification_overview_table_status()}
                  </p>
                  <Badge className='mt-1' variant={getStatusVariant(selectedEvent.status)}>
                    {getStatusLabel(selectedEvent.status)}
                  </Badge>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>
                    {m.notification_overview_table_recipient()}
                  </p>
                  <p className='mt-1 font-medium'>{selectedEvent.recipient}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>
                    {m.notification_overview_table_channel()}
                  </p>
                  <p className='mt-1 font-medium'>
                    {selectedEvent.channels.map(getChannelLabel).join(' + ')}
                  </p>
                </div>
              </div>
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  {m.notification_overview_detail_failure_reason()}
                </p>
                <p className='mt-1'>
                  {selectedEvent.failureReason ?? m.notification_overview_detail_no_failure()}
                </p>
              </div>
              {selectedEvent.providerMessage && (
                <div>
                  <p className='text-xs font-medium text-muted-foreground'>
                    {m.notification_overview_detail_provider_message()}
                  </p>
                  <p className='mt-1'>{selectedEvent.providerMessage}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => setSelectedEvent(null)}>
              {m.notification_overview_close()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
