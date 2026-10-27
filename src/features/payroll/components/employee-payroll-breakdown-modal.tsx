// src/features/payroll/components/employee-payroll-breakdown-modal.tsx
// Modal rincian payroll per karyawan dengan layout 2-kolom bersih & modern:
// Kiri: Pendapatan Kotor (Gaji Pokok, Tunjangan Tetap & Variabel, Lembur)
// Kanan: Seluruh Potongan Gaji (BPJS Kes 1% + Keluarga, BPJS TK JHT & JP, PPh 21, Presensi, THR)
// Bawah: Tanggungan Perusahaan Non-THP (BPJS Kes 4%, JKK, JKM, JHT 3.7%, JP 2%)

import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCalculator,
  IconCash,
  IconReceipt,
  IconShieldCheck,
} from '@tabler/icons-react'
import type { EmployeePayrollDetail } from '../types'
import { formatIDR } from '../data/mock-payroll-data'
import { buildPayrollBreakdown } from '../lib/payroll-breakdown'
import { PayrollComponentParameterSummary } from './payroll-component-parameter-summary'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { m } from '@/i18n/paraglide/messages'

interface EmployeePayrollBreakdownModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: EmployeePayrollDetail | null
}

export function EmployeePayrollBreakdownModal({
  open,
  onOpenChange,
  detail,
}: EmployeePayrollBreakdownModalProps) {
  if (!detail) return null

  const {
    usesSystemComponents, baseSalaryLine, fixedLines, variableLines, employeeDeductionLines,
    nonCashLines, healthBaseDeduction, familyDeduction, jhtEmployeeDeduction, jpEmployeeDeduction,
    employeeTaxDeduction, thrDeduction, companyHealthAmount, companyJkkAmount, companyJkmAmount,
    companyJhtAmount, companyJpAmount, companyTkTotal, nonCashTotal,
  } = buildPayrollBreakdown(detail)
  const formatDeduction = (amount: number) => `${amount < 0 ? '+' : '−'}${formatIDR(Math.abs(amount))}`

  // Inisial nama untuk avatar
  const initials = detail.employeeName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-3xl p-0 shadow-2xl sm:max-w-4xl lg:max-w-5xl'>
        {/* ── 1. Header Informasi Karyawan & Take Home Pay ────────────────── */}
        <DialogHeader className='shrink-0 border-b border-border/70 bg-muted/20 p-6 pr-14 pb-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex items-start gap-3.5'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-base font-bold text-primary-foreground shadow-xs'>
                {initials}
              </div>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <DialogTitle className='text-lg font-bold text-foreground'>
                    {detail.employeeName}
                  </DialogTitle>
                  <Badge variant='outline' className='font-mono text-[10px] font-semibold'>
                    {detail.employeeCode}
                  </Badge>
                  <Badge variant='blue' className='text-[10px] font-semibold'>
                    PTKP: {detail.ptkpStatus}
                  </Badge>
                  <Badge
                    variant={detail.status === 'paid' ? 'emerald' : 'secondary'}
                    className='text-[10px] font-bold tracking-wider uppercase'
                  >
                    {detail.status}
                  </Badge>
                </div>
                <DialogDescription className='flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground'>
                  <span>
                    <b>{m.payroll_breakdown_position()}</b> {detail.position}
                  </span>
                  <span>·</span>
                  <span>
                    <b>{m.payroll_breakdown_department()}</b> {detail.department}
                  </span>
                  <span>·</span>
                  <span>
                    <b>{m.payroll_breakdown_project()}</b>{' '}
                    {detail.project || m.payroll_breakdown_headquarters()}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {/* Highlighted Take Home Pay Hero Card */}
            <div className='min-w-[220px] rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 px-5 text-right shadow-xs dark:bg-emerald-950/40'>
              <span className='block text-[10px] font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-300'>
                {m.payroll_breakdown_take_home_pay()}
              </span>
              <p className='mt-0.5 font-mono text-xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400'>
                {formatIDR(detail.netTakeHomePay)}
              </p>
              <div className='mt-0.5 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground'>
                <IconBuildingBank size={12} />
                <span>
                  {detail.bankName} · {detail.bankAccountNumber}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── 2. Scrollable Body: 2 Kolom (Pendapatan vs Potongan) ──────────── */}
        <ScrollArea className='min-h-0 flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-5 p-6'>
            {/* Warning / Catatan Khusus */}
            {detail.warnings && detail.warnings.length > 0 && (
              <Alert variant='warning' className='items-start'>
                <AlertIcon><IconAlertTriangle /></AlertIcon>
                <div className='flex min-w-0 flex-1 flex-col gap-1.5'>
                  <AlertTitle>{m.payroll_breakdown_warnings()}</AlertTitle>
                  <AlertDescription>
                    <ul className='flex list-disc flex-col gap-0.5 pl-5'>
                      {detail.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Grid 2 Kolom: Kiri Pendapatan (Gross) | Kanan Seluruh Potongan */}
            <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-2'>
              {/* ══ KOLOM KIRI: PENDAPATAN (EARNINGS) ══ */}
              <div className='overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs'>
                <div className='flex items-center justify-between border-b border-border/60 bg-muted/40 p-3.5 px-4'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-lg bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400'>
                      <IconCash size={16} />
                    </span>
                    <span className='text-xs font-bold text-foreground'>
                      {m.payroll_breakdown_earnings_title()}
                    </span>
                  </div>
                  <b className='font-mono text-xs font-bold text-foreground'>
                    {formatIDR(detail.totalGross)}
                  </b>
                </div>

                <div className='space-y-2.5 divide-y divide-border/40 p-4 text-xs'>
                  {/* Gaji Pokok */}
                  {baseSalaryLine && <div className='flex items-center justify-between gap-3 pt-1'>
                    <div>
                      <p className='font-semibold text-foreground'>
                        {m.payroll_breakdown_base_salary()}
                      </p>
                      <span className='text-[10px] text-muted-foreground'>
                        {m.payroll_breakdown_monthly_master()}
                      </span>
                      {usesSystemComponents && <PayrollComponentParameterSummary line={baseSalaryLine} />}
                    </div>
                    <span className='font-mono font-bold text-foreground'>
                      {formatIDR(baseSalaryLine.amount)}
                    </span>
                  </div>}

                  {/* Tunjangan Tetap */}
                  {fixedLines.map((line, idx) => (
                    <div key={`fixed-${idx}`} className='flex items-center justify-between pt-2'>
                      <div>
                        <p className='font-medium text-foreground'>{line.name}</p>
                        <Badge variant='outline' className='mt-0.5 px-1 py-0 text-[9px]'>
                          {line.source === 'system' ? m.payroll_breakdown_system_component() : m.payroll_breakdown_fixed_allowance()}
                        </Badge>
                        {usesSystemComponents && <PayrollComponentParameterSummary line={line} />}
                      </div>
                      <span className='font-mono font-semibold text-foreground'>
                        {formatIDR(line.amount)}
                      </span>
                    </div>
                  ))}

                  {/* Tunjangan Variabel & Presensi */}
                  {variableLines.map((line, idx) => (
                    <div key={`var-${idx}`} className='flex items-center justify-between pt-2'>
                      <div>
                        <p className='font-medium text-foreground'>{line.name}</p>
                        <Badge variant='blue' className='mt-0.5 px-1 py-0 text-[9px]'>
                          {m.payroll_breakdown_variable()}
                        </Badge>
                        {usesSystemComponents && <PayrollComponentParameterSummary line={line} />}
                      </div>
                      <span className='font-mono font-semibold text-foreground'>
                        {formatIDR(line.amount)}
                      </span>
                    </div>
                  ))}

                  {/* Upah Lembur jika ada dan belum masuk lines */}
                  {!usesSystemComponents && detail.overtimePay > 0 &&
                    !variableLines.some(
                      (l) => l.componentKind === 'overtime' || l.code === 'OVERTIME',
                    ) && (
                      <div className='flex items-center justify-between pt-2'>
                        <div>
                          <p className='font-medium text-foreground'>
                            {m.payroll_breakdown_overtime({ hours: detail.overtimeHours })}
                          </p>
                          <span className='text-[10px] text-muted-foreground'>
                            {m.payroll_breakdown_from_attendance()}
                          </span>
                        </div>
                        <span className='font-mono font-semibold text-foreground'>
                          {formatIDR(detail.overtimePay)}
                        </span>
                      </div>
                    )}
                </div>

                <div className='flex items-center justify-between border-t border-border/60 bg-muted/20 p-3 text-xs'>
                  <span className='font-semibold text-muted-foreground'>
                    {m.payroll_breakdown_total_gross()}
                  </span>
                  <span className='font-mono font-bold text-foreground'>
                    {formatIDR(detail.totalGross)}
                  </span>
                </div>
              </div>

              {/* ══ KOLOM KANAN: POTONGAN DARI GAJI (DEDUCTIONS) ══ */}
              <div className='overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xs'>
                <div className='flex items-center justify-between border-b border-border/60 bg-muted/40 p-3.5 px-4'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-lg bg-rose-500/10 p-1 text-rose-600 dark:text-rose-400'>
                      <IconReceipt size={16} />
                    </span>
                    <span className='text-xs font-bold text-foreground'>
                      {m.payroll_breakdown_deductions_title()}
                    </span>
                  </div>
                  <b className='font-mono text-xs font-bold text-rose-600 dark:text-rose-400'>
                    {formatDeduction(detail.totalDeductions)}
                  </b>
                </div>

                <div className='space-y-3 divide-y divide-border/40 p-4 text-xs'>
                  {/* 2.1 BPJS Kesehatan Karyawan */}
                  <div className='space-y-1.5 pt-1'>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-foreground'>
                        {m.payroll_breakdown_health_employee()}
                      </span>
                      <Badge
                        variant={
                          detail.bpjsKesSource === 'billing'
                            ? 'emerald'
                            : detail.bpjsKesSource === 'calculated'
                              ? 'blue'
                              : 'amber'
                        }
                        className='px-1.5 py-0 text-[9px]'
                      >
                        {detail.bpjsKesSource === 'billing'
                          ? m.payroll_breakdown_uploaded_bill()
                          : detail.bpjsKesSource === 'calculated'
                            ? m.payroll_breakdown_calculated_salary()
                            : m.payroll_breakdown_no_bill()}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between pl-2 text-muted-foreground'>
                      <span>{m.payroll_breakdown_health_employee_rate()}</span>
                      <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                        {formatDeduction(healthBaseDeduction)}
                      </span>
                    </div>
                    {familyDeduction > 0 ? (
                      <div className='flex items-center justify-between pl-2 text-muted-foreground'>
                        <span>{m.payroll_breakdown_extra_family()}</span>
                        <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                          {formatDeduction(familyDeduction)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* 2.2 BPJS Ketenagakerjaan Karyawan */}
                  <div className='space-y-1.5 pt-2.5'>
                    <span className='block font-bold text-foreground'>
                      {m.payroll_breakdown_employment_employee()}
                    </span>
                    <div className='flex items-center justify-between pl-2 text-muted-foreground'>
                      <span>{m.payroll_breakdown_jht_employee()}</span>
                      <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                        {formatDeduction(jhtEmployeeDeduction)}
                      </span>
                    </div>
                    <div className='flex items-center justify-between pl-2 text-muted-foreground'>
                      <span>{m.payroll_breakdown_jp_employee()}</span>
                      <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                        {formatDeduction(jpEmployeeDeduction)}
                      </span>
                    </div>
                  </div>

                  {/* 2.3 Pajak PPh 21 */}
                  <div className='space-y-1.5 pt-2.5'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='font-bold text-foreground'>
                          {m.payroll_breakdown_monthly_tax()}
                        </span>
                        <span className='block text-[10px] text-muted-foreground'>
                          {m.payroll_breakdown_taxable_gross({
                            amount: formatIDR(detail.taxableIncome ?? 0),
                          })}
                        </span>
                        {usesSystemComponents && (
                          <span className='block text-[10px] text-muted-foreground'>
                            {m.payroll_breakdown_tax_liability({ amount: formatIDR(detail.pph21Tax) })}
                          </span>
                        )}
                      </div>
                      <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                        {formatDeduction(employeeTaxDeduction)}
                      </span>
                    </div>

                    {detail.finalTaxReconciliation && (
                      <div className='flex flex-col gap-1 rounded-md border p-2 text-[10px] text-muted-foreground'>
                        <div className='flex justify-between gap-3'>
                          <span>{m.payroll_breakdown_cumulative_gross()}</span>
                          <span>
                            {formatIDR(detail.finalTaxReconciliation.cumulativeTaxableGross)}
                          </span>
                        </div>
                        <div className='flex justify-between gap-3'>
                          <span>{m.payroll_breakdown_annual_pkp()}</span>
                          <span>{formatIDR(detail.finalTaxReconciliation.taxableIncomePkp)}</span>
                        </div>
                        <div className='flex justify-between gap-3'>
                          <span>{m.payroll_breakdown_annual_tax_minus_paid()}</span>
                          <span>
                            {formatIDR(detail.finalTaxReconciliation.annualPph21)} −{' '}
                            {formatIDR(detail.finalTaxReconciliation.priorPph21Paid)}
                          </span>
                        </div>
                      </div>
                    )}

                    {thrDeduction !== 0 ? (
                      <div className='flex items-center justify-between pl-2 text-muted-foreground'>
                        <span>
                          {m.payroll_breakdown_thr_installment({
                            current: detail.thrTaxInstallmentInfo?.currentInstallmentMonth || 1,
                            total: detail.thrTaxInstallmentInfo?.tenorMonths || 3,
                          })}
                        </span>
                        <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                          {formatDeduction(thrDeduction)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* 2.4 Potongan Presensi & Lainnya */}
                  {employeeDeductionLines.length > 0 && (
                    <div className='space-y-1.5 pt-2.5'>
                      <span className='block font-bold text-foreground'>
                        {m.payroll_breakdown_dynamic_deductions()}
                      </span>
                      {employeeDeductionLines.map((line) => (
                        <div
                          key={`${line.code}-${line.source}`}
                          className='flex items-center justify-between pl-2 text-muted-foreground'
                        >
                          <span>• {line.name}</span>
                          <span className='font-mono font-semibold text-rose-600 dark:text-rose-400'>
                            {formatDeduction(line.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-between border-t border-border/60 bg-muted/20 p-3 text-xs'>
                  <span className='font-semibold text-muted-foreground'>
                    {m.payroll_breakdown_total_deductions()}
                  </span>
                  <span className='font-mono font-bold text-rose-600 dark:text-rose-400'>
                    {formatDeduction(detail.totalDeductions)}
                  </span>
                </div>
              </div>
            </div>

            {/* ══ 3. TANGGUNGAN PERUSAHAAN (COMPANY BENEFIT - NON-THP) ══ */}
            <div className='space-y-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <span className='rounded-lg bg-indigo-500/10 p-1 text-indigo-600 dark:text-indigo-400'>
                    <IconShieldCheck size={16} />
                  </span>
                  <div>
                    <h4 className='text-xs font-bold text-foreground'>
                      {usesSystemComponents ? m.payroll_breakdown_noncash_title() : m.payroll_breakdown_company_benefits_title()}
                    </h4>
                    <p className='text-[10px] text-muted-foreground'>
                      {usesSystemComponents ? m.payroll_breakdown_noncash_parameters_hint() : m.payroll_breakdown_company_benefits_hint()}
                    </p>
                  </div>
                </div>
                <Badge variant='outline' className='bg-background font-mono text-[10px]'>
                  {(usesSystemComponents ? m.payroll_breakdown_noncash_total : m.payroll_breakdown_total_benefits)({
                    amount: formatIDR(
                      nonCashTotal,
                    ),
                  })}
                </Badge>
              </div>

              <div className='grid grid-cols-1 gap-3 pt-1 text-xs sm:grid-cols-2'>
                {/* BPJS Kesehatan Perusahaan */}
                <div className='space-y-1.5 rounded-xl border border-border/60 bg-background/80 p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-foreground'>
                      {m.payroll_breakdown_health_employer()}
                    </span>
                    <span className='font-mono font-bold text-indigo-600 dark:text-indigo-400'>
                      {formatIDR(companyHealthAmount)}
                    </span>
                  </div>
                  <p className='text-[10px] text-muted-foreground'>
                    {usesSystemComponents ? m.payroll_breakdown_noncash_parameters_hint() : m.payroll_breakdown_health_employer_hint()}
                  </p>
                </div>

                {/* BPJS TK Perusahaan */}
                <div className='space-y-1.5 rounded-xl border border-border/60 bg-background/80 p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='font-semibold text-foreground'>
                      {m.payroll_breakdown_employment_employer()}
                    </span>
                    <span className='font-mono font-bold text-indigo-600 dark:text-indigo-400'>
                      +{formatIDR(companyTkTotal)}
                    </span>
                  </div>
                  <div className='grid grid-cols-2 gap-x-2 gap-y-0.5 pt-1 text-[10px] text-muted-foreground'>
                    <div>• JKK: {formatIDR(companyJkkAmount)}</div>
                    <div>• JKM: {formatIDR(companyJkmAmount)}</div>
                    <div>• JHT: {formatIDR(companyJhtAmount)}</div>
                    <div>• JP: {formatIDR(companyJpAmount)}</div>
                  </div>
                </div>
                {nonCashLines.map((line) => (
                  <div
                    key={line.code}
                    className='space-y-1.5 rounded-xl border border-border/60 bg-background/80 p-3'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <span className='font-semibold text-foreground'>{line.name}</span>
                      <span className='font-mono font-bold text-indigo-600 dark:text-indigo-400'>
                        {formatIDR(line.amount)}
                      </span>
                    </div>
                    <p className='text-[10px] text-muted-foreground'>
                      {usesSystemComponents ? m.payroll_breakdown_noncash_parameters_hint() : m.payroll_breakdown_noncash_benefit_hint()}
                    </p>
                    {usesSystemComponents && <PayrollComponentParameterSummary line={line} />}
                  </div>
                ))}
              </div>
            </div>

            {/* ══ 4. RINGKASAN PERHITUNGAN AKHIR (TAKE HOME PAY) ══ */}
            <div className='space-y-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background p-5 shadow-xs dark:from-emerald-950/30 dark:via-emerald-950/15 dark:to-background'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex items-center gap-2.5'>
                  <span className='rounded-xl bg-emerald-500/15 p-1.5 text-emerald-600 dark:text-emerald-400'>
                    <IconCalculator size={18} />
                  </span>
                  <div>
                    <h4 className='text-xs font-bold text-foreground'>
                      {m.payroll_breakdown_final_title()}
                    </h4>
                    <p className='text-[10px] text-muted-foreground'>
                      {m.payroll_breakdown_final_formula()}
                    </p>
                  </div>
                </div>

                <Badge variant='emerald' className='px-2 py-0.5 text-[10px] font-semibold'>
                  {m.payroll_breakdown_net_disbursed()}
                </Badge>
              </div>

              {/* Formula & Breakdown visual cards */}
              <div className='grid grid-cols-1 items-stretch gap-3 pt-1 text-xs sm:grid-cols-3'>
                {/* 1. Gross */}
                <div className='space-y-1 rounded-xl border border-border/70 bg-background/90 p-3.5 shadow-2xs'>
                  <div className='flex items-center justify-between text-muted-foreground'>
                    <span className='text-[11px] font-medium'>
                      {m.payroll_breakdown_total_income()}
                    </span>
                    <span className='text-[10px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      {m.payroll_breakdown_gross()}
                    </span>
                  </div>
                  <p className='font-mono text-base font-bold text-foreground'>
                    {formatIDR(detail.totalGross)}
                  </p>
                  <p className='text-[10px] text-muted-foreground'>
                    {m.payroll_breakdown_income_formula()}
                  </p>
                </div>

                {/* 2. Deductions */}
                <div className='space-y-1 rounded-xl border border-border/70 bg-background/90 p-3.5 shadow-2xs'>
                  <div className='flex items-center justify-between text-muted-foreground'>
                    <span className='text-[11px] font-medium'>
                      {m.payroll_breakdown_total_deductions_short()}
                    </span>
                    <span className='text-[10px] font-semibold text-rose-600 dark:text-rose-400'>
                      {m.payroll_breakdown_deductions()}
                    </span>
                  </div>
                  <p className='font-mono text-base font-bold text-rose-600 dark:text-rose-400'>
                    {formatDeduction(detail.totalDeductions)}
                  </p>
                  <p className='text-[10px] text-muted-foreground'>
                    {m.payroll_breakdown_deductions_formula()}
                  </p>
                </div>

                {/* 3. Take Home Pay Result */}
                <div className='space-y-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3.5 shadow-2xs ring-1 ring-emerald-500/20 dark:bg-emerald-950/50'>
                  <div className='flex items-center justify-between text-emerald-900 dark:text-emerald-200'>
                    <span className='text-[11px] font-bold'>
                      {m.payroll_breakdown_net_received()}
                    </span>
                    <span className='font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400'>
                      THP
                    </span>
                  </div>
                  <p className='font-mono text-lg font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400'>
                    {formatIDR(detail.netTakeHomePay)}
                  </p>
                  <div className='flex items-center gap-1 truncate text-[10px] text-muted-foreground'>
                    <IconBuildingBank
                      size={12}
                      className='shrink-0 text-emerald-600 dark:text-emerald-400'
                    />
                    <span className='truncate'>
                      {detail.bankName} · {detail.bankAccountNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* ── Footer Modal: Tombol Tutup di Pojok Kanan ────────────────────── */}
        <DialogFooter className='flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-muted/20 p-4 px-6'>
          <div className='hidden text-[11px] text-muted-foreground sm:block'>
            {m.payroll_breakdown_footer()}
          </div>

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='ml-auto h-9 cursor-pointer rounded-xl px-6 text-xs font-semibold hover:bg-muted'
          >
            {m.payroll_breakdown_close()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
