// src/features/payroll/pages/approval/finance-approval-view.tsx — Screen 14: Finance Approval Checklist & Sign-off
import {
  IconCheck,
  IconShieldCheck,
  IconClock,
  IconUserCheck,
  IconFileInvoice,
} from '@tabler/icons-react'
import { useState } from 'react'
import { formatIDR } from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { snackbar } from '@/shared/lib/snackbar'

interface FinanceApprovalViewProps {
  run: PayrollRun
  onApprove: (runId: string) => void
  onRequestRevision: (runId: string) => void
}

export function FinanceApprovalView({
  run,
  onApprove,
  onRequestRevision,
}: FinanceApprovalViewProps) {
  const [checklist, setChecklist] = useState({
    attendanceVerified: true,
    overtimeApproved: true,
    taxCalculationsAccurate: true,
    bankAccountsActive: true,
    budgetAvailable: true,
  })

  const [approvalNotes, setApprovalNotes] = useState('Semua komponen gaji, pajak PPh 21, dan BPJS telah diverifikasi.')

  const allChecked = Object.values(checklist).every(Boolean)

  const handleApprove = () => {
    onApprove(run.id)
    snackbar.success(`Payroll batch ${run.period} successfully approved by Finance!`)
  }

  const handleRevision = () => {
    onRequestRevision(run.id)
    snackbar.info('Revision requested. Returned to HR.')
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* ── 1. Approval Stage Banner ───────────────────────────────────────── */}
      <div className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400'>
            <IconClock size={24} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold text-foreground'>Finance Approval Stage</h3>
              <span className='px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold'>
                Stage 2 of 3
              </span>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Payroll Period: <b className='text-foreground'>{run.period}</b> · Total Disbursement:{' '}
              <b className='text-emerald-600 dark:text-emerald-400'>{formatIDR(run.totalNetDisbursement)}</b>
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>Submitted by:</span>
          <span className='font-semibold text-foreground flex items-center gap-1'>
            <IconUserCheck size={14} className='text-primary' />
            HR Payroll Lead
          </span>
        </div>
      </div>

      {/* ── 2. Verification Checklist ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>Finance Compliance & Verification Checklist</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Pastikan seluruh poin verifikasi di bawah telah diperiksa sebelum memberikan persetujuan final
          </p>
        </div>

        <div className='space-y-3'>
          {[
            {
              key: 'attendanceVerified',
              title: 'Presensi & Cuti Terverifikasi',
              desc: 'Data kehadiran, keterlambatan, dan unpaid leave sudah sesuai dengan log mesin absen.',
            },
            {
              key: 'overtimeApproved',
              title: 'Persetujuan Upah Lembur Valid',
              desc: 'Seluruh jam lembur telah memiliki Surat Perintah Kerja Lembur (SPKL) bertandatangan.',
            },
            {
              key: 'taxCalculationsAccurate',
              title: 'PPh 21 TER & BPJS Akurat',
              desc: 'Kategori TER dan pemotongan iuran BPJS Kesehatan & Ketenagakerjaan telah lolos audit formula.',
            },
            {
              key: 'bankAccountsActive',
              title: 'Rekening Bank Karyawan Aktif',
              desc: 'Tidak ada rekening bank karyawan yang tertolak / status inaktif pada sistem perbankan.',
            },
            {
              key: 'budgetAvailable',
              title: 'Ketersediaan Anggaran Kas (Cashflow)',
              desc: 'Dana kas payroll pada rekening operasional perusahaan mencukupi untuk batch transfer.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className='p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/30 flex items-start gap-3 cursor-pointer transition-colors'
            >
              <input
                type='checkbox'
                checked={checklist[item.key as keyof typeof checklist]}
                onChange={(e) =>
                  setChecklist((prev) => ({
                    ...prev,
                    [item.key]: e.target.checked,
                  }))
                }
                className='mt-1 size-4 accent-primary rounded'
              />
              <div>
                <h5 className='text-xs font-bold text-foreground'>{item.title}</h5>
                <p className='text-[11px] text-muted-foreground mt-0.5 leading-relaxed'>{item.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Approval Notes */}
        <div className='space-y-1.5 pt-2'>
          <label className='text-xs font-semibold text-foreground'>Finance Approval Notes / Comments</label>
          <Input
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder='Catatan persetujuan...'
            className='h-10 text-xs bg-background rounded-xl'
          />
        </div>

        {/* Action Buttons */}
        <div className='pt-5 border-t border-border/70 flex items-center justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={handleRevision}
            className='h-9.5 px-5 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-xl'
          >
            Request Revision
          </Button>

          <Button
            type='button'
            onClick={handleApprove}
            disabled={!allChecked}
            className='gap-1.5 h-9.5 px-6 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          >
            <IconShieldCheck size={16} />
            Approve Payroll Batch
          </Button>
        </div>
      </div>
    </div>
  )
}
