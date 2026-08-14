import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useState } from 'react'

import { cn } from '@/shared/lib/utils'

import type { ConditionOperator, ConditionRule, RoutingRule } from '../../types'

export const fieldOptions = [
  { value: 'leave_days', label: 'Jumlah Hari Cuti' },
  { value: 'leave_type', label: 'Tipe Cuti' },
  { value: 'department', label: 'Departemen' },
  { value: 'position', label: 'Jabatan' },
  { value: 'amount', label: 'Jumlah (Rupiah)' },
  { value: 'employment_type', label: 'Tipe Karyawan' },
  { value: 'work_location', label: 'Lokasi Kerja' },
]

export const operatorLabels: Record<ConditionOperator, string> = {
  eq: '= (Sama dengan)',
  neq: '≠ (Tidak sama)',
  gt: '> (Lebih dari)',
  gte: '≥ (Lebih dari / sama)',
  lt: '< (Kurang dari)',
  lte: '≤ (Kurang dari / sama)',
  in: 'Termasuk dalam',
  not_in: 'Tidak termasuk',
}

interface RuleRowProps {
  rule: ConditionRule
  onRemove: () => void
}

export function RuleRow({ rule, onRemove }: Readonly<RuleRowProps>) {
  const fieldLabel = fieldOptions.find((f) => f.value === rule.field)?.label ?? rule.field
  return (
    <div className='flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5'>
      <IconGripVertical size={14} className='cursor-grab text-muted-foreground' />
      <div className='flex flex-1 flex-wrap items-center gap-1.5 text-xs'>
        <span className='rounded-lg bg-muted px-2 py-0.5 font-medium text-foreground'>
          {fieldLabel}
        </span>
        <span className='text-muted-foreground'>{operatorLabels[rule.operator].split(' ')[0]}</span>
        <span className='rounded-lg bg-primary/10 px-2 py-0.5 font-medium text-primary'>
          {String(rule.value)}
        </span>
      </div>
      <button
        type='button'
        onClick={onRemove}
        className='flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
      >
        <IconTrash size={12} />
      </button>
    </div>
  )
}

// ─── RuleCard ─────────────────────────────────────────────────────────────────

interface RuleCardProps {
  rule: RoutingRule
  idx: number
  total: number
}

export function RuleCard({ rule, idx, total }: RuleCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [localRules, setLocalRules] = useState(rule.conditions.rules)
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRule, setNewRule] = useState<Partial<ConditionRule>>({
    field: 'leave_days',
    operator: 'gt',
    value: '',
  })

  return (
    <div className='rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5'>
      {/* Card Header */}
      <div
        className='flex cursor-pointer items-center gap-3 p-5'
        onClick={() => setExpanded((e) => !e)}
      >
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground'>
          {idx + 1}
        </div>
        <div className='flex-1'>
          <p className='text-sm font-semibold'>{rule.name}</p>
          <p className='text-xs text-muted-foreground'>
            Prioritas {rule.priority} · {localRules.length} kondisi ·{' '}
            <span className='capitalize'>{rule.conditions.logic}</span> logic
          </p>
        </div>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            disabled={idx === 0}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30'
            onClick={(e) => e.stopPropagation()}
          >
            <IconChevronUp size={14} />
          </button>
          <button
            type='button'
            disabled={idx === total - 1}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted disabled:opacity-30'
            onClick={(e) => e.stopPropagation()}
          >
            <IconChevronDown size={14} />
          </button>
          <button
            type='button'
            className='flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20'
            onClick={(e) => e.stopPropagation()}
          >
            <IconTrash size={14} />
          </button>
          {expanded ? (
            <IconChevronUp size={16} className='text-muted-foreground' />
          ) : (
            <IconChevronDown size={16} className='text-muted-foreground' />
          )}
        </div>
      </div>

      {expanded && (
        <div className='border-t border-border/50 p-5'>
          <div className='flex flex-col gap-4'>
            {/* Logic toggle */}
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-muted-foreground'>Logic:</span>
              {(['AND', 'OR'] as const).map((logic) => (
                <button
                  key={logic}
                  type='button'
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition-all',
                    rule.conditions.logic === logic
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {logic}
                </button>
              ))}
            </div>

            {/* Rules */}
            <div className='flex flex-col gap-2'>
              <p className='text-xs font-medium text-muted-foreground'>Kondisi:</p>
              {localRules.map((r, rIdx) => (
                <RuleRow
                  key={r.id}
                  rule={r}
                  onRemove={() => setLocalRules((prev) => prev.filter((_, i) => i !== rIdx))}
                />
              ))}

              {/* Add rule inline */}
              {showAddRow ? (
                <div className='flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3'>
                  <select
                    value={newRule.field}
                    onChange={(e) => setNewRule((r) => ({ ...r, field: e.target.value }))}
                    className='h-8 flex-1 rounded-lg border border-input bg-background px-2 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
                  >
                    {fieldOptions.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newRule.operator}
                    onChange={(e) =>
                      setNewRule((r) => ({ ...r, operator: e.target.value as ConditionOperator }))
                    }
                    className='h-8 w-20 rounded-lg border border-input bg-background px-2 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
                  >
                    {(Object.entries(operatorLabels) as [ConditionOperator, string][]).map(
                      ([op, label]) => (
                        <option key={op} value={op}>
                          {label.split(' ')[0]}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    type='text'
                    placeholder='Nilai'
                    value={String(newRule.value ?? '')}
                    onChange={(e) => setNewRule((r) => ({ ...r, value: e.target.value }))}
                    className='h-8 w-24 rounded-lg border border-input bg-background px-2 text-xs focus:ring-2 focus:ring-ring/50 focus:outline-none'
                  />
                  <button
                    type='button'
                    onClick={() => {
                      if (newRule.field && newRule.operator !== undefined) {
                        setLocalRules((prev) => [
                          ...prev,
                          {
                            id: `r-${Date.now()}`,
                            field: newRule.field!,
                            operator: newRule.operator!,
                            value: newRule.value ?? '',
                          },
                        ])
                        setShowAddRow(false)
                        setNewRule({ field: 'leave_days', operator: 'gt', value: '' })
                      }
                    }}
                    className='h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90'
                  >
                    Tambah
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowAddRow(false)}
                    className='h-8 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-muted'
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={() => setShowAddRow(true)}
                  className='flex items-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary'
                >
                  <IconPlus size={13} className='ml-2' />
                  Tambah Kondisi
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
