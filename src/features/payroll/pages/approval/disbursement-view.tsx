// src/features/payroll/pages/approval/disbursement-view.tsx — Screen 15: Payroll Approved & Disbursement
import {
  IconDownload,
  IconCheck,
  IconBuildingBank,
  IconFileSpreadsheet,
  IconSend,
} from '@tabler/icons-react'
import { useState } from 'react'
import { formatIDR } from '../../data/mock-payroll-data'
import { usePayrollRunStore } from '../../store/payroll-run-store'
import { detailToPayslip } from '../../lib/payroll-payslip-helper'
import { downloadBankBatchTransferFile } from '../../lib/payroll-download-helper'
import type { PayrollRun } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertAction, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { FieldLabel } from '@/shared/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group'
import { snackbar } from '@/shared/lib/snackbar'

interface DisbursementViewProps {
  run: PayrollRun
  onMarkAsDisbursed: (runId: string) => void
}

export function DisbursementView({ run, onMarkAsDisbursed }: DisbursementViewProps) {
  const [bankFormat, setBankFormat] = useState<'bca' | 'mandiri' | 'generic'>('bca')
  const [isDisbursing, setIsDisbursing] = useState(false)
  const result = usePayrollRunStore((state) => state.resultsByRunId[run.id])
  const ready = Boolean(result?.details.length && !result.dirtyEmployeeIds?.length && !run.specialPeriodsPending && (run.status === 'approved' || run.status === 'disbursed'))

  const handleDownloadBatchFile = () => {
    try {
      if (!ready || !result) {
        snackbar.error(m.payroll_revision_no_results())
        return
      }
      const dataToExport = result.details.map((detail) => detailToPayslip(detail, run.id, run.period, run.paymentDate))
      downloadBankBatchTransferFile(run, dataToExport, bankFormat)
      snackbar.success(m.payroll_disbursement_download_success({format: bankFormat.toUpperCase(), period: run.period}))
    } catch {
      snackbar.error(m.payroll_disbursement_download_error({format: bankFormat.toUpperCase()}))
    }
  }

  const handleDisburse = () => {
    if (!ready || run.status !== 'approved') {
      snackbar.error(m.payroll_revision_no_results())
      return
    }
    setIsDisbursing(true)
    setTimeout(() => {
      setIsDisbursing(false)
      onMarkAsDisbursed(run.id)
      snackbar.success(m.payroll_disbursement_mark_success({period: run.period}))
    }, 1000)
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* ── 1. Approved Success Banner ──────────────────────────────────────── */}
      <Alert variant='success' className='flex-wrap items-start'>
          <AlertIcon><IconCheck /></AlertIcon>
          <div className='flex min-w-0 flex-1 flex-col gap-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <AlertTitle>
                {m.payroll_disbursement_ready_title()}
              </AlertTitle>
              <Badge variant='green' className='text-[10px] uppercase font-bold'>
                {m.payroll_disbursement_ready_badge()}
              </Badge>
            </div>
            <AlertDescription>
              {m.payroll_attendance_period()}: <b className='font-semibold'>{run.period}</b> · {m.payroll_disbursement_approved_by()}: {' '}
              <b>{run.approvedBy || m.payroll_disbursement_approver_role()}</b>
            </AlertDescription>
          </div>

        <AlertAction className='max-w-full text-right'>
          <p className='text-[11px] text-muted-foreground'>{m.payroll_disbursement_total_payout()}</p>
          <b className='text-lg font-bold text-emerald-600 dark:text-emerald-400'>
            {formatIDR(run.totalNetDisbursement)}
          </b>
        </AlertAction>
      </Alert>

      {/* ── 2. Bank Transfer Batch File Generator ───────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>{m.payroll_disbursement_bank_file_title()}</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_disbursement_bank_file_description()}
          </p>
        </div>

        <RadioGroup value={bankFormat} onValueChange={(value) => setBankFormat(value as typeof bankFormat)} className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            {
              id: 'bca',
              title: 'BCA Corporate MCM',
              desc: m.payroll_disbursement_bca_description(),
              icon: IconBuildingBank,
            },
            {
              id: 'mandiri',
              title: 'Mandiri MCM 2.0',
              desc: m.payroll_disbursement_mandiri_description(),
              icon: IconBuildingBank,
            },
            {
              id: 'generic',
              title: m.payroll_disbursement_generic_title(),
              desc: m.payroll_disbursement_generic_description(),
              icon: IconFileSpreadsheet,
            },
          ].map((item) => (
            <FieldLabel
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                bankFormat === item.id
                  ? 'border-primary bg-primary/5 text-foreground shadow-xs'
                  : 'border-border/70 bg-background hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              <div className='flex items-center justify-between'>
                <item.icon size={22} className={bankFormat === item.id ? 'text-primary' : 'text-muted-foreground'} />
                <RadioGroupItem value={item.id} />
              </div>
              <div className='mt-3'>
                <h5 className='text-xs font-bold text-foreground'>{item.title}</h5>
                <p className='text-[10px] text-muted-foreground mt-0.5'>{item.desc}</p>
              </div>
            </FieldLabel>
          ))}
        </RadioGroup>

        <div className='pt-2 flex justify-start'>
          <Button
            type='button'
            variant='outline'
            onClick={handleDownloadBatchFile}
            className='gap-1.5 h-9.5 text-xs font-semibold rounded-xl'
          >
            <IconDownload size={15} />
            {m.payroll_disbursement_download_button({format: bankFormat.toUpperCase()})}
          </Button>
        </div>
      </div>

      {/* ── 3. Final Disbursement Action ───────────────────────────────────── */}
      <div className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h4 className='text-xs font-bold text-foreground'>{m.payroll_disbursement_confirm_title()}</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_disbursement_confirm_description()}
          </p>
        </div>

        <Button
          type='button'
          onClick={handleDisburse}
          disabled={isDisbursing || run.status === 'disbursed' || !ready}
          className='gap-1.5 h-9.5 px-6 text-xs font-semibold rounded-xl bg-primary shadow-xs'
        >
          <IconSend size={15} />
          {run.status === 'disbursed'
            ? m.payroll_disbursement_already_done()
            : isDisbursing
              ? m.payroll_confirmation_processing()
              : m.payroll_disbursement_mark_button()}
        </Button>
      </div>
    </div>
  )
}
