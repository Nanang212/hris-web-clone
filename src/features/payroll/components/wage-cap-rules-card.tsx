// src/features/payroll/components/wage-cap-rules-card.tsx
// Batas maksimal dasar upah (cap) BPJS Kesehatan & JP dengan tanggal berlaku.
// Mendukung pemisahan konteks scope: 'kes' (BPJS Kesehatan saja) atau 'tk' (Jaminan Pensiun saja) atau 'all'.

import { IconAlertTriangle, IconCheck, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { usePayrollBpjsStore } from '../store/payroll-bpjs-store'
import type { WageCapRule } from '../types'
import { Button } from '@/shared/components/ui/button'
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

  const formatSaveTimestamp = (date: Date = new Date()) => {
    const day = String(date.getDate()).padStart(2, '0')
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day} ${month} ${year} pukul ${hours}:${minutes} WIB`
  }

  const update = (id: string, patch: Partial<WageCapRule>) =>
    setRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)))

  const handleAdd = () => {
    const last = [...rules].sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]
    setRules((prev) => [
      ...prev,
      {
        id: `cap-${Date.now()}`,
        effectiveFrom: new Date().toISOString().slice(0, 7),
        kesMaxWageCap: last?.kesMaxWageCap ?? 12_000_000,
        jpMaxWageCap: last?.jpMaxWageCap ?? 10_042_300,
      },
    ])
    snackbar.info('Aturan cap baru ditambahkan. Klik "Simpan cap" untuk menyimpan.')
  }

  const handleSave = () => {
    if (rules.length === 0) {
      snackbar.error('Minimal harus ada satu aturan cap.')
      return
    }
    const months = rules.map((r) => r.effectiveFrom)
    if (months.some((m) => !m) || new Set(months).size !== months.length) {
      snackbar.error('Tanggal berlaku harus diisi dan tidak boleh sama antar aturan.')
      return
    }
    const timestampStr = formatSaveTimestamp()
    setWageCapRules(rules, timestampStr, scope)
    setLastSavedAt(timestampStr)
    snackbar.success(
      scope === 'kes'
        ? `Cap upah BPJS Kesehatan berhasil disimpan pada ${timestampStr}.`
        : scope === 'tk'
          ? `Cap upah Jaminan Pensiun (JP) BPJS TK berhasil disimpan pada ${timestampStr}.`
          : `Cap upah BPJS berhasil disimpan pada ${timestampStr}.`,
    )
  }

  const cardTitle =
    scope === 'kes'
      ? 'Batas Upah Maksimal (Cap) BPJS Kesehatan & Tanggal Berlaku'
      : scope === 'tk'
        ? 'Batas Upah Maksimal (Cap) Jaminan Pensiun (JP) & Tanggal Berlaku'
        : 'Batas Upah Maksimal (Cap) & Tanggal Berlaku'

  const cardDescription =
    scope === 'kes'
      ? 'Plafon dasar upah maksimal untuk perhitungan iuran BPJS Kesehatan (4% perusahaan & 1% karyawan). Payroll memakai aturan terbaru yang sudah berlaku di periode tersebut, jadi periode lama tidak berubah saat cap diganti.'
      : scope === 'tk'
        ? 'Plafon dasar upah maksimal tahunan untuk program Jaminan Pensiun BPJS TK (2% perusahaan & 1% karyawan). Program BPJS TK lain (JKK, JKM, JHT) tidak memiliki batas upah.'
        : 'Cap BPJS Kesehatan dan JP. Payroll memakai aturan terbaru yang sudah berlaku di periode tersebut, jadi periode lama tidak berubah saat cap diganti.'

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
          Tambah aturan
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
                <b className='font-semibold'>Perubahan belum disimpan.</b> Nilai batas upah (cap) telah diubah. Klik tombol <i>"Simpan cap"</i> di bawah untuk menyimpan.
              </span>
            </div>
            <Button
              type='button'
              size='sm'
              className='h-7.5 px-3 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-2xs cursor-pointer'
              onClick={handleSave}
            >
              Simpan Sekarang
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
                  <label className='text-[11px] font-semibold text-muted-foreground'>Berlaku mulai</label>
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
                    <label className='text-[11px] font-semibold text-muted-foreground flex items-center justify-between'>
                      <span>Cap BPJS Kesehatan (4% & 1%)</span>
                      <span className='text-[10px] text-muted-foreground font-normal'>Dasar iuran maks.</span>
                    </label>
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
                    <label className='text-[11px] font-semibold text-muted-foreground flex items-center justify-between'>
                      <span>Cap JP - Jaminan Pensiun (1% & 2%)</span>
                      <span className='text-[10px] text-muted-foreground font-normal'>Plafon tahunan</span>
                    </label>
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
                  tooltip='Hapus aturan'
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
            Total <b>{rules.length}</b> aturan batas upah (cap).
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
                    ? 'Perubahan cap BPJS Kesehatan belum disimpan'
                    : scope === 'tk'
                      ? 'Perubahan cap JP BPJS TK belum disimpan'
                      : 'Perubahan belum disimpan'}
                </span>
              </div>
            ) : lastSavedAt ? (
              <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in duration-200'>
                <IconCheck size={15} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                <span>
                  {scope === 'kes'
                    ? `Data cap BPJS Kesehatan berhasil disimpan pada ${lastSavedAt}`
                    : scope === 'tk'
                      ? `Data cap JP BPJS TK berhasil disimpan pada ${lastSavedAt}`
                      : `Data berhasil disimpan pada ${lastSavedAt}`}
                </span>
              </div>
            ) : null}

            <Button
              type='button'
              className={`h-9 px-5 text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer ${
                isDirty
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md ring-2 ring-primary/20'
                  : 'bg-primary/85 hover:bg-primary text-primary-foreground'
              }`}
              onClick={handleSave}
            >
              {scope === 'kes'
                ? 'Simpan cap BPJS Kesehatan'
                : scope === 'tk'
                  ? 'Simpan cap JP BPJS TK'
                  : 'Simpan cap'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
