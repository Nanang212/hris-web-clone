// widget-config-panel.tsx

import { useState } from 'react'

import { m } from '@/i18n/paraglide/messages'

export interface SelectedWidget {
  id: string
  name: string
  previewLabel?: string
  previewValue?: string
  previewSub?: string
  previewBadge?: string
  previewBadgeColor?: string
}

interface WidgetConfigPanelProps {
  selected: SelectedWidget | null
  onRemove: () => void
  onApply: (config: WidgetConfig) => void
}

export interface WidgetConfig {
  widgetId: string
  dateRange: string
  visualization: string
  size: 'S' | 'M' | 'L'
  displayComparison: boolean
}

const DATE_RANGE_OPTIONS = ['This month', 'Last month', 'Last 3 months', 'This year']
const VISUALIZATION_OPTIONS = ['Bar + trend', 'Line chart', 'Donut', 'Table']

export function WidgetConfigPanel({ selected, onRemove, onApply }: WidgetConfigPanelProps) {
  const [dateRange, setDateRange] = useState('This month')
  const [visualization, setVisualization] = useState('Bar + trend')
  const [size, setSize] = useState<'S' | 'M' | 'L'>('L')
  const [displayComparison, setDisplayComparison] = useState(true)

  if (!selected) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-3 text-center'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
          <span className='text-2xl'>🧩</span>
        </div>
        <p className='text-sm font-medium text-foreground'>
          {m.dashboard_widget_selected()}
        </p>
        <p className='text-xs text-muted-foreground'>
          {m.dashboard_widget_canvas_sub()}
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-5'>
      {/* Header */}
      <div>
        <p className='text-base font-semibold text-foreground'>
          {m.dashboard_widget_selected()}
        </p>
        <p className='text-sm font-medium text-primary'>{selected.name}</p>
      </div>

      {/* Preview card */}
      <div className='rounded-xl border border-border bg-background p-4'>
        <p className='text-xs font-medium text-muted-foreground'>
          {selected.previewLabel ?? 'Attendance'}
        </p>
        <p className='mt-1 text-3xl font-bold text-foreground'>
          {selected.previewValue ?? '94.7%'}
        </p>
        {selected.previewSub && (
          <p className='mt-0.5 text-xs text-muted-foreground'>{selected.previewSub}</p>
        )}
        {displayComparison && selected.previewBadge && (
          <span
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${selected.previewBadgeColor ?? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}
          >
            {selected.previewBadge}
          </span>
        )}
      </div>

      {/* Date range */}
      <div className='flex flex-col gap-1.5'>
        <label htmlFor='widget-date-range' className='text-xs font-medium text-muted-foreground'>
          {m.dashboard_widget_date_range()}
        </label>
        <select
          id='widget-date-range'
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
        >
          {DATE_RANGE_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Visualization */}
      <div className='flex flex-col gap-1.5'>
        <label
          htmlFor='widget-visualization'
          className='text-xs font-medium text-muted-foreground'
        >
          {m.dashboard_widget_visualization()}
        </label>
        <select
          id='widget-visualization'
          value={visualization}
          onChange={(e) => setVisualization(e.target.value)}
          className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
        >
          {VISUALIZATION_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {/* Size */}
      <div className='flex flex-col gap-1.5'>
        <p className='text-xs font-medium text-muted-foreground'>
          {m.dashboard_widget_size()}
        </p>
        <div className='grid grid-cols-3 gap-2'>
          {(['S', 'M', 'L'] as const).map((s) => (
            <button
              key={s}
              id={`widget-size-${s.toLowerCase()}`}
              type='button'
              onClick={() => setSize(s)}
              className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${
                size === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Display comparison */}
      <div className='flex items-center justify-between'>
        <p className='text-sm font-medium text-foreground'>
          {m.dashboard_widget_display_comparison()}
        </p>
        <button
          id='widget-display-comparison-toggle'
          type='button'
          role='switch'
          aria-checked={displayComparison}
          onClick={() => setDisplayComparison((v) => !v)}
          className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            displayComparison ? 'bg-primary' : 'bg-input'
          }`}
        >
          <span
            className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
              displayComparison ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Tip */}
      <div className='rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20'>
        <p className='text-xs font-semibold text-amber-700 dark:text-amber-400'>
          {m.dashboard_widget_tip()}
        </p>
        <p className='mt-0.5 text-xs text-amber-600 dark:text-amber-300'>
          {m.dashboard_widget_tip_desc()}
        </p>
      </div>

      {/* Spacer */}
      <div className='flex-1' />

      {/* Actions */}
      <div className='flex gap-2'>
        <button
          id='widget-config-remove'
          type='button'
          onClick={onRemove}
          className='flex-1 rounded-lg border border-border py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10'
        >
          {m.dashboard_widget_remove()}
        </button>
        <button
          id='widget-config-apply'
          type='button'
          onClick={() =>
            onApply({ widgetId: selected.id, dateRange, visualization, size, displayComparison })
          }
          className='flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
        >
          {m.dashboard_widget_apply()}
        </button>
      </div>
    </div>
  )
}
