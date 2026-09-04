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
  { month: 'Jan', headcount: 138, attendance: 91 },
  { month: 'Mar', headcount: 141, attendance: 92 },
  { month: 'May', headcount: 145, attendance: 94 },
  { month: 'Jul', headcount: 149, attendance: 95 },
  { month: 'Sep', headcount: 153, attendance: 94 },
  { month: 'Nov', headcount: 156, attendance: 96 },
]

const chartConfig = {
  headcount: { label: 'Headcount', color: 'var(--chart-1)' },
  attendance: { label: 'Attendance', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function WorkforceTrendChart() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>{m.dashboard_workforce_attendance_trend()}</h3>
        <p className='text-xs text-muted-foreground'>
          {m.dashboard_workforce_attendance_trend_sub()}
        </p>
      </div>
      <ChartContainer config={chartConfig} className='h-55 w-full'>
        <LineChart accessibilityLayer data={chartData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis yAxisId='headcount' hide domain={['dataMin - 5', 'dataMax + 5']} />
          <YAxis yAxisId='attendance' hide orientation='right' domain={[85, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            yAxisId='headcount'
            dataKey='headcount'
            type='monotone'
            stroke='var(--color-headcount)'
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId='attendance'
            dataKey='attendance'
            type='monotone'
            stroke='var(--color-attendance)'
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
