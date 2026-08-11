// dashboard-customize-page.tsx
import { useState } from 'react'

import { m } from '@/i18n/paraglide/messages'
import type { CanvasWidget } from '@/features/dashboard/components/widget-canvas'
import { WidgetCanvas } from '@/features/dashboard/components/widget-canvas'
import type { CatalogWidget } from '@/features/dashboard/components/widget-catalog'
import { WidgetCatalog } from '@/features/dashboard/components/widget-catalog'
import type { SelectedWidget, WidgetConfig } from '@/features/dashboard/components/widget-config-panel'
import { WidgetConfigPanel } from '@/features/dashboard/components/widget-config-panel'
import { WidgetConfigModal } from '@/features/dashboard/components/widget-config-modal'

// ─── Initial catalog data ────────────────────────────────────────────────────

const INITIAL_CATALOG: CatalogWidget[] = [
  {
    id: 'kpi',
    abbr: 'KPI',
    abbrColor: 'bg-violet-500',
    name: m.dashboard_widget_name_kpi,
    desc: m.dashboard_widget_desc_kpi,
    category: ['people', 'payroll'],
    active: true,
  },
  {
    id: 'attendance',
    abbr: 'ATT',
    abbrColor: 'bg-emerald-500',
    name: m.dashboard_widget_name_attendance,
    desc: m.dashboard_widget_desc_attendance,
    category: ['time', 'people'],
    active: true,
  },
  {
    id: 'leave',
    abbr: 'LEV',
    abbrColor: 'bg-blue-500',
    name: m.dashboard_widget_name_leave,
    desc: m.dashboard_widget_desc_leave,
    category: ['time', 'people'],
    active: false,
  },
  {
    id: 'payroll',
    abbr: 'PAY',
    abbrColor: 'bg-amber-500',
    name: m.dashboard_widget_name_payroll,
    desc: m.dashboard_widget_desc_payroll,
    category: ['payroll'],
    active: false,
  },
  {
    id: 'announcement',
    abbr: 'ANN',
    abbrColor: 'bg-rose-500',
    name: m.dashboard_widget_name_announcement,
    desc: m.dashboard_widget_desc_announcement,
    category: ['people'],
    active: true,
  },
  {
    id: 'calendar',
    abbr: 'CAL',
    abbrColor: 'bg-sky-500',
    name: m.dashboard_widget_name_calendar,
    desc: m.dashboard_widget_desc_calendar,
    category: ['time'],
    active: false,
  },
  {
    id: 'birthday',
    abbr: 'BD',
    abbrColor: 'bg-pink-500',
    name: m.dashboard_widget_name_birthday,
    desc: m.dashboard_widget_desc_birthday,
    category: ['people'],
    active: false,
  },
]

// ─── Initial canvas data ─────────────────────────────────────────────────────

const INITIAL_CANVAS: CanvasWidget[] = [
  { id: 'canvas-att', name: 'Attendance Summary', size: 'L', dateRange: 'This month', active: true, colSpan: 1 },
  { id: 'canvas-leave', name: 'Leave Summary', size: 'M', dateRange: 'This year', active: true, colSpan: 1 },
  { id: 'canvas-ann', name: 'Announcement', size: 'M', dateRange: 'Latest 5', active: true, colSpan: 1 },
  { id: 'canvas-cal', name: 'Calendar', size: 'S', dateRange: 'This month', active: true, colSpan: 1 },
  { id: 'canvas-kpi', name: 'KPI Summary', size: 'L', dateRange: 'Headcount, attendance, leave', active: true, colSpan: 2 },
]

// ─── Selected widget preview map ─────────────────────────────────────────────

