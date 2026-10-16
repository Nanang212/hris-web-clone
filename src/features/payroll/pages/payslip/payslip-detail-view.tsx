// src/features/payroll/pages/payslip/payslip-detail-view.tsx — Screen 17: Official Payslip Document View & Print
import {
  IconDownload,
  IconPrinter,
  IconArrowLeft,
  IconMail,
  IconQrcode,
  IconBuildingCommunity,
} from '@tabler/icons-react'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import { formatIDR } from '../../data/mock-payroll-data'
import { downloadPayslipPdf } from '../../lib/payroll-download-helper'
import type { PayslipRecord } from '../../types'
import { m } from '@/i18n/paraglide/messages'
import { Button } from '@/shared/components/ui/button'
import { snackbar } from '@/shared/lib/snackbar'

interface PayslipDetailViewProps {
  payslip: PayslipRecord
  onBack: () => void
}

export function PayslipDetailView({ payslip, onBack }: PayslipDetailViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = () => {
    try {
      downloadPayslipPdf(payslip)
      snackbar.success(m.payroll_payslip_detail_download_success({name: payslip.employeeName, period: payslip.period}))
    } catch {
      snackbar.error(m.payroll_payslip_detail_download_error())
    }
  }

  const handleSendEmail = () => {
    snackbar.success(m.payroll_payslip_detail_email_success({name: payslip.employeeName}))
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* ── Top Actions Bar (Hidden on Print) ──────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4 print:hidden'>
        <Button
          variant='outline'
          size='sm'
          onClick={onBack}
          className='gap-1.5 text-xs font-semibold rounded-xl'
        >
          <IconArrowLeft size={16} />
          {m.payroll_payslip_detail_back()}
        </Button>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleSendEmail}
            className='gap-1.5 text-xs font-semibold rounded-xl'
          >
            <IconMail size={15} />
            {m.payroll_payslip_detail_email_button()}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={handlePrint}
            className='gap-1.5 text-xs font-semibold rounded-xl'
          >
            <IconPrinter size={15} />
            {m.payroll_payslip_detail_print_button()}
          </Button>

          <Button
            size='sm'
            onClick={handleDownloadPdf}
            className='gap-1.5 text-xs font-semibold rounded-xl shadow-xs'
          >
            <IconDownload size={15} />
            {m.payroll_payslip_download_pdf()}
          </Button>
        </div>
      </div>

      {/* ── Official Printable Payslip Document Card ──────────────────────── */}
      <div className='rounded-3xl border border-border/80 bg-card p-8 md:p-10 shadow-lg print:border-none print:shadow-none print:p-0 space-y-8'>
        {/* Document Header */}
        <div className='flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-border/70'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <IconBuildingCommunity size={18} />
              </div>
              <h2 className='text-lg font-bold text-foreground tracking-tight'>
                PT ANTIGRAVITY NUSANTARA
              </h2>
            </div>
            <p className='text-xs text-muted-foreground'>
              Sudirman Central Business District (SCBD), Tower 2 Lt. 18, Jakarta Selatan 12190
            </p>
            <p className='text-xs text-muted-foreground'>
              NPWP: 01.829.471.2-014.000 · Telp: (021) 5299-8800
            </p>
          </div>

          <div className='text-right space-y-1'>
            <h3 className='text-sm font-bold uppercase tracking-wider text-primary'>
              {m.payroll_payslip_detail_document_title()}
            </h3>
            <p className='text-xs font-bold text-foreground'>
              {m.payroll_attendance_period()}: {payslip.period}
            </p>
            <p className='text-[11px] text-muted-foreground font-mono'>
              {m.payroll_payslip_detail_number()}: {payslip.payslipNumber}
            </p>
            <div className='pt-1 flex justify-end'>
              <PayrollStatusBadge status={payslip.status} />
            </div>
          </div>
        </div>

        {/* Employee Profile Grid */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-muted/20 border border-border/60 text-xs'>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_attendance_col_employee()}</span>
            <p className='font-bold text-foreground mt-0.5'>{payslip.employeeName}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_payslip_detail_employee_id()}</span>
            <p className='font-bold text-foreground font-mono mt-0.5'>{payslip.employeeCode}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_approval_col_department()}</span>
            <p className='font-bold text-foreground mt-0.5'>{payslip.department}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_payslip_detail_position_grade()}</span>
            <p className='font-bold text-foreground mt-0.5'>{payslip.position}</p>
          </div>

          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_payslip_detail_ptkp()}</span>
            <p className='font-bold text-foreground mt-0.5'>{payslip.ptkpStatus}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_payslip_detail_npwp()}</span>
            <p className='font-mono font-medium text-foreground mt-0.5'>{payslip.npwp}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_payslip_detail_bank_account()}</span>
            <p className='font-medium text-foreground mt-0.5'>{payslip.bankName} - {payslip.bankAccountNumber}</p>
          </div>
          <div>
            <span className='text-[11px] text-muted-foreground'>{m.payroll_process_col_pay_date()}</span>
            <p className='font-semibold text-foreground mt-0.5'>{payslip.paymentDate}</p>
          </div>
        </div>

        {/* Financial Breakdown (Earnings vs Deductions) */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* Earnings Column */}
          <div className='space-y-4'>
            <div className='pb-2 border-b border-border/70 flex items-center justify-between'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                {m.payroll_payslip_detail_earnings_title()}
              </h4>
              <span className='text-[11px] font-bold text-muted-foreground'>{m.payroll_payslip_detail_amount()}</span>
            </div>

            <div className='space-y-2.5 text-xs'>
              {payslip.earnings.map((e) => (
                <div key={e.name} className='flex justify-between text-muted-foreground'>
                  <span>{e.name}</span>
                  <span className='font-semibold text-foreground'>{formatIDR(e.amount)}</span>
                </div>
              ))}
            </div>

            <div className='pt-3 border-t border-border/60 flex justify-between text-xs font-bold text-foreground'>
              <span>{m.payroll_payslip_detail_gross_total()}</span>
              <span className='text-emerald-600 dark:text-emerald-400'>{formatIDR(payslip.totalEarnings)}</span>
            </div>
          </div>

          {/* Deductions Column */}
          <div className='space-y-4'>
            <div className='pb-2 border-b border-border/70 flex items-center justify-between'>
              <h4 className='text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400'>
                {m.payroll_payslip_detail_deductions_title()}
              </h4>
              <span className='text-[11px] font-bold text-muted-foreground'>{m.payroll_payslip_detail_amount()}</span>
            </div>

            <div className='space-y-2.5 text-xs'>
              {payslip.deductions.map((d) => (
                <div key={d.name} className='flex justify-between text-muted-foreground'>
                  <span>{d.name}</span>
                  <span className='font-semibold text-rose-600 dark:text-rose-400'>-{formatIDR(d.amount)}</span>
                </div>
              ))}
            </div>

            <div className='pt-3 border-t border-border/60 flex justify-between text-xs font-bold text-foreground'>
              <span>{m.payroll_payslip_detail_deductions_total()}</span>
              <span className='text-rose-600 dark:text-rose-400'>-{formatIDR(payslip.totalDeductions)}</span>
            </div>
          </div>
        </div>

        {/* Total Take Home Pay Banner */}
        <div className='p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <span className='text-xs font-bold text-primary uppercase tracking-wider'>
              {m.payroll_payslip_detail_net_pay()}
            </span>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_payslip_detail_transfer_account({bank: payslip.bankName, account: payslip.bankAccountNumber})}
            </p>
          </div>
          <b className='text-2xl font-black text-primary tracking-tight'>
            {formatIDR(payslip.netPay)}
          </b>
        </div>

        {/* Footer Signature & Verification */}
        <div className='pt-8 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs'>
          <div className='flex items-center gap-3.5 p-4 rounded-xl border border-border/60 bg-muted/10'>
            <div className='p-2 rounded-lg bg-background border border-border/80'>
              <IconQrcode size={36} className='text-foreground' />
            </div>
            <div>
              <p className='font-bold text-foreground'>{m.payroll_payslip_detail_digital_verification()}</p>
              <p className='text-[10px] text-muted-foreground leading-relaxed'>
                {m.payroll_payslip_detail_digital_notice()}
              </p>
            </div>
          </div>

          <div className='text-right space-y-1 flex flex-col justify-end'>
            <p className='text-muted-foreground'>Jakarta, {payslip.paymentDate}</p>
            <p className='font-bold text-foreground pt-4'>{m.payroll_payslip_detail_division()}</p>
            <p className='text-[11px] text-muted-foreground'>PT Antigravity Nusantara</p>
          </div>
        </div>
      </div>
    </div>
  )
}
