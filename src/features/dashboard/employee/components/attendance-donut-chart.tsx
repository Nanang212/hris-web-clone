import { Label, Pie, PieChart } from 'recharts'

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
import { m } from '@/i18n/paraglide/messages'

interface AttendanceDonutChartProps {
  presentDays: number
  leaveDays: number
  lateDays: number
  wfhDays: number
  attendanceRate: number
}

export function AttendanceDonutChart({
  presentDays,
  leaveDays,
  lateDays,
  wfhDays,
  attendanceRate,
}: Readonly<AttendanceDonutChartProps>) {
  const totalDays = presentDays + leaveDays + lateDays + wfhDays
  const chartConfig = {
    present: { label: m.dashboard_attendance_present(), color: 'var(--chart-1)' },
    leave: { label: m.dashboard_attendance_leave(), color: 'var(--chart-2)' },
    late: { label: m.dashboard_attendance_late(), color: 'var(--chart-3)' },
    wfh: { label: m.dashboard_attendance_wfh(), color: 'var(--chart-4)' },
  } satisfies ChartConfig
  const chartData = [
    { status: 'present', days: presentDays, fill: 'var(--color-present)' },
    { status: 'leave', days: leaveDays, fill: 'var(--color-leave)' },
    { status: 'late', days: lateDays, fill: 'var(--color-late)' },
    { status: 'wfh', days: wfhDays, fill: 'var(--color-wfh)' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.dashboard_my_attendance()}</CardTitle>
        <CardDescription>{m.dashboard_my_attendance_sub()}</CardDescription>
        <CardAction>
          <Badge variant={attendanceRate >= 95 ? 'green' : attendanceRate >= 85 ? 'amber' : 'red'}>
            {m.dashboard_attendance_rate_value({ rate: attendanceRate })}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className='grid items-center gap-6 md:grid-cols-[minmax(220px,0.85fr)_minmax(240px,1.15fr)]'>
          <ChartContainer config={chartConfig} className='mx-auto h-56 w-full max-w-72'>
            <PieChart accessibilityLayer>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    nameKey='status'
                    formatter={(value, name) => (
                      <div className='flex min-w-32 items-center justify-between gap-4'>
                        <span className='text-muted-foreground'>{chartConfig[name]?.label}</span>
                        <span className='font-mono font-medium tabular-nums'>
                          {m.dashboard_attendance_days({ count: Number(value) })}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey='days'
                nameKey='status'
                innerRadius={62}
                outerRadius={88}
                paddingAngle={2}
                strokeWidth={3}
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
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {attendanceRate}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 22}
                          className='fill-muted-foreground text-[10px]'
                        >
                          {m.dashboard_attendance_rate()}
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className='grid grid-cols-2 gap-3'>
            {chartData.map((item) => {
              const percentage = totalDays > 0 ? Math.round((item.days / totalDays) * 100) : 0

              return (
                <div key={item.status} className='flex flex-col gap-2 rounded-xl bg-muted/50 p-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      className='size-2.5 shrink-0 rounded-full'
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className='truncate text-xs font-medium text-muted-foreground'>
                      {chartConfig[item.status].label}
                    </span>
                  </div>
                  <div className='flex items-end justify-between gap-2'>
                    <span className='text-xl font-semibold tabular-nums'>{item.days}</span>
                    <span className='text-xs text-muted-foreground'>{percentage}%</span>
                  </div>
                </div>
              )
            })}
            <div className='col-span-2 flex items-center justify-between border-t pt-3'>
              <span className='text-xs text-muted-foreground'>
                {m.dashboard_attendance_total_recorded()}
              </span>
              <span className='text-sm font-semibold tabular-nums'>
                {m.dashboard_attendance_days({ count: totalDays })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
