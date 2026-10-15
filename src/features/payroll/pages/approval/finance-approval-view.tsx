// src/features/payroll/pages/approval/finance-approval-view.tsx — Screen 14: Finance Approval Checklist & Sign-off
import {
  IconShieldCheck,
  IconClock,
  IconUserCheck,
} from '@tabler/icons-react'
import { useState } from 'react'
import { formatIDR } from '../../data/mock-payroll-data'
import type { PayrollRun } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { FieldLabel } from '@/shared/components/ui/field'
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

  const [approvalNotes, setApprovalNotes] = useState(m.payroll_finance_default_notes())

  const allChecked = Object.values(checklist).every(Boolean)

  const handleApprove = () => {
    onApprove(run.id)
    snackbar.success(m.payroll_finance_approve_success({period: run.period}))
  }

  const handleRevision = () => {
    onRequestRevision(run.id)
    snackbar.info(m.payroll_finance_revision_success())
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
              <h3 className='text-sm font-bold text-foreground'>{m.payroll_finance_stage_title()}</h3>
              <Badge variant='amber'>{m.payroll_finance_stage_number()}</Badge>
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_finance_period_label()}: <b className='text-foreground'>{run.period}</b> · {m.payroll_finance_disbursement_label()}:{' '}
              <b className='text-emerald-600 dark:text-emerald-400'>{formatIDR(run.totalNetDisbursement)}</b>
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>{m.payroll_finance_submitted_by()}</span>
          <span className='font-semibold text-foreground flex items-center gap-1'>
            <IconUserCheck size={14} className='text-primary' />
            {m.payroll_finance_submitter_role()}
          </span>
        </div>
      </div>

      {/* ── 2. Verification Checklist ──────────────────────────────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div>
          <h4 className='text-sm font-bold text-foreground'>{m.payroll_finance_checklist_title()}</h4>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {m.payroll_finance_checklist_description()}
          </p>
        </div>

        <div className='space-y-3'>
          {[
            {
              key: 'attendanceVerified',
              title: m.payroll_finance_attendance_title(),
              desc: m.payroll_finance_attendance_description(),
            },
            {
              key: 'overtimeApproved',
              title: m.payroll_finance_overtime_title(),
              desc: m.payroll_finance_overtime_description(),
            },
            {
              key: 'taxCalculationsAccurate',
              title: m.payroll_finance_tax_title(),
              desc: m.payroll_finance_tax_description(),
            },
            {
              key: 'bankAccountsActive',
              title: m.payroll_finance_bank_title(),
              desc: m.payroll_finance_bank_description(),
            },
            {
              key: 'budgetAvailable',
              title: m.payroll_finance_budget_title(),
              desc: m.payroll_finance_budget_description(),
            },
          ].map((item) => (
            <FieldLabel
              key={item.key}
              className='p-3.5 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/30 flex items-start gap-3 cursor-pointer transition-colors'
            >
              <Checkbox
                checked={checklist[item.key as keyof typeof checklist]}
                onCheckedChange={(checked) =>
                  setChecklist((prev) => ({
                    ...prev,
                    [item.key]: checked === true,
                  }))
                }
                className='mt-1'
              />
              <div>
                <h5 className='text-xs font-bold text-foreground'>{item.title}</h5>
                <p className='text-[11px] text-muted-foreground mt-0.5 leading-relaxed'>{item.desc}</p>
              </div>
            </FieldLabel>
          ))}
        </div>

        {/* Approval Notes */}
        <div className='space-y-1.5 pt-2'>
          <FieldLabel className='text-xs font-semibold text-foreground'>{m.payroll_finance_notes_label()}</FieldLabel>
          <Input
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder={m.payroll_finance_notes_placeholder()}
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
            {m.payroll_finance_revision_button()}
          </Button>

          <Button
            type='button'
            onClick={handleApprove}
            disabled={!allChecked}
            className='gap-1.5 h-9.5 px-6 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          >
            <IconShieldCheck size={16} />
            {m.payroll_finance_approve_button()}
          </Button>
        </div>
      </div>
    </div>
  )
}
