import {
  IconCalendarClock,
  IconChartLine,
  IconCircleCheck,
  IconClockHour4,
  IconCurrencyDollar,
  IconX,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { cn } from '@/shared/lib/utils'
import {
  overtimePolicies,
  overtimeRequests,
  overtimeTrend,
} from '@/features/overtime/components/overtime-data'
import { OvertimeStat, OvertimeStatus } from '@/features/overtime/components/overtime-shared'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { m } from '@/i18n/paraglide/messages'

function OvertimeTrendChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(720)
  const height = 150
  const padding = 16
  const chartBottom = 28

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(entry.contentRect.width, 1))
    })

    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  const values = overtimeTrend.map((point) => point.hours)
  const min = Math.min(...values) - 20
  const max = Math.max(...values) + 15
  const points = overtimeTrend.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / (overtimeTrend.length - 1)
    const y = padding + ((max - point.hours) / (max - min)) * (height - padding - chartBottom)
    return { ...point, x, y }
  })
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const area = `${padding},${height - chartBottom} ${line} ${width - padding},${height - chartBottom}`

  return (
    <div className='mt-4 w-full overflow-x-auto'>
      <svg
        ref={svgRef}
        className='h-40 w-full text-primary'
        viewBox={`0 0 ${width} ${height}`}
        role='img'
        aria-label={m.overtime_trend_chart_label()}
      >
        <polygon points={area} className='fill-primary/10' />
        <polyline points={line} fill='none' stroke='currentColor' strokeWidth='3' />
        {points.map((point) => (
          <g key={point.month}>
            <circle cx={point.x} cy={point.y} r='4' className='fill-primary' />
            <text
              x={point.x}
              y={height - 4}
              textAnchor='middle'
              className='fill-muted-foreground text-[11px]'
            >
              {point.month}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

export function OvertimeOverviewPage() {
  return (
    <AppMain
      title={m.overtime_overview_title()}
      subtitle={m.overtime_overview_subtitle()}
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { label: m.app_layout_nav_overtime() },
      ]}
      actions={
        <Button type='button' asChild>
          <Link to='/overtime/requests/new'>
            <IconCalendarClock data-icon='inline-start' />
            {m.overtime_new_request()}
          </Link>
        </Button>
      }
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='requests' />

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <OvertimeStat
          icon={IconClockHour4}
          label={m.overtime_stat_pending_label()}
          value='18'
          detail={m.overtime_stat_pending_detail()}
          tone='amber'
        />
        <OvertimeStat
          icon={IconCircleCheck}
          label={m.overtime_stat_approved_label()}
          value='346.5 h'
          detail={m.overtime_stat_approved_detail()}
          tone='green'
        />
        <OvertimeStat
          icon={IconCurrencyDollar}
          label={m.overtime_stat_payroll_label()}
          value='92%'
          detail={m.overtime_stat_payroll_detail()}
          tone='blue'
        />
        <OvertimeStat
          icon={IconX}
          label={m.overtime_stat_rejected_label()}
          value='6'
          detail={m.overtime_stat_rejected_detail()}
          tone='red'
        />
      </div>

      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(290px,0.85fr)]'>
        <Card className='overflow-hidden'>
          <div className='flex items-start justify-between gap-3 p-4 pb-2'>
            <div>
              <h3 className='font-semibold'>{m.overtime_recent_requests_title()}</h3>
              <p className='mt-1 text-xs text-muted-foreground'>
                {m.overtime_recent_requests_subtitle()}
              </p>
            </div>
            <Button variant='link' size='sm' asChild>
              <Link to='/overtime/history'>{m.overtime_view_all()}</Link>
            </Button>
          </div>
          <CardContent className='overflow-x-auto p-0'>
            <Table className='min-w-[720px]'>
              <TableHeader className='bg-muted/40'>
                <TableRow>
                  <TableHead>{m.overtime_table_employee()}</TableHead>
                  <TableHead>{m.overtime_table_date()}</TableHead>
                  <TableHead>{m.overtime_table_schedule()}</TableHead>
                  <TableHead>{m.overtime_table_requested()}</TableHead>
                  <TableHead>{m.overtime_table_eligible()}</TableHead>
                  <TableHead>{m.overtime_table_status()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overtimeRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className='text-xs font-medium'>{request.employee}</TableCell>
                    <TableCell className='text-xs'>
                      {dayjs(request.date).format('DD MMM')}
                    </TableCell>
                    <TableCell className='text-xs'>{request.schedule}</TableCell>
                    <TableCell className='text-xs'>{request.requestedHours} h</TableCell>
                    <TableCell className='text-xs'>{request.eligibleHours} h</TableCell>
                    <TableCell>
                      <OvertimeStatus status={request.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='p-4 pb-2'>
            <CardTitle>{m.overtime_policy_title()}</CardTitle>
            <CardDescription>{m.overtime_policy_subtitle()}</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 px-4 pt-2'>
            {overtimePolicies.map((policy) => (
              <div
                key={policy.name}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-3 text-xs font-medium',
                  policy.tone === 'blue' && 'bg-blue-500/10 text-blue-700',
                  policy.tone === 'green' && 'bg-green-500/10 text-green-700',
                  policy.tone === 'red' && 'bg-red-500/10 text-red-700',
                )}
              >
                <span className='text-foreground'>{policy.name}</span>
                <span>{m.overtime_hourly_rate({ factor: policy.factor })}</span>
              </div>
            ))}
            <div className='mt-1 grid grid-cols-2 gap-y-2 border-t pt-3 text-xs'>
              <span className='text-muted-foreground'>{m.overtime_payroll_period()}</span>
              <span className='text-right font-semibold'>{m.overtime_august_2026()}</span>
              <span className='text-muted-foreground'>{m.overtime_cut_off()}</span>
              <span className='text-right font-semibold text-amber-700'>
                {m.overtime_cut_off_date()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className='p-4 pb-0'>
          <CardTitle className='flex items-center gap-2'>
            <IconChartLine className='size-5 text-primary' />
            {m.overtime_trend_title()}
          </CardTitle>
          <CardDescription>{m.overtime_trend_subtitle()}</CardDescription>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <OvertimeTrendChart />
        </CardContent>
      </Card>
    </AppMain>
  )
}
