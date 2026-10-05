// src/features/payroll/components/bpjs-kes-reconciliation-panel.tsx
// Panel visual rekonsiliasi Tagihan BPJS Kesehatan upload vs Report Payroll.
// Berfungsi sebagai kontrol audit selisih kepesertaan, upah, dan status karyawan.

import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconCircleX,
  IconFileSpreadsheet,
  IconInfoCircle,
  IconSearch,
  IconUserExclamation,
  IconUserX,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { formatIDR } from '../data/mock-payroll-data'
import type {
  BpjsKesReconciliationRow,
  BpjsKesReconciliationSummary,
  ReconciliationStatus,
} from '../lib/payroll-reconciliation'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

interface BpjsKesReconciliationPanelProps {
  rows: BpjsKesReconciliationRow[]
  summary: BpjsKesReconciliationSummary
  periodLabel: string
  onDownloadExcel?: () => void
}

export function BpjsKesReconciliationPanel({
  rows,
  summary,
  periodLabel,
  onDownloadExcel,
}: BpjsKesReconciliationPanelProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ISSUES' | ReconciliationStatus>('ALL')

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchSearch =
        row.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        row.nopeg.toLowerCase().includes(search.toLowerCase()) ||
        row.nik.toLowerCase().includes(search.toLowerCase()) ||
        row.bpjsNumber.toLowerCase().includes(search.toLowerCase()) ||
        row.project.toLowerCase().includes(search.toLowerCase())

      if (!matchSearch) return false

      if (statusFilter === 'ALL') return true
      if (statusFilter === 'ISSUES') return row.status !== 'MATCH'
      return row.status === statusFilter
    })
  }, [rows, search, statusFilter])

  const issueCount = summary.wageDiffCount + summary.missingInBillingCount + summary.orphanBillingCount

  return (
    <div className='space-y-6'>
      {/* ── 1. KPI Cards Summary ────────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'>
              <IconFileSpreadsheet size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Tagihan BPJS Upload</p>
              <b className='text-base font-bold text-foreground'>{formatIDR(summary.totalBillingSum)}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconCircleCheck size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Masuk Payroll</p>
              <b className='text-base font-bold text-foreground'>{formatIDR(summary.totalPayrollSum)}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span
              className={`p-2.5 rounded-xl ${
                summary.netDifference === 0
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {summary.netDifference === 0 ? <IconCheck size={20} /> : <IconAlertTriangle size={20} />}
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Selisih Bersih (Variance)</p>
              <b
                className={`text-base font-bold ${
                  summary.netDifference === 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {summary.netDifference === 0
                  ? 'Rp 0 (Sempurna)'
                  : `${summary.netDifference > 0 ? '+' : ''}${formatIDR(summary.netDifference)}`}
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span
              className={`p-2.5 rounded-xl ${
                issueCount === 0
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
              }`}
            >
              <IconInfoCircle size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Audit Kepesertaan</p>
              <b className='text-base font-bold text-foreground'>
                {summary.matchCount} Cocok · {issueCount} Temuan
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Petunjuk Analisis Selisih ──────────────────────────────────── */}
      {issueCount > 0 && (
        <div className='p-4 rounded-2xl border border-amber-300/80 bg-amber-50/80 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-2'>
          <div className='flex items-center gap-2 font-bold'>
            <IconAlertTriangle size={17} className='text-amber-600 dark:text-amber-400 shrink-0' />
            <span>Ditemukan {issueCount} baris data yang memerlukan verifikasi:</span>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-[11px]'>
            {summary.missingInBillingCount > 0 && (
              <div className='p-2.5 rounded-xl bg-background/80 border border-amber-200 dark:border-amber-900/50 space-y-0.5'>
                <p className='font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5'>
                  <IconUserExclamation size={14} />
                  {summary.missingInBillingCount} Karyawan Belum Terdaftar
                </p>
                <p className='text-muted-foreground'>
                  Karyawan ada di master HRIS tapi tidak ada di tagihan BPJS (cek pendaftaran e-Dabu).
                </p>
              </div>
            )}
            {summary.orphanBillingCount > 0 && (
              <div className='p-2.5 rounded-xl bg-background/80 border border-amber-200 dark:border-amber-900/50 space-y-0.5'>
                <p className='font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5'>
                  <IconUserX size={14} />
                  {summary.orphanBillingCount} Tagihan Tanpa Karyawan
                </p>
                <p className='text-muted-foreground'>
                  Ada di tagihan BPJS tapi tidak ada di payroll (karyawan resign belum dinonaktifkan).
                </p>
              </div>
            )}
            {summary.wageDiffCount > 0 && (
              <div className='p-2.5 rounded-xl bg-background/80 border border-amber-200 dark:border-amber-900/50 space-y-0.5'>
                <p className='font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5'>
                  <IconAlertTriangle size={14} />
                  {summary.wageDiffCount} Selisih Upah
                </p>
                <p className='text-muted-foreground'>
                  Upah di tagihan BPJS berbeda dengan gaji master / kenaikan upah belum diupdate di BPJS.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Filter & Table Card ────────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
        <div className='p-5 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative w-72'>
              <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Cari nama, NIK, Nopeg, No BPJS...'
                className='pl-9 h-9 text-xs bg-background rounded-xl'
              />
            </div>

            <div className='flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs'>
              <button
                type='button'
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'ALL'
                    ? 'bg-background text-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua ({rows.length})
              </button>
              <button
                type='button'
                onClick={() => setStatusFilter('ISSUES')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'ISSUES'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Perlu Perhatian ({issueCount})
              </button>
              <button
                type='button'
                onClick={() => setStatusFilter('MATCH')}
                className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                  statusFilter === 'MATCH'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Match ({summary.matchCount})
              </button>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground font-semibold'>
              Periode {periodLabel} · {filteredRows.length} baris
            </span>
            {onDownloadExcel && (
              <Button
                variant='outline'
                size='sm'
                onClick={onDownloadExcel}
                className='h-8.5 px-3 text-xs font-semibold rounded-xl gap-1.5'
              >
                <IconFileSpreadsheet size={15} />
                Download Rekonsiliasi Excel
              </Button>
            )}
          </div>
        </div>

        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Peserta / Karyawan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Project</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Upah Tagihan vs Payroll</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>1% Karyawan (Tagihan / Payroll)</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Kel. Tambahan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>4% Perusahaan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Total Tagihan</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Total di Payroll</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>Selisih (+/-)</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5 pr-6'>Status & Diagnosa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className='text-center py-10 text-xs text-muted-foreground'>
                    Tidak ada data rekonsiliasi yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((r) => (
                  <TableRow
                    key={r.id}
                    className={`text-xs border-b border-border/40 whitespace-nowrap transition-colors ${
                      r.status === 'MATCH'
                        ? 'hover:bg-muted/20'
                        : 'bg-amber-500/5 hover:bg-amber-500/10'
                    }`}
                  >
                    <TableCell className='py-3 pl-6'>
                      <div className='flex items-center gap-2'>
                        {r.status === 'MATCH' ? (
                          <IconCircleCheck size={16} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                        ) : r.status === 'ORPHAN_BILLING' ? (
                          <IconCircleX size={16} className='text-rose-600 dark:text-rose-400 shrink-0' />
                        ) : (
                          <IconAlertTriangle size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
                        )}
                        <div>
                          <p className='font-bold text-foreground'>{r.employeeName}</p>
                          <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                            {r.nopeg} · NIK: {r.nik} · BPJS: {r.bpjsNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className='py-3'>
                      <span className='font-medium text-foreground'>{r.project}</span>
                    </TableCell>

                    <TableCell className='py-3'>
                      <div className='space-y-0.5'>
                        <span className='font-semibold text-foreground'>{formatIDR(r.billingWage)}</span>
                        <p className='text-[10px] text-muted-foreground'>
                          Payroll: {formatIDR(r.payrollWage)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className='py-3'>
                      <div className='space-y-0.5'>
                        <span className='font-semibold text-rose-600 dark:text-rose-400'>
                          -{formatIDR(r.billingEmployee1Pct)}
                        </span>
                        <p className='text-[10px] text-muted-foreground'>
                          Payroll: -{formatIDR(r.payrollEmployee1Pct)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className='py-3'>
                      {r.billingFamilyExtra > 0 ? (
                        <span className='font-semibold text-rose-600 dark:text-rose-400'>
                          -{formatIDR(r.billingFamilyExtra)}
                        </span>
                      ) : (
                        <span className='text-muted-foreground/60'>-</span>
                      )}
                    </TableCell>

                    <TableCell className='py-3 text-muted-foreground font-medium'>
                      +{formatIDR(r.billingEmployer4Pct)}
                    </TableCell>

                    <TableCell className='py-3 font-semibold text-foreground'>
                      {formatIDR(r.billingTotal)}
                    </TableCell>

                    <TableCell className='py-3 font-semibold text-foreground'>
                      {formatIDR(r.payrollTotal)}
                    </TableCell>

                    <TableCell className='py-3'>
                      <span
                        className={`font-bold ${
                          r.totalDifference === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {r.totalDifference === 0
                          ? 'Rp 0'
                          : `${r.totalDifference > 0 ? '+' : ''}${formatIDR(r.totalDifference)}`}
                      </span>
                    </TableCell>

                    <TableCell className='py-3 pr-6'>
                      <div className='max-w-xs space-y-0.5'>
                        <Badge
                          variant={
                            r.status === 'MATCH'
                              ? 'emerald'
                              : r.status === 'ORPHAN_BILLING'
                                ? 'rose'
                                : 'amber'
                          }
                          className='text-[9px] px-1.5 py-0'
                        >
                          {r.statusLabel}
                        </Badge>
                        <p className='text-[10px] text-muted-foreground line-clamp-2' title={r.diagnosis}>
                          {r.diagnosis}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
