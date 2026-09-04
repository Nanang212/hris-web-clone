// widget-catalog.tsx
import { IconCheck, IconPlus, IconSearch, IconX } from '@tabler/icons-react'
import { useState } from 'react'

import type { CatalogWidget, WidgetCategory } from '@/features/dashboard/types'
import { m } from '@/i18n/paraglide/messages'

interface WidgetCatalogProps {
  widgets: CatalogWidget[]
  onToggle: (id: string) => void
  onAdd: (widget: CatalogWidget) => void
}

const CATEGORIES: { key: WidgetCategory; label: () => string }[] = [
  { key: 'all', label: m.dashboard_widget_cat_all },
  { key: 'people', label: m.dashboard_widget_cat_people },
  { key: 'time', label: m.dashboard_widget_cat_time },
  { key: 'payroll', label: m.dashboard_widget_cat_payroll },
]

const BADGE_COLORS = [
  { label: 'Violet', value: 'bg-violet-500' },
  { label: 'Emerald', value: 'bg-emerald-500' },
  { label: 'Blue', value: 'bg-blue-500' },
  { label: 'Amber', value: 'bg-amber-500' },
  { label: 'Rose', value: 'bg-rose-500' },
  { label: 'Sky', value: 'bg-sky-500' },
  { label: 'Pink', value: 'bg-pink-500' },
  { label: 'Orange', value: 'bg-orange-500' },
  { label: 'Teal', value: 'bg-teal-500' },
  { label: 'Indigo', value: 'bg-indigo-500' },
]

// ─── Add Widget Modal ─────────────────────────────────────────────────────────

interface AddWidgetModalProps {
  onClose: () => void
  onConfirm: (widget: CatalogWidget) => void
}