function buildSelectedWidget(canvasId: string): SelectedWidget {
  const map: Record<string, SelectedWidget> = {
    'canvas-att': {
      id: 'canvas-att',
      name: 'Attendance Summary',
      previewLabel: 'Attendance',
      previewValue: '94.7%',
      previewSub: 'Present today',
      previewBadge: 'Healthy',
      previewBadgeColor:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    'canvas-leave': {
      id: 'canvas-leave',
      name: 'Leave Summary',
      previewLabel: 'Leave Balance',
      previewValue: '18 days',
      previewSub: 'Remaining this year',
      previewBadge: 'On track',
      previewBadgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    },
    'canvas-ann': {
      id: 'canvas-ann',
      name: 'Announcement',
      previewLabel: 'Latest',
      previewValue: '5',
      previewSub: 'Unread announcements',
    },
    'canvas-cal': {
      id: 'canvas-cal',
      name: 'Calendar',
      previewLabel: 'Next event',
      previewValue: '2',
      previewSub: 'Upcoming this week',
    },
    'canvas-kpi': {
      id: 'canvas-kpi',
      name: 'KPI Summary',
      previewLabel: 'Headcount',
      previewValue: '156',
      previewSub: '+5.2% vs last month',
      previewBadge: 'Growing',
      previewBadgeColor:
        'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    },
  }
  return map[canvasId] ?? { id: canvasId, name: canvasId }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function DashboardCustomizePage() {
  const [catalog, setCatalog] = useState<CatalogWidget[]>(INITIAL_CATALOG)
  const [canvasWidgets, setCanvasWidgets] = useState<CanvasWidget[]>(INITIAL_CANVAS)
  const [selectedCanvasId, setSelectedCanvasId] = useState<string | null>('canvas-att')
  const [configuringWidget, setConfiguringWidget] = useState<CanvasWidget | null>(null)

  const handleCatalogToggle = (id: string) => {
    setCatalog((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)))
  }

  const handleAddToCatalog = (widget: CatalogWidget) => {
    setCatalog((prev) => [...prev, widget])
  }

  const handleCanvasSelect = (id: string) => {
    setSelectedCanvasId((prev) => (prev === id ? null : id))
  }

  const handleReorder = (newWidgets: CanvasWidget[]) => {
    setCanvasWidgets(newWidgets)
  }

  const handleAddWidget = () => {
    const notActive = catalog.find((w) => !w.active)
    if (notActive) {
      setCatalog((prev) =>
        prev.map((w) => (w.id === notActive.id ? { ...w, active: true } : w)),
      )
      setCanvasWidgets((prev) => [
        ...prev,
        {
          id: `canvas-${notActive.id}-${Date.now()}`,
          name: notActive.name(),
          size: 'M',
          dateRange: 'This month',
          active: true,
          colSpan: 1,
        },
      ])
    }
  }

  const handleRemove = () => {
    if (!selectedCanvasId) return
    setCanvasWidgets((prev) => prev.filter((w) => w.id !== selectedCanvasId))
    setSelectedCanvasId(null)
  }

  const handleApply = (config: WidgetConfig) => {
    setCanvasWidgets((prev) =>
      prev.map((w) =>
        w.id === config.widgetId ? { ...w, size: config.size, dateRange: config.dateRange } : w,
      ),
    )
  }

  const handleConfigure = (widget: CanvasWidget) => {
    setSelectedCanvasId(widget.id)
    setConfiguringWidget(widget)
  }

  const selectedWidget = selectedCanvasId ? buildSelectedWidget(selectedCanvasId) : null

  return (
    /**
     * Outer wrapper: full height of the AppMain area, flex column, no extra padding
     * (AppMain itself already adds p-4 and bg-background)
     */
    <div className='flex h-[calc(100vh-64px-2rem)] flex-col gap-4 overflow-hidden pb-1'>

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className='flex shrink-0 items-start justify-between'>
        <div>
          <p className='text-xs text-muted-foreground'>
            {m.app_layout_nav_dashboard()} / {m.app_layout_nav_widget()}
          </p>
          <h1 className='mt-0.5 text-2xl font-bold tracking-tight text-foreground'>
            {m.dashboard_widget_customize_title()}
          </h1>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            {m.dashboard_widget_customize_subtitle()}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            id='dashboard-customize-reset'
            type='button'
            onClick={() => {
              setCatalog(INITIAL_CATALOG)
              setCanvasWidgets(INITIAL_CANVAS)
              setSelectedCanvasId(null)
            }}
            className='rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
          >
            {m.dashboard_widget_reset()}
          </button>
          <button
            id='dashboard-customize-save'
            type='button'
            className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
          >
            {m.dashboard_widget_save_layout()}
          </button>
        </div>
      </div>

      {/* ── 3-column card layout ──────────────────────────────────────────────── */}
      <div className='flex min-h-0 flex-1 gap-4'>

        {/* Left card — Widget Catalog */}
        <div className='flex w-[270px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm'>
          <div className='flex-1 overflow-y-auto p-4'>
            <WidgetCatalog widgets={catalog} onToggle={handleCatalogToggle} onAdd={handleAddToCatalog} />
          </div>
        </div>

        {/* Middle card — Live Dashboard Canvas */}
        <div className='flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm'>
          <div className='flex-1 overflow-y-auto p-4'>
            <WidgetCanvas
              widgets={canvasWidgets}
              selectedId={selectedCanvasId}
              onSelect={handleCanvasSelect}
              onReorder={handleReorder}
              onAddWidget={handleAddWidget}
              onConfigure={handleConfigure}
            />
          </div>
        </div>

        {/* Right card — Selected Widget Config */}
        <div className='flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm'>
          <div className='flex-1 overflow-y-auto p-4'>
            <WidgetConfigPanel
              selected={selectedWidget}
              onRemove={handleRemove}
              onApply={handleApply}
            />
          </div>
        </div>

      </div>

      {/* ── Configure Widget Modal ── */}
      {configuringWidget && (
        <WidgetConfigModal
          widget={configuringWidget}
          onClose={() => setConfiguringWidget(null)}
          onSave={(result) => {
            setCanvasWidgets((prev) =>
              prev.map((w) =>
                w.id === result.widgetId
                  ? { ...w, size: result.size, dateRange: result.dateRange }
                  : w,
              ),
            )
          }}
        />
      )}
    </div>
  )
}
