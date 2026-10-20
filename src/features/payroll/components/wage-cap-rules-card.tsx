// src/features/payroll/components/wage-cap-rules-card.tsx
// Batas maksimal dasar upah (cap) BPJS Kesehatan & JP dengan tanggal berlaku.
// Mendukung pemisahan konteks scope: 'kes' (BPJS Kesehatan saja) atau 'tk' (Jaminan Pensiun saja) atau 'all'.

import { IconAlertTriangle, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/id'
import { usePayrollBpjsStore } from '../store/payroll-bpjs-store'
import type { WageCapRule } from '../types'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import { Button } from '@/shared/components/ui/button'
import { FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { TableActionButton } from '@/shared/components/ui/table-action-button'
import { snackbar } from '@/shared/lib/snackbar'

/** Format angka menjadi format ribuan dengan titik (contoh: 12000000 -> 12.000.000) */
function formatDots(val: number | string | undefined): string {
  if (val === undefined || val === null || val === '') return ''
  const digits = String(val).replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

/** Mengurai string dengan titik pemisah menjadi integer murni */
function parseDots(val: string): number {
  const digits = val.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

export interface WageCapRulesCardProps {
  scope?: 'all' | 'kes' | 'tk'
}

export function WageCapRulesCard({ scope = 'all' }: WageCapRulesCardProps) {
  const savedRules = usePayrollBpjsStore((s) => s.wageCapRules)
  const setWageCapRules = usePayrollBpjsStore((s) => s.setWageCapRules)
  const storedSavedAtKes = usePayrollBpjsStore((s) => s.wageCapKesLastSavedAt)
  const storedSavedAtTk = usePayrollBpjsStore((s) => s.wageCapTkLastSavedAt)
  const storedSavedAtAll = usePayrollBpjsStore((s) => s.wageCapLastSavedAt)

  const relevantSavedAt =
    scope === 'kes' ? storedSavedAtKes : scope === 'tk' ? storedSavedAtTk : storedSavedAtAll

  const [rules, setRules] = useState<WageCapRule[]>(savedRules)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(relevantSavedAt ?? null)

  const [prevRelevantSavedAt, setPrevRelevantSavedAt] = useState(relevantSavedAt)
  if (relevantSavedAt !== prevRelevantSavedAt) {
    setPrevRelevantSavedAt(relevantSavedAt)
    setLastSavedAt(relevantSavedAt ?? null)
  }

  const isDirty = useMemo(() => {
    if (rules.length !== savedRules.length) return true
    const sortedCurrent = [...rules].sort((a, b) => a.id.localeCompare(b.id))
    const sortedSaved = [...savedRules].sort((a, b) => a.id.localeCompare(b.id))

    if (scope === 'kes') {
      const cur = sortedCurrent.map((r) => ({ effectiveFrom: r.effectiveFrom, cap: r.kesMaxWageCap }))
      const sav = sortedSaved.map((r) => ({ effectiveFrom: r.effectiveFrom, cap: r.kesMaxWageCap }))
      return JSON.stringify(cur) !== JSON.stringify(sav)
    }

    if (scope === 'tk') {
      const cur = sortedCurrent.map((r) => ({ effectiveFrom: r.effectiveFrom, cap: r.jpMaxWageCap }))
      const sav = sortedSaved.map((r) => ({ effectiveFrom: r.effectiveFrom, cap: r.jpMaxWageCap }))
      return JSON.stringify(cur) !== JSON.stringify(sav)
    }

    return JSON.stringify(sortedCurrent) !== JSON.stringify(sortedSaved)
  }, [rules, savedRules, scope])

  const formatSaveTimestamp = (date: Date = new Date()) =>
    m.payroll_wage_cap_timestamp({ timestamp: dayjs(date).locale(getLocale()).format('DD MMMM YYYY HH:mm') })

  const update = (id: string, patch: Partial<WageCapRule>) =>
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)))

  const handleAdd = () => {
    const last = [...rules].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]
    setRules((prev) => [
      ...prev,
      {
        id: `cap-${Date.now()}`,
        effectiveFrom: dayjs().format('YYYY-MM'),
        kesMaxWageCap: last?.kesMaxWageCap ?? 12_000_000,
        jpMaxWageCap: last?.jpMaxWageCap ?? 10_042_300,
      },
    ])
    snackbar.info(m.payroll_wage_cap_added())
  }

  const handleSave = () => {
    if (rules.length === 0) {
      snackbar.error(m.payroll_wage_cap_required())
      return
    }
    const months = rules.map((r) => r.effectiveFrom)
    if (months.some((m) => !m) || new Set(months).size !== months.length) {
      snackbar.error(m.payroll_wage_cap_unique_dates())
      return
    }
    const timestampStr = formatSaveTimestamp()
    setWageCapRules(rules, timestampStr, scope)
    setLastSavedAt(timestampStr)
    snackbar.success(
      scope === 'kes'
        ? m.payroll_wage_cap_saved_kes({timestamp: timestampStr})
        : scope === 'tk'
          ? m.payroll_wage_cap_saved_tk({timestamp: timestampStr})
          : m.payroll_wage_cap_saved_all({timestamp: timestampStr}),
    )
  }

  const cardTitle =
    scope === 'kes'
      ? m.payroll_wage_cap_title_kes()
      : scope === 'tk'
        ? m.payroll_wage_cap_title_tk()
        : m.payroll_wage_cap_title_all()

  const cardDescription =
    scope === 'kes'
      ? m.payroll_wage_cap_description_kes()
      : scope === 'tk'
        ? m.payroll_wage_cap_description_tk()
        : m.payroll_wage_cap_description_all()

  const gridColsClass =
    scope === 'all'
      ? 'grid-cols-1 md:grid-cols-[180px_1fr_1fr_auto]'
      : 'grid-cols-1 md:grid-cols-[180px_1fr_auto]'

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
      <div className='p-5 border-b border-border/60 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>{cardTitle}</h3>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-2xl'>{cardDescription}</p>
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1.5 h-9 text-xs font-semibold rounded-xl cursor-pointer'
          onClick={handleAdd}
        >
          <IconPlus size={15} />
          {m.payroll_wage_cap_add_button()}
        </Button>
      </div>

      <div className='p-5 space-y-4'>
        {/* Banner Peringatan Perubahan Belum Disimpan */}
        {isDirty && (
          <div className='p-3.5 rounded-xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/25 text-xs flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200 shadow-2xs'>
            <div className='flex items-center gap-2.5'>
              <span className='relative flex h-2.5 w-2.5 shrink-0'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500'></span>
              </span>
              <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
              <span>
                {m.payroll_wage_cap_unsaved_description()}
              </span>
            </div>
            <Button
              type='button'
              size='sm'
              className='shrink-0'
              onClick={handleSave}
            >
              {m.payroll_wage_cap_save_now()}
            </Button>
          </div>
        )}

        <div className='space-y-3'>
          {rules
            .slice()
            .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
            .map((rule) => (
              <div
                key={rule.id}
                className={`grid ${gridColsClass} gap-3.5 items-end p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/30 transition-colors shadow-2xs`}
              >
                <div className='space-y-1.5'>
                  <FieldLabel className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_wage_cap_effective_from()}</FieldLabel>
                  <Input
                    type='month'
                    value={rule.effectiveFrom}
                    onChange={(e) => update(rule.id, { effectiveFrom: e.target.value })}
                    className='h-9 text-xs rounded-xl bg-background'
                  />
                </div>

                {/* Input Cap BPJS Kesehatan (hanya ditampilkan jika scope === 'all' atau 'kes') */}
                {(scope === 'all' || scope === 'kes') && (
                  <div className='space-y-1.5'>
                    <FieldLabel className='text-[11px] font-semibold text-muted-foreground flex items-center justify-between'>
                      <span>{m.payroll_wage_cap_kes_label()}</span>
                      <span className='text-[10px] text-muted-foreground font-normal'>{m.payroll_wage_cap_base_hint()}</span>
                    </FieldLabel>
                    <div className='relative flex items-center'>
                      <span className='absolute left-3 text-xs font-bold text-muted-foreground select-none pointer-events-none'>
                        Rp
                      </span>
                      <Input
                        type='text'
                        inputMode='numeric'
                        value={formatDots(rule.kesMaxWageCap)}
                        onChange={(e) => update(rule.id, { kesMaxWageCap: parseDots(e.target.value) })}
                        placeholder='12.000.000'
                        className='h-9 pl-9 pr-3 text-xs font-semibold rounded-xl bg-background tracking-wide'
                      />
                    </div>
                  </div>
                )}

                {/* Input Cap JP BPJS TK (hanya ditampilkan jika scope === 'all' atau 'tk') */}
                {(scope === 'all' || scope === 'tk') && (
                  <div className='space-y-1.5'>
                    <FieldLabel className='text-[11px] font-semibold text-muted-foreground flex items-center justify-between'>
                      <span>{m.payroll_wage_cap_jp_label()}</span>
                      <span className='text-[10px] text-muted-foreground font-normal'>{m.payroll_wage_cap_annual_hint()}</span>
                    </FieldLabel>
                    <div className='relative flex items-center'>
                      <span className='absolute left-3 text-xs font-bold text-muted-foreground select-none pointer-events-none'>
                        Rp
                      </span>
                      <Input
                        type='text'
                        inputMode='numeric'
                        value={formatDots(rule.jpMaxWageCap)}
                        onChange={(e) => update(rule.id, { jpMaxWageCap: parseDots(e.target.value) })}
                        placeholder='10.042.300'
                        className='h-9 pl-9 pr-3 text-xs font-semibold rounded-xl bg-background tracking-wide'
                      />
                    </div>
                  </div>
                )}

                <TableActionButton
                  tooltip={m.payroll_wage_cap_delete_rule()}
                  icon={<IconTrash size={15} />}
                  intent='danger'
                  disabled={rules.length <= 1}
                  onClick={() => setRules((prev) => prev.filter((item) => item.id !== rule.id))}
                />
              </div>
            ))}
        </div>

        {/* Footer dengan Count, Status Note dan Tombol Simpan */}
        <div className='flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60'>
          <p className='text-xs text-muted-foreground'>
            {m.payroll_wage_cap_rule_count({count: rules.length})}
          </p>

          <div className='flex flex-wrap items-center gap-3'>
            {isDirty ? (
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold animate-in fade-in duration-200'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500'></span>
                </span>
                <IconAlertTriangle size={15} className='text-amber-600 dark:text-amber-400 shrink-0' />
                <span>
                  {scope === 'kes'
                    ? m.payroll_wage_cap_unsaved_kes()
                    : scope === 'tk'
                      ? m.payroll_wage_cap_unsaved_tk()
                      : m.payroll_wage_cap_unsaved_all()}
                </span>
              </div>
            ) : lastSavedAt ? (
              <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200'>
                <IconCheck size={15} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                <span>
                  {scope === 'kes'
                    ? m.payroll_wage_cap_saved_kes({timestamp: lastSavedAt})
                    : scope === 'tk'
                      ? m.payroll_wage_cap_saved_tk({timestamp: lastSavedAt})
                      : m.payroll_wage_cap_saved_all({timestamp: lastSavedAt})}
                </span>
              </div>
            ) : null}

            <Button
              type='button'
              size='sm'
              onClick={handleSave}
            >
              {scope === 'kes'
                ? m.payroll_wage_cap_save_kes()
                : scope === 'tk'
                  ? m.payroll_wage_cap_save_tk()
                  : m.payroll_wage_cap_save_all()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
