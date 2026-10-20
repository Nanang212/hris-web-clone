import {
  IconAlertCircle,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconSparkles,
} from '@tabler/icons-react'
import dayjs from 'dayjs'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import { Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis } from 'recharts'

import { Alert, AlertDescription, AlertIcon } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'
import { Progress } from '@/shared/components/ui/progress'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'

import type { AttendanceOverviewData } from '../types'
import { getMissingAttendanceLabel } from './attendance-overview-status-labels'

interface AttendanceOverviewPanelsProps {
  data: AttendanceOverviewData
  isToday: boolean
}

function formatCount(value: number) {
  return new Intl.NumberFormat(getLocale()).format(value)
}

export function AttendanceOverviewPanels({
  data,
  isToday,
}: Readonly<AttendanceOverviewPanelsProps>) {
  const { summary, punctuality } = data
  const statusConfig = {
    onTime: { label: m.attendance_overview_status_on_time(), color: 'var(--chart-1)' },
    late: { label: m.attendance_overview_status_late(), color: 'var(--chart-2)' },
    leave: { label: m.attendance_overview_status_leave(), color: 'var(--chart-4)' },
    missing: { label: getMissingAttendanceLabel(isToday), color: 'var(--muted-foreground)' },
  } satisfies ChartConfig
  const distribution = [
    { status: 'onTime', count: summary.onTime, fill: 'var(--color-onTime)' },
    { status: 'late', count: summary.late, fill: 'var(--color-late)' },
    { status: 'leave', count: summary.leave, fill: 'var(--color-leave)' },
    { status: 'missing', count: summary.missing, fill: 'var(--color-missing)' },
  ]
  const stats = [
    {
      label: m.attendance_stat_present(),
      value: m.attendance_overview_present_total({
        present: formatCount(summary.present),
        total: formatCount(summary.total),
      }),
      note: m.attendance_overview_present_rate({ rate: summary.presentRate }),
      icon: IconCircleCheck,
    },
    {
      label: m.attendance_stat_late(),
      value: formatCount(summary.late),
      note: m.attendance_overview_late_note(),
      icon: IconClock,
    },
    {
      label: m.attendance_stat_leave(),
      value: formatCount(summary.leave),
      note: m.attendance_overview_leave_note(),
      icon: IconCalendarEvent,
    },
    {
      label: getMissingAttendanceLabel(isToday),
      value: formatCount(summary.missing),
      note: m.attendance_overview_missing_note(),
      icon: IconAlertCircle,
    },
  ]
  const attention = [
    {
      label: getMissingAttendanceLabel(isToday),
      description: m.attendance_overview_attention_missing_description(),
      count: summary.missing,
      icon: IconAlertCircle,
    },
    {
      label: m.attendance_overview_attention_late_title(),
      description: m.attendance_overview_attention_late_description(),
      count: summary.late,
      icon: IconClock,
    },
    {
      label: m.attendance_overview_attention_incomplete_title(),
      description: m.attendance_overview_attention_incomplete_description(),
      count: data.attention.incompleteClockOut,
      icon: IconCalendarEvent,
    },
  ]
  const delta = punctuality.changePercentagePoints
  const deltaLabel = `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`

  return (
    <>
      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} size='sm' className='min-w-0'>
              <CardHeader className='flex flex-row items-start justify-between gap-3'>
                <CardTitle className='text-sm text-muted-foreground'>{stat.label}</CardTitle>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Icon className='size-5' aria-hidden='true' />
                </span>
              </CardHeader>
              <CardContent className='flex flex-col gap-2'>
                <p className='text-2xl font-semibold tracking-tight tabular-nums'>{stat.value}</p>
                <p className='text-xs text-muted-foreground'>{stat.note}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>{m.attendance_overview_trend_title()}</CardTitle>
            <CardDescription>{m.attendance_overview_trend_description()}</CardDescription>
            <CardAction>
              <Badge variant='blue'>{m.attendance_overview_trend_period()}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className='h-55 w-full'>
              <BarChart accessibilityLayer data={data.trend} barCategoryGap='35%'>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='date'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(date: string) => dayjs(date).locale(getLocale()).format('DD MMM')}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(date) =>
                        dayjs(String(date)).locale(getLocale()).format('DD MMM YYYY')
                      }
                    />
                  }
                />
                <Bar dataKey='onTime' stackId='attendance' fill='var(--color-onTime)' />
                <Bar dataKey='late' stackId='attendance' fill='var(--color-late)' />
                <Bar dataKey='leave' stackId='attendance' fill='var(--color-leave)' />
                <Bar
                  dataKey='missing'
                  stackId='attendance'
                  fill='var(--color-missing)'
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
            <div className='mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground'>
              {distribution.map((item) => (
                <span key={item.status} className='inline-flex items-center gap-1.5'>
                  <span
                    className='size-2 rounded-sm'
                    style={{
                      backgroundColor: statusConfig[item.status as keyof typeof statusConfig].color,
                    }}
                  />
                  {statusConfig[item.status as keyof typeof statusConfig].label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>{m.attendance_overview_distribution_title()}</CardTitle>
            <CardDescription>{m.attendance_overview_distribution_description()}</CardDescription>
          </CardHeader>
          <CardContent className='grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-1'>
            <ChartContainer config={statusConfig} className='mx-auto h-44 w-full max-w-60'>
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey='status' />} />
                <Pie
                  data={distribution}
                  dataKey='count'
                  nameKey='status'
                  innerRadius={54}
                  outerRadius={78}
                  strokeWidth={2}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) return null
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan x={viewBox.cx} className='fill-foreground text-2xl font-bold'>
                            {summary.presentRate}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            dy={19}
                            className='fill-muted-foreground text-[10px]'
                          >
                            {m.attendance_stat_present()}
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className='flex flex-col gap-2'>
              {distribution.map((item) => (
                <div key={item.status} className='flex items-center justify-between gap-3 text-xs'>
                  <span className='inline-flex items-center gap-2 text-muted-foreground'>
                    <span
                      className='size-2 rounded-sm'
                      style={{
                        backgroundColor:
                          statusConfig[item.status as keyof typeof statusConfig].color,
                      }}
                    />
                    {statusConfig[item.status as keyof typeof statusConfig].label}
                  </span>
                  <span className='font-semibold tabular-nums'>{formatCount(item.count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'>
        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>{m.attendance_overview_attention_title()}</CardTitle>
            <CardDescription>{m.attendance_overview_attention_description()}</CardDescription>
            <CardAction>
              <Badge variant='amber'>{m.attendance_overview_attention_badge()}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col'>
            {attention.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className='flex items-center gap-3 border-b py-3 last:border-b-0'
                >
                  <span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                    <Icon className='size-5' aria-hidden='true' />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium'>{item.label}</p>
                    <p className='text-xs text-muted-foreground'>{item.description}</p>
                  </div>
                  <span className='text-xl font-semibold tabular-nums'>
                    {formatCount(item.count)}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className='min-w-0'>
          <CardHeader>
            <CardTitle>{m.attendance_overview_insight_title()}</CardTitle>
            <CardDescription>{m.attendance_overview_insight_description()}</CardDescription>
            <CardAction>
              <Badge variant='violet'>{m.attendance_overview_insight_badge()}</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex items-end justify-between gap-3'>
              <div>
                <p className='text-4xl font-bold tracking-tight tabular-nums'>
                  {Math.round(punctuality.rate)}%
                </p>
                <p className='text-xs text-muted-foreground'>
                  {m.attendance_overview_insight_present_caption()}
                </p>
              </div>
              <Badge variant={delta > 0 ? 'green' : delta < 0 ? 'orange' : 'gray'}>
                {m.attendance_overview_insight_delta({ value: deltaLabel })}
              </Badge>
            </div>
            <Progress
              value={Math.max(0, Math.min(100, punctuality.rate))}
              aria-label={m.attendance_overview_insight_title()}
            />
            <div className='grid grid-cols-2 gap-3'>
              <div className='rounded-lg bg-muted/50 p-3'>
                <p className='text-xs text-muted-foreground'>
                  {m.attendance_overview_insight_average_late()}
                </p>
                <p className='mt-1 text-lg font-semibold tabular-nums'>
                  {m.attendance_overview_insight_minutes({ count: punctuality.averageLateMinutes })}
                </p>
              </div>
              <div className='rounded-lg bg-muted/50 p-3'>
                <p className='text-xs text-muted-foreground'>
                  {m.attendance_overview_insight_on_time_count()}
                </p>
                <p className='mt-1 text-lg font-semibold tabular-nums'>
                  {formatCount(summary.onTime)} / {formatCount(summary.present)}
                </p>
              </div>
            </div>
            <Alert variant='info-overlay'>
              <AlertIcon>
                <IconSparkles aria-hidden='true' />
              </AlertIcon>
              <AlertDescription>
                {summary.present > 0
                  ? m.attendance_overview_insight_note({
                      onTime: summary.onTime,
                      present: summary.present,
                      minutes: punctuality.averageLateMinutes,
                    })
                  : m.attendance_overview_insight_empty_note()}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
