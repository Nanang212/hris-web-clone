// widget-canvas.tsx
import { IconDots, IconGripVertical } from '@tabler/icons-react'
import { useRef } from 'react'

import { m } from '@/i18n/paraglide/messages'

export interface CanvasWidget {
  id: string
  name: string
  size: 'S' | 'M' | 'L'
  dateRange: string
  active: boolean
  colSpan?: 1 | 2
}

interface WidgetCanvasProps {
  widgets: CanvasWidget[]
  selectedId: string | null
  onSelect: (id: string) => void
  onReorder: (widgets: CanvasWidget[]) => void
  onAddWidget: () => void
  onConfigure: (widget: CanvasWidget) => void
}

function sizeLabel(size: 'S' | 'M' | 'L'): string {
  return size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'
}

export function WidgetCanvas({
  widgets,
  selectedId,
  onSelect,
  onReorder,
  onAddWidget,
  onConfigure,
}: WidgetCanvasProps) {
  const dragIndexRef = useRef<number | null>(null)

  const handleDragStart = (index: number) => {
    dragIndexRef.current = index
  }

  const handleDrop = (targetIndex: number) => {
    const from = dragIndexRef.current
    if (from === null || from === targetIndex) return
    const next = [...widgets]
    const [moved] = next.splice(from, 1)
    next.splice(targetIndex, 0, moved)
    onReorder(next)
    dragIndexRef.current = null
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-base font-semibold text-foreground'>
            {m.dashboard_widget_canvas()}
          </p>
          <p className='text-xs text-muted-foreground'>{m.dashboard_widget_canvas_sub()}</p>
        </div>
        <button
          id='widget-canvas-desktop-toggle'
          type='button'
          className='shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted'
        >
          {m.dashboard_widget_desktop()}
        </button>
      </div>

      {/* Edit mode banner */}
      <div className='rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40'>
        <p className='text-xs font-semibold text-blue-700 dark:text-blue-300'>
          {m.dashboard_widget_edit_mode()}
        </p>
        <p className='text-xs text-blue-600 dark:text-blue-400'>
          {m.dashboard_widget_edit_mode_sub()}
        </p>
      </div>

      {/* Canvas grid */}
      <div className='flex flex-1 flex-col gap-3 overflow-y-auto'>
        <div className='grid grid-cols-2 gap-3'>
          {widgets.map((widget, index) => {
            const isSelected = selectedId === widget.id
            return (
              <div
                key={widget.id}
                id={`canvas-widget-${widget.id}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onClick={() => onSelect(widget.id)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-3 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/40'
                } ${
                  widget.size === 'L'
                    ? 'col-span-2 min-h-[130px]'
                    : widget.size === 'M'
                      ? 'col-span-1 min-h-[110px]'
                      : 'col-span-1 min-h-[95px]'
                }`}
              >
                {/* Drag handle + widget title row */}
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <IconGripVertical
                      size={14}
                      className='cursor-grab text-muted-foreground active:cursor-grabbing'
                    />
                    <span className='text-sm font-medium text-foreground'>{widget.name}</span>
                  </div>
                  <button
                    id={`canvas-widget-menu-${widget.id}`}
                    type='button'
                    title='Configure widget'
                    onClick={(e) => {
                      e.stopPropagation()
                      onConfigure(widget)
                    }}
                    className='rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground'
                  >
                    <IconDots size={16} />
                  </button>
                </div>

                {/* Sub-label */}
                <p className='text-xs text-muted-foreground'>
                  {sizeLabel(widget.size)} · {widget.dateRange}
                </p>

                {/* Active badge */}
                <div className='mt-1'>
                  <span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                    {m.dashboard_widget_active()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Drop zone */}
        <button
          id='canvas-drop-zone'
          type='button'
          onClick={onAddWidget}
          className='flex w-full items-center justify-center rounded-xl border-2 border-dashed border-border py-5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
        >
          {m.dashboard_widget_drop_here()}
        </button>
      </div>
    </div>
  )
}
