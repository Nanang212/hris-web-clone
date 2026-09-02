// src/features/payroll/pages/approval/disbursement-view.tsx — Screen 15: Payroll Approved & Disbursement
import {
  IconDownload,
  IconCheck,
  IconBuildingBank,
  IconFileSpreadsheet,
  IconSend,
} from '@tabler/icons-react'
import { useState } from 'react'
import { formatIDR, formatCompactIDR, initialPayslips } from '../../data/mock-payroll-data'
import { downloadBankBatchTransferFile } from '../../lib/payroll-download-helper'
import type { PayrollRun } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'

interface DisbursementViewProps {
  run: PayrollRun
  onMarkAsDisbursed: (runId: string) => void
}

export function DisbursementView({ run, onMarkAsDisbursed }: DisbursementViewProps) {
  const [bankFormat, setBankFormat] = useState<'bca' | 'mandiri' | 'generic'>('bca')
  const [isDisbursing, setIsDisbursing] = useState(false)

  const handleDownloadBatchFile = () => {
    try {
      const periodPayslips = initialPayslips.filter((p) => p.period === run.period || p.payrollRunId === run.id)
      const dataToExport = periodPayslips.length > 0 ? periodPayslips : initialPayslips
      downloadBankBatchTransferFile(run, dataToExport, bankFormat)
      snackbar.success(`File transfer batch (${bankFormat.toUpperCase()}) untuk periode ${run.period} berhasil diunduh.`)
    } catch {
      snackbar.error(`Gagal membuat file batch perbankan ${bankFormat.toUpperCase()}.`)
    }
  }

  const handleDisburse = () => {
    setIsDisbursing(true)
    setTimeout(() => {
      setIsDisbursing(false)
      onMarkAsDisbursed(run.id)
      snackbar.success(`Payroll batch ${run.period} successfully marked as Disbursed & Paid!`)
    }, 1000)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* ── 1. Approved Success Banner ──────────────────────────────────────── */}
      <div className='p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md'>
            <IconCheck size={26} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-base font-bold text-emerald-950 dark:text-emerald-300'>
                Payroll Approved & Ready for Disbursement
              </h3>
              <Badge variant='green' className='text-[10px] uppercase font-bold'>
                Ready
              </Badge>
            </div>
            <p className='text-xs text-emerald-900/80 dark:text-emerald-400/90 mt-0.5'>
              Periode: <b className='font-semibold'>{run.period}</b> · Approved by:{' '}
              <b>{run.approvedBy || 'Director of Finance'}</b>
            </p>
          </div>
        </div>

        <div className='text-right'>
          <p className='text-[11px] text-muted-foreground'>Total Net Payout</p>
          <b className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
            {formatIDR(run.totalNetDisbursement)}
          </b>
        </div>
      </div>

      {/* ── 2. Bank Transfer Batch File Generator ───────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>Generate Bank Batch Transfer File</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Ekspor file transfer massal sesuai format sistem perbankan perusahaan (MCM / KlikBCA Bisnis)
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              id: 'bca',
              title: 'BCA Corporate MCM',
              desc: 'Format CSV / TXT resmi KlikBCA Bisnis Auto-Transfer',
              icon: IconBuildingBank,
            },
            {
              id: 'mandiri',
              title: 'Mandiri MCM 2.0',
              desc: 'Format batch payroll Mandiri Cash Management',
              icon: IconBuildingBank,
            },
            {
              id: 'generic',
              title: 'Universal CSV / Excel',
              desc: 'Format spreadsheet standar serbaguna',
              icon: IconFileSpreadsheet,
            },
          ].map((item) => (
            <label
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                bankFormat === item.id
                  ? 'border-primary bg-primary/5 text-foreground shadow-xs'
                  : 'border-border/70 bg-background hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              <div className='flex items-center justify-between'>
                <item.icon size={22} className={bankFormat === item.id ? 'text-primary' : 'text-muted-foreground'} />
                <input
                  type='radio'
                  name='bankFormat'
                  checked={bankFormat === item.id}
                  onChange={() => setBankFormat(item.id as never)}
                  className='size-4 accent-primary'
                />
              </div>
              <div className='mt-3'>
                <h5 className='text-xs font-bold text-foreground'>{item.title}</h5>
                <p className='text-[10px] text-muted-foreground mt-0.5'>{item.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className='pt-2 flex justify-start'>
          <Button
            type='button'
            variant='outline'
            onClick={handleDownloadBatchFile}
            className='gap-1.5 h-9.5 text-xs font-semibold rounded-xl'
          >
            <IconDownload size={15} />
            Download {bankFormat.toUpperCase()} Batch File (.csv)
          </Button>
        </div>
      </div>

      {/* ── 3. Final Disbursement Action ───────────────────────────────────── */}
      <div className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h4 className='text-xs font-bold text-foreground'>Konfirmasi Pencairan Gaji</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Setelah transfer bank selesai, klik tombol di sebelah kanan untuk memperbarui status dan merilis slip gaji.
          </p>
        </div>

        <Button
          type='button'
          onClick={handleDisburse}
          disabled={isDisbursing || run.status === 'disbursed'}
          className='gap-1.5 h-9.5 px-6 text-xs font-semibold rounded-xl bg-primary shadow-xs'
        >
          <IconSend size={15} />
          {run.status === 'disbursed'
            ? 'Already Disbursed'
            : isDisbursing
              ? 'Processing...'
              : 'Mark as Disbursed & Publish Payslips'}
        </Button>
      </div>
    </div>
  )
}
