import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'
import { m } from '@/i18n/paraglide/messages'

const chartData = [
  { week: 'W1', presentRate: 88, exceptions: 2 },
  { week: 'W3', presentRate: 90, exceptions: 4 },
  { week: 'W5', presentRate: 91, exceptions: 2 },
  { week: 'W7', presentRate: 93, exceptions: 5 },
  { week: 'W9', presentRate: 94, exceptions: 3 },
  { week: 'W11', presentRate: 96, exceptions: 1 },
]

const chartConfig = {
  presentRate: { label: 'Present rate', color: 'var(--chart-1)' },
  exceptions: { label: 'Exceptions', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function TeamAttendanceChart() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>{m.dashboard_team_attendance_availability()}</h3>
        <p className='text-xs text-muted-foreground'>
          {m.dashboard_team_attendance_availability_sub()}
        </p>
      </div>
      <ChartContainer config={chartConfig} className='h-50 w-full'>
        <LineChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='week' tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis yAxisId='rate' hide domain={[80, 100]} />
          <YAxis yAxisId='exceptions' hide orientation='right' domain={[0, 6]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            yAxisId='rate'
            dataKey='presentRate'
            type='monotone'
            stroke='var(--color-presentRate)'
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId='exceptions'
            dataKey='exceptions'
            type='monotone'
            stroke='var(--color-exceptions)'
            strokeWidth={2}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
