import {
  IconArrowUpRight,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react'

import { cn } from '@/shared/lib/utils'

export function HeadcountGrowthChart() {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold">Headcount & Workforce Growth</h3>
          <p className="text-xs text-muted-foreground">
            Company-wide headcount trend · last 12 months
          </p>
        </div>
        <div className="mt-3 flex items-center gap-4 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Headcount
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-[200px] w-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full border-t border-border/50" />
          ))}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] font-medium text-muted-foreground">
          {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>

        {/* SVG line */}
        <svg
          viewBox="0 0 1000 200"
          className="absolute inset-0 h-[195px] w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Area fill */}
          <defs>
            <linearGradient id="hcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 165 Q 150 158 280 145 T 500 115 T 720 85 T 1000 55 L 1000 200 L 0 200 Z"
            fill="url(#hcGradient)"
          />
          <path
            d="M 0 165 Q 150 158 280 145 T 500 115 T 720 85 T 1000 55"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
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
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Workforce Movement</h3>
        <p className="text-xs text-muted-foreground">Year-to-date</p>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          let IconComp = IconPlus
          if (item.id === 'promos' || item.id === 'mov-2' || item.id === 'wfm-2') IconComp = IconArrowUpRight
          if (item.id === 'resign' || item.id === 'mov-3' || item.id === 'wfm-3') IconComp = IconMinus
          return (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    item.color || 'bg-muted text-muted-foreground'
                  )}
                >
                  <IconComp size={16} stroke={2.5} />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className={cn('text-sm font-bold', item.countColor || 'text-foreground')}>
                {item.count}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Net workforce growth: +45
      </p>
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

  const size = 140
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  const slices = segments.map((seg, idx) => {
    const pct = seg.percentage / 100
    const dashArray = `${pct * circumference} ${circumference}`
    const prevSum = segments.slice(0, idx).reduce((sum, s) => sum + s.percentage / 100, 0)
    const rotation = prevSum * 360 - 90
    return { ...seg, dashArray, rotation }
  })

  // Find max segment for center text
  const maxSeg = segments.reduce((max, s) => (s.percentage > max.percentage ? s : max), segments[0])

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Organization Distribution</h3>
        <p className="text-xs text-muted-foreground">
          Share of employees by group
        </p>
      </div>

      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative flex flex-shrink-0 items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice) => (
              <circle
                key={slice.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={strokeWidth}
                strokeDasharray={slice.dashArray}
                strokeLinecap="butt"
                transform={`rotate(${slice.rotation} ${size / 2} ${size / 2})`}
              />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-lg font-bold">{maxSeg?.percentage}%</span>
            <span className="text-[9px] text-muted-foreground">{maxSeg?.label}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-muted-foreground">
                {seg.label} · {seg.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
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
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-foreground/5">
      <div>
        <h3 className="text-sm font-semibold">Workforce Risk</h3>
        <p className="text-xs text-muted-foreground">Key indicators</p>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold',
                  item.color || 'bg-muted text-muted-foreground'
                )}
              >
                {item.code || 'RISK'}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className={cn('text-sm font-semibold', item.countColor || 'text-foreground')}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Risk level: Moderate</p>
    </div>
  )
}
