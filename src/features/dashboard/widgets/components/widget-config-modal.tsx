// widget-config-modal.tsx
import { IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { Bar, BarChart, Line, LineChart, Pie, PieChart } from 'recharts'

import { ChartContainer, type ChartConfig } from '@/shared/components/ui/chart'
import type { CanvasWidget, WidgetConfigModalResult } from '@/features/dashboard/types'
import { m } from '@/i18n/paraglide/messages'

// ─── Mock preview data per widget ────────────────────────────────────────────

interface PreviewData {
  value: string
  sub: string
  trend: string
  trendColor: string
  bars: number[]
}

function getPreview(widget: CanvasWidget): PreviewData {
  const map: Record<string, PreviewData> = {
    'canvas-att': {
      value: '94.7%',
      sub: 'present today',
      trend: '+1.4% vs previous month',
      trendColor: 'text-emerald-600 dark:text-emerald-400',
      bars: [55, 70, 60, 80, 75, 90, 85],
    },
    'canvas-leave': {
      value: '18 days',
      sub: 'remaining',
      trend: '-2 days vs last month',
      trendColor: 'text-amber-600 dark:text-amber-400',
      bars: [80, 75, 70, 65, 60, 55, 50],
    },
    'canvas-ann': {
      value: '5',
      sub: 'unread announcements',
      trend: '+2 new this week',
      trendColor: 'text-blue-600 dark:text-blue-400',
      bars: [20, 30, 25, 40, 35, 50, 45],
    },
    'canvas-cal': {
      value: '2',
      sub: 'events this week',
      trend: 'Same as last week',
      trendColor: 'text-muted-foreground',
      bars: [10, 20, 15, 25, 20, 30, 25],
    },
    'canvas-kpi': {
      value: '156',
      sub: 'total headcount',
      trend: '+5.2% vs last month',
      trendColor: 'text-emerald-600 dark:text-emerald-400',
      bars: [60, 70, 75, 80, 85, 90, 95],
    },
  }
  return (
    map[widget.id] ?? {
      value: '—',
      sub: widget.dateRange,
      trend: '',
      trendColor: 'text-muted-foreground',
      bars: [40, 55, 50, 65, 60, 75, 70],
    }
  )
}

// ─── Dynamic mini visualizer ───────────────────────────────────────────────

function MiniVisualizer({ type, bars }: { type: string; bars: number[] }) {
  const data = bars.map((value, index) => ({ index, value }))
  const config = { value: { color: 'var(--chart-1)' } } satisfies ChartConfig

  if (type === 'Bar + trend') {
    return (
      <ChartContainer config={config} className='h-16 w-28'>
        <BarChart accessibilityLayer data={data}>
          <Bar dataKey='value' fill='var(--color-value)' radius={2} />
        </BarChart>
      </ChartContainer>
    )
  }

  if (type === 'Line chart') {
    return (
      <ChartContainer config={config} className='h-16 w-28'>
        <LineChart accessibilityLayer data={data}>
          <Line dataKey='value' type='monotone' stroke='var(--color-value)' strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    )
  }

  if (type === 'Donut') {
    const donutConfig = {
      primary: { color: 'var(--chart-1)' },
      secondary: { color: 'var(--chart-2)' },
    } satisfies ChartConfig
    const donutData = [
      { name: 'primary', value: 70, fill: 'var(--color-primary)' },
      { name: 'secondary', value: 30, fill: 'var(--color-secondary)' },
    ]
    return (
      <ChartContainer config={donutConfig} className='h-16 w-28'>
        <PieChart accessibilityLayer>
          <Pie data={donutData} dataKey='value' nameKey='name' innerRadius={18} outerRadius={28} />
        </PieChart>
      </ChartContainer>
    )
  }

  if (type === 'Table') {
    return (
      <div className='flex h-16 w-28 flex-col gap-1 rounded border border-border bg-background p-1.5 shadow-sm'>
        <div className='flex gap-1 border-b border-border pb-1'>
          <div className='h-1 w-5 rounded bg-muted-foreground/30' />
          <div className='h-1 w-3 rounded bg-muted-foreground/30' />
          <div className='ml-auto h-1 w-4 rounded bg-muted-foreground/30' />
        </div>
        <div className='flex flex-col gap-1'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex items-center gap-1'>
              <div className='h-1 w-6 rounded bg-muted/60' />
              <div className='h-1 w-4 rounded bg-muted/60' />
              <div className='ml-auto h-1 w-3 rounded bg-primary/40' />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 'Number only'
  return (
    <div className='flex h-16 w-28 items-center justify-center rounded border border-dashed border-border font-mono text-[10px] text-muted-foreground'>
      12345
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface WidgetConfigModalProps {
  widget: CanvasWidget
  onClose: () => void
  onSave: (result: WidgetConfigModalResult) => void
}

const DATE_RANGE_OPTIONS = [
  'This month',
  'Last month',
  'Last 3 months',
  'Last 6 months',
  'This year',
]
const COMPARE_OPTIONS = ['Previous month', 'Same month last year', 'None']
const VIZ_OPTIONS = ['Bar + trend', 'Line chart', 'Donut', 'Table', 'Number only']
const REFRESH_OPTIONS = ['5 minutes', '15 minutes', '30 minutes', '1 hour', 'Manual']

const SIZE_OPTIONS: { key: 'S' | 'M' | 'L'; label: () => string }[] = [
  { key: 'S', label: m.dashboard_widget_size_small },
  { key: 'M', label: m.dashboard_widget_size_medium },
  { key: 'L', label: m.dashboard_widget_size_large },
]

// ─── Modal ────────────────────────────────────────────────────────────────────

export function WidgetConfigModal({ widget, onClose, onSave }: WidgetConfigModalProps) {
  const [dateRange, setDateRange] = useState('This month')
  const [compareWith, setCompareWith] = useState('Previous month')
  const [visualization, setVisualization] = useState('Bar + trend')
  const [refreshFrequency, setRefreshFrequency] = useState('15 minutes')
  const [size, setSize] = useState<'S' | 'M' | 'L'>(widget.size)
  const [showComparison, setShowComparison] = useState(true)

  const preview = getPreview(widget)

  const handleSave = () => {
    onSave({
      widgetId: widget.id,
      dateRange,
      compareWith,
      visualization,
      refreshFrequency,
      size,
      showComparison,
    })
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm'
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className='relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className='flex items-start justify-between border-b border-border px-6 py-5'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>
              {m.dashboard_widget_configure_title()}
            </h2>
            <p className='mt-0.5 text-sm font-medium text-primary'>{widget.name}</p>
          </div>
          <button
            id='widget-config-modal-close'
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <IconX size={20} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className='flex flex-col gap-5 overflow-y-auto p-6'>
          {/* Live preview card */}
          <div className='rounded-xl border border-border bg-muted/30 p-4'>
            <p className='mb-2 text-xs font-medium text-muted-foreground'>
              {m.dashboard_widget_live_preview()}
            </p>
            <div className='flex items-end justify-between gap-4'>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-foreground'>{widget.name}</p>
                <p className='mt-1 text-3xl font-bold text-foreground'>{preview.value}</p>
                <p className={`mt-1 text-xs ${preview.trendColor}`}>
                  {preview.sub} {showComparison && preview.trend ? `· ${preview.trend}` : ''}
                </p>
              </div>
              <div className='w-28 shrink-0'>
                <MiniVisualizer type={visualization} bars={preview.bars} />
              </div>
            </div>
          </div>

          {/* Date range + Compare with — 2 columns */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='cfg-date-range' className='text-xs font-medium text-muted-foreground'>
                {m.dashboard_widget_date_range()}
              </label>
              <select
                id='cfg-date-range'
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none'
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='cfg-compare' className='text-xs font-medium text-muted-foreground'>
                {m.dashboard_widget_compare_with()}
              </label>
              <select
                id='cfg-compare'
                value={compareWith}
                onChange={(e) => setCompareWith(e.target.value)}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none'
              >
                {COMPARE_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Visualization + Refresh frequency — 2 columns */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='cfg-viz' className='text-xs font-medium text-muted-foreground'>
                {m.dashboard_widget_visualization()}
              </label>
              <select
                id='cfg-viz'
                value={visualization}
                onChange={(e) => setVisualization(e.target.value)}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none'
              >
                {VIZ_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='cfg-refresh' className='text-xs font-medium text-muted-foreground'>
                {m.dashboard_widget_refresh_frequency()}
              </label>
              <select
                id='cfg-refresh'
                value={refreshFrequency}
                onChange={(e) => setRefreshFrequency(e.target.value)}
                className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none'
              >
                {REFRESH_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Widget size */}
          <div className='flex flex-col gap-2'>
            <p className='text-xs font-medium text-muted-foreground'>{m.dashboard_widget_size()}</p>
            <div className='grid grid-cols-3 gap-2'>
              {SIZE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  id={`cfg-size-${key.toLowerCase()}`}
                  type='button'
                  onClick={() => setSize(key)}
                  className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
                    size === key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:border-primary/50'
                  }`}
                >
                  {label()}
                </button>
              ))}
            </div>
          </div>

          {/* Show comparison indicator — card with toggle */}
          <div className='flex items-center justify-between rounded-xl border border-border p-4'>
            <div className='flex-1'>
              <p className='text-sm font-semibold text-foreground'>
                {m.dashboard_widget_show_comparison_indicator()}
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                {m.dashboard_widget_show_comparison_desc()}
              </p>
            </div>
            <button
              id='cfg-show-comparison-toggle'
              type='button'
              role='switch'
              aria-checked={showComparison}
              onClick={() => setShowComparison((v) => !v)}
              className={`ml-4 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                showComparison ? 'bg-primary' : 'bg-input'
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                  showComparison ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Info notice */}
          <div className='rounded-xl border border-primary/30 bg-primary/5 p-4'>
            <p className='text-sm font-semibold text-primary'>
              {m.dashboard_widget_config_notice()}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {m.dashboard_widget_config_notice_desc()}
            </p>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className='flex gap-3 border-t border-border px-6 py-4'>
          <button
            id='widget-config-modal-cancel'
            type='button'
            onClick={onClose}
            className='flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          >
            {m.dashboard_widget_cancel()}
          </button>
          <button
            id='widget-config-modal-save'
            type='button'
            onClick={handleSave}
            className='flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            {m.dashboard_widget_save_widget()}
          </button>
        </div>
      </div>
    </div>
  )
}