function AddWidgetModal({ onClose, onConfirm }: AddWidgetModalProps) {
  const [name, setName] = useState('')
  const [abbr, setAbbr] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState('bg-violet-500')
  const [categories, setCategories] = useState<WidgetCategory[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const toggleCategory = (cat: WidgetCategory) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!abbr.trim()) e.abbr = 'Abbreviation is required'
    if (abbr.trim().length > 4) e.abbr = 'Max 4 characters'
    if (!desc.trim()) e.desc = 'Description is required'
    if (categories.length === 0) e.categories = 'Select at least one category'
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const newWidget: CatalogWidget = {
      id: `custom-${Date.now()}`,
      abbr: abbr.trim().toUpperCase(),
      abbrColor: color,
      name: () => name.trim(),
      desc: () => desc.trim(),
      category: categories.length > 0 ? categories : ['people'],
      active: false,
    }
    onConfirm(newWidget)
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className='relative mx-4 w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className='flex items-start justify-between border-b border-border px-5 py-4'>
          <div>
            <p className='text-base font-semibold text-foreground'>
              {m.dashboard_widget_add_catalog_title()}
            </p>
            <p className='mt-0.5 text-xs text-muted-foreground'>
              {m.dashboard_widget_add_catalog_sub()}
            </p>
          </div>
          <button
            id='add-widget-modal-close'
            type='button'
            onClick={onClose}
            className='rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 p-5'>
          {/* Name */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='add-widget-name' className='text-xs font-medium text-foreground'>
              {m.dashboard_widget_field_name()}
              <span className='ml-0.5 text-destructive'>*</span>
            </label>
            <input
              id='add-widget-name'
              type='text'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setErrors((prev) => ({ ...prev, name: '' }))
              }}
              placeholder={m.dashboard_widget_field_name_placeholder()}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                errors.name ? 'border-destructive' : 'border-border'
              } bg-background`}
            />
            {errors.name && <p className='text-xs text-destructive'>{errors.name}</p>}
          </div>

          {/* Abbr + Color row */}
          <div className='flex gap-3'>
            {/* Abbreviation */}
            <div className='flex flex-1 flex-col gap-1.5'>
              <label htmlFor='add-widget-abbr' className='text-xs font-medium text-foreground'>
                {m.dashboard_widget_field_abbr()}
                <span className='ml-0.5 text-destructive'>*</span>
              </label>
              <input
                id='add-widget-abbr'
                type='text'
                value={abbr}
                maxLength={4}
                onChange={(e) => {
                  setAbbr(e.target.value.toUpperCase())
                  setErrors((prev) => ({ ...prev, abbr: '' }))
                }}
                placeholder={m.dashboard_widget_field_abbr_placeholder()}
                className={`w-full rounded-lg border px-3 py-2 font-mono text-sm text-foreground uppercase placeholder:text-muted-foreground placeholder:normal-case focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                  errors.abbr ? 'border-destructive' : 'border-border'
                } bg-background`}
              />
              {errors.abbr && <p className='text-xs text-destructive'>{errors.abbr}</p>}
            </div>

            {/* Badge preview */}
            <div className='flex flex-col items-center justify-end gap-1.5'>
              <p className='text-xs font-medium text-foreground'>Preview</p>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white ${color}`}
              >
                {abbr || '??'}
              </div>
            </div>
          </div>

          {/* Badge color */}
          <div className='flex flex-col gap-1.5'>
            <p className='text-xs font-medium text-foreground'>
              {m.dashboard_widget_field_color()}
            </p>
            <div className='flex flex-wrap gap-2'>
              {BADGE_COLORS.map((c) => (
                <button
                  key={c.value}
                  type='button'
                  id={`add-widget-color-${c.value}`}
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`h-7 w-7 rounded-full transition-all ${c.value} ${
                    color === c.value
                      ? 'ring-2 ring-foreground ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='add-widget-desc' className='text-xs font-medium text-foreground'>
              {m.dashboard_widget_field_desc()}
              <span className='ml-0.5 text-destructive'>*</span>
            </label>
            <input
              id='add-widget-desc'
              type='text'
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value)
                setErrors((prev) => ({ ...prev, desc: '' }))
              }}
              placeholder={m.dashboard_widget_field_desc_placeholder()}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none ${
                errors.desc ? 'border-destructive' : 'border-border'
              } bg-background`}
            />
            {errors.desc && <p className='text-xs text-destructive'>{errors.desc}</p>}
          </div>

          {/* Categories */}
          <div className='flex flex-col gap-1.5'>
            <p className='text-xs font-medium text-foreground'>
              {m.dashboard_widget_field_category()}
              <span className='ml-0.5 text-destructive'>*</span>
            </p>
            <div className='flex flex-wrap gap-2'>
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <button
                  key={cat.key}
                  type='button'
                  id={`add-widget-cat-${cat.key}`}
                  onClick={() => {
                    toggleCategory(cat.key)
                    setErrors((prev) => ({ ...prev, categories: '' }))
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    categories.includes(cat.key)
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {cat.label()}
                </button>
              ))}
            </div>
            {errors.categories && <p className='text-xs text-destructive'>{errors.categories}</p>}
          </div>

          {/* Actions */}
          <div className='flex gap-2 pt-1'>
            <button
              id='add-widget-cancel'
              type='button'
              onClick={onClose}
              className='flex-1 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted'
            >
              {m.dashboard_widget_cancel()}
            </button>
            <button
              id='add-widget-confirm'
              type='submit'
              className='flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90'
            >
              {m.dashboard_widget_add_confirm()}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Widget Catalog ───────────────────────────────────────────────────────────

export function WidgetCatalog({ widgets, onToggle, onAdd }: WidgetCatalogProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<WidgetCategory>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = widgets.filter((w) => {
    const matchCat = activeCategory === 'all' || w.category.includes(activeCategory)
    const matchSearch =
      search === '' ||
      w.name().toLowerCase().includes(search.toLowerCase()) ||
      w.desc().toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <div className='flex h-full flex-col gap-4'>
        {/* Header */}
        <div>
          <p className='text-base font-semibold text-foreground'>{m.dashboard_widget_catalog()}</p>
          <p className='text-xs text-muted-foreground'>{m.dashboard_widget_catalog_sub()}</p>
        </div>

        {/* Search */}
        <div className='relative'>
          <IconSearch
            size={14}
            className='absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground'
          />
          <input
            id='widget-catalog-search'
            type='text'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={m.dashboard_widget_search()}
            className='w-full rounded-lg border border-border bg-background py-2 pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none'
          />
        </div>

        {/* Category tabs — scroll horizontally when labels are long */}
        <div className='flex [scrollbar-width:none] gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden'>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              id={`widget-cat-${cat.key}`}
              type='button'
              onClick={() => setActiveCategory(cat.key)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat.key
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label()}
            </button>
          ))}
        </div>

        {/* Widget list */}
        <div className='flex flex-1 flex-col gap-2 overflow-y-auto'>
          {filtered.length === 0 && (
            <div className='flex flex-col items-center justify-center gap-2 py-8 text-center'>
              <p className='text-sm text-muted-foreground'>No widgets found.</p>
            </div>
          )}
          {filtered.map((widget) => (
            <div
              key={widget.id}
              className='flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/50'
            >
              {/* Abbr badge */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${widget.abbrColor}`}
              >
                {widget.abbr}
              </div>

              {/* Info */}
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium text-foreground'>{widget.name()}</p>
                <p className='truncate text-xs text-muted-foreground'>{widget.desc()}</p>
              </div>

              {/* Toggle button */}
              <button
                id={`widget-toggle-${widget.id}`}
                type='button'
                onClick={() => onToggle(widget.id)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  widget.active
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'border-border bg-background text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {widget.active ? <IconCheck size={14} /> : <IconPlus size={14} />}
              </button>
            </div>
          ))}

          {/* Add widget — dashed button at bottom of list */}
          <button
            id='widget-catalog-add-btn'
            type='button'
            onClick={() => setShowAddModal(true)}
            className='flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
          >
            <IconPlus size={14} />
            {m.dashboard_widget_add_catalog()}
          </button>
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddModal && <AddWidgetModal onClose={() => setShowAddModal(false)} onConfirm={onAdd} />}
    </>
  )
}
