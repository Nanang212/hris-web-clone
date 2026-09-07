import { IconArrowUpRight, IconMinus, IconPlus } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/shared/components/ui/chart'
import { cn } from '@/shared/lib/utils'
import { m } from '@/i18n/paraglide/messages'

const headcountData = [
  { month: 'Jan', headcount: 138 },
  { month: 'Mar', headcount: 141 },
  { month: 'May', headcount: 145 },
  { month: 'Jul', headcount: 149 },
  { month: 'Sep', headcount: 153 },
  { month: 'Nov', headcount: 156 },
]

const headcountConfig = {
  headcount: { label: 'Headcount', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function HeadcountGrowthChart() {
  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>{m.dashboard_headcount_workforce_growth()}</h3>
        <p className='text-xs text-muted-foreground'>
          {m.dashboard_headcount_workforce_growth_sub()}
        </p>
      </div>
      <ChartContainer config={headcountConfig} className='h-50 w-full'>
        <AreaChart accessibilityLayer data={headcountData} margin={{ left: 0, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='month' tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey='headcount'
            type='monotone'
            fill='var(--color-headcount)'
            fillOpacity={0.15}
            stroke='var(--color-headcount)'
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

interface CardItem {
  id: string
  code?: string
  label: string
  count: string | number
  color?: string
  countColor?: string
}

export function WorkforceMovementExecutive({ items: propItems }: { items?: CardItem[] }) {
  const defaultItems = [
    {
      id: 'hires',
      icon: IconPlus,
      label: 'New hires',
      count: 88,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      countColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'promos',
      icon: IconArrowUpRight,
      label: 'Promotions',
      count: 28,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      countColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'resign',
      icon: IconMinus,
      label: 'Resignations',
      count: 41,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      countColor: 'text-red-600 dark:text-red-400',
    },
  ]

  const items = propItems || defaultItems

  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>Workforce Movement</h3>
        <p className='text-xs text-muted-foreground'>Year-to-date</p>
      </div>
      <div className='flex flex-col gap-4'>
        {items.map((item) => {
          let IconComp = IconPlus
          if (item.id === 'promos' || item.id === 'mov-2' || item.id === 'wfm-2')
            IconComp = IconArrowUpRight
          if (item.id === 'resign' || item.id === 'mov-3' || item.id === 'wfm-3')
            IconComp = IconMinus
          return (
            <div key={item.id} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    item.color || 'bg-muted text-muted-foreground',
                  )}
                >
                  <IconComp size={16} stroke={2.5} />
                </span>
                <span className='text-sm font-medium'>{item.label}</span>
              </div>
              <span className={cn('text-sm font-bold', item.countColor || 'text-foreground')}>
                {item.count}
              </span>
            </div>
          )
        })}
      </div>
      <p className='text-xs text-muted-foreground'>Net workforce growth: +45</p>
    </div>
  )
}

interface SegmentItem {
  key: string
  label: string
  percentage: number
  color: string
}

export function OrgDistributionDonut({ segments: propSegments }: { segments?: SegmentItem[] }) {
  const defaultSegments = [
    { key: 'ops', label: 'Operations', percentage: 34, color: '#3b82f6' },
    { key: 'tech', label: 'Technology', percentage: 21, color: '#10b981' },
    { key: 'sales', label: 'Sales', percentage: 18, color: '#f59e0b' },
    { key: 'other', label: 'Others', percentage: 27, color: '#e5e7eb' },
  ]

  const segments = propSegments || defaultSegments

  const maxSeg = segments.reduce((max, s) => (s.percentage > max.percentage ? s : max), segments[0])
  const chartConfig = Object.fromEntries(
    segments.map((segment) => [segment.key, { label: segment.label, color: segment.color }]),
  ) satisfies ChartConfig
  const chartData = segments.map((segment) => ({
    ...segment,
    fill: `var(--color-${segment.key})`,
  }))

  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>{m.dashboard_org_distribution()}</h3>
        <p className='text-xs text-muted-foreground'>{m.dashboard_org_distribution_sub()}</p>
      </div>
      <ChartContainer config={chartConfig} className='mx-auto h-44 w-full'>
        <PieChart accessibilityLayer>
          <ChartTooltip content={<ChartTooltipContent nameKey='key' />} />
          <Pie
            data={chartData}
            dataKey='percentage'
            nameKey='key'
            innerRadius={45}
            outerRadius={65}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
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
                        className='fill-foreground text-lg font-bold'
                      >
                        {maxSeg?.percentage}%
                      </tspan>
                    </text>
                  )
                }
                return null
              }}
            />
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey='key' />} />
        </PieChart>
      </ChartContainer>
    </div>
  )
}

export function WorkforceRisk({ items: propItems }: { items?: CardItem[] }) {
  const defaultItems = [
    {
      id: 'vac',
      code: 'VAC',
      label: 'Critical vacancies',
      count: 7,
      color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      countColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'ctr',
      code: 'CTR',
      label: 'Contracts < 30d',
      count: 18,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      countColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'abs',
      code: 'ABS',
      label: 'Absence risk',
      count: '3 teams',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      countColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  const items = propItems || defaultItems

  return (
    <div className='flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5'>
      <div>
        <h3 className='text-sm font-semibold'>Workforce Risk</h3>
        <p className='text-xs text-muted-foreground'>Key indicators</p>
      </div>
      <div className='flex flex-col gap-4'>
        {items.map((item) => (
          <div key={item.id} className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                  item.color || 'bg-muted text-muted-foreground',
                )}
              >
                {item.code || 'RISK'}
              </span>
              <span className='text-sm font-medium'>{item.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', item.countColor || 'text-foreground')}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>Risk level: Moderate</p>
    </div>
  )
}
