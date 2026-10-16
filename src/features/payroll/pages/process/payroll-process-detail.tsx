// src/features/payroll/pages/process/payroll-process-detail.tsx — Screen 11: Payroll Run Detail per employee & Manual Adjustments
import {
  IconDownload,
  IconSearch,
  IconSend,
  IconArrowLeft,
  IconUsers,
  IconReportMoney,
  IconBuildingBank,
  IconAdjustments,
  IconCoins,
  IconReceipt,
  IconFileSpreadsheet,
  IconLoader2,
  IconInfoCircle,
  IconChecklist,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { EmployeePayrollBreakdownModal } from '../../components/employee-payroll-breakdown-modal'
import { PayrollStatusBadge } from '../../components/payroll-status-badge'
import {
  formatIDR,
  formatCompactIDR,
  initialEmployeePayrollDetails,
} from '../../data/mock-payroll-data'
import type { PayrollRun, EmployeePayrollDetail } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { FieldLabel } from '@/shared/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { TableActionButton } from '@/shared/components/ui/table-action-button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { snackbar } from '@/shared/lib/snackbar'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { usePayrollRunStore } from '../../store/payroll-run-store'
import { toPeriodKey, usePayrollBpjsBillingStore } from '../../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../../store/payroll-bpjs-store'
import { buildBpjsKesReconciliation } from '../../lib/payroll-reconciliation'
import { BpjsKesReconciliationPanel } from '../../components/bpjs-kes-reconciliation-panel'
import { exportPayrollRunToExcel } from '../../lib/payroll-export-excel'

interface PayrollProcessDetailProps {
  run: PayrollRun
  onBack: () => void
  onSubmitForApproval: (runId: string) => void
  onNavigateToApproval?: (runId: string) => void
}

export function PayrollProcessDetail({
  run,
  onBack,
  onSubmitForApproval,
  onNavigateToApproval,
}: PayrollProcessDetailProps) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'payroll' | 'reconciliation'>('payroll')
  const [isExporting, setIsExporting] = useState(false)

  const runResult = usePayrollRunStore((s) => s.resultsByRunId[run.id])
  const [details, setDetails] = useState<EmployeePayrollDetail[]>(
    runResult?.details ?? initialEmployeePayrollDetails,
  )
  const missingBilling = details.filter((d) => d.bpjsKesSource === 'missing')
  const unmatchedBilling = runResult?.unmatchedBilling ?? []

  const periodKey = toPeriodKey(String(run.periodYear), String(run.periodMonth))
  const billingUpload = usePayrollBpjsBillingStore((s) => s.uploads[periodKey])
  const bpjsKesConfig = usePayrollBpjsStore((s) => s.bpjsKesConfig)
  const locale = getLocale()

  const reconciliation = useMemo(() => {
    return buildBpjsKesReconciliation({
      details,
      billingRecords: billingUpload?.records ?? [],
      bpjsKesConfig,
      locale,
    })
  }, [details, billingUpload, bpjsKesConfig, locale])

  const issueCount =
    reconciliation.summary.wageDiffCount +
    reconciliation.summary.missingInBillingCount +
    reconciliation.summary.orphanBillingCount

  // Breakdown Modal State
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false)
  const [breakdownEmp, setBreakdownEmp] = useState<EmployeePayrollDetail | null>(null)

  // Manual Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [selectedEmp, setSelectedEmp] = useState<EmployeePayrollDetail | null>(null)
  const [adjustedThrTax, setAdjustedThrTax] = useState<number>(0)
  const [manualAdjName, setManualAdjName] = useState<string>('')
  const [manualAdjAmount, setManualAdjAmount] = useState<number>(0)
  const [manualAdjType, setManualAdjType] = useState<'allowance' | 'deduction'>('deduction')
  const [manualAdjNote, setManualAdjNote] = useState<string>('')

  const filtered = details.filter(
    (d) =>
      d.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      d.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
  )

  // Compute live KPI summaries based on current state of details
  const totalEmployees = details.length
  const totalGrossSum = details.reduce((acc, curr) => acc + curr.totalGross, 0)
  const totalDeductionsSum = details.reduce((acc, curr) => acc + curr.totalDeductions, 0)
  const totalNetDisbursementSum = details.reduce((acc, curr) => acc + curr.netTakeHomePay, 0)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportPayrollRunToExcel({
        run,
        details,
        reconciliationRows: reconciliation.rows,
        reconciliationSummary: reconciliation.summary,
      })
      snackbar.success(m.payroll_run_detail_export_success({ period: run.period }))
    } catch (err) {
      console.error(err)
      snackbar.error(m.payroll_run_detail_export_error())
    } finally {
      setIsExporting(false)
    }
  }

  const handleOpenAdjustment = (emp: EmployeePayrollDetail) => {
    setSelectedEmp(emp)
    setAdjustedThrTax(emp.thrTaxInstallment || 0)
    setManualAdjName('')
    setManualAdjAmount(0)
    setManualAdjType('deduction')
    setManualAdjNote('')
    setAdjustModalOpen(true)
  }

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmp) return

    setDetails((prev) =>
      prev.map((item) => {
        if (item.id === selectedEmp.id) {
          const prevThrTax = item.thrTaxInstallment || 0
          const thrDiff = adjustedThrTax - prevThrTax

          let extraAdjGross = 0
          let extraAdjDeduction = 0
          if (manualAdjAmount > 0) {
            if (manualAdjType === 'allowance') {
              extraAdjGross = manualAdjAmount
            } else {
              extraAdjDeduction = manualAdjAmount
            }
          }

          const newTotalGross = item.totalGross + extraAdjGross
          const newTotalDeductions = item.totalDeductions + thrDiff + extraAdjDeduction
          const newNetPay = newTotalGross - newTotalDeductions

          return {
            ...item,
            thrTaxInstallment: adjustedThrTax,
            totalGross: newTotalGross,
            totalDeductions: newTotalDeductions,
            netTakeHomePay: newNetPay,
            manualAdjustments:
              manualAdjAmount > 0
                ? [
                    ...(item.manualAdjustments || []),
                    {
                      id: `adj-${Date.now()}`,
                      name: manualAdjName || m.payroll_run_detail_manual_adjustment(),
                      amount: manualAdjAmount,
                      type: manualAdjType,
                      note: manualAdjNote,
                    },
                  ]
                : item.manualAdjustments,
          }
        }
        return item
      }),
    )

    snackbar.success(m.payroll_run_detail_adjustment_saved({ employee: selectedEmp.employeeName }))
    setAdjustModalOpen(false)
  }

  return (
    <div className='space-y-6'>
      {/* ── Top Header Actions ─────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            size='icon'
            onClick={onBack}
            className='size-9 rounded-xl'
          >
            <IconArrowLeft size={18} />
          </Button>
          <div>
            <div className='flex items-center gap-2.5'>
              <h2 className='text-base font-bold text-foreground'>
                {m.payroll_run_detail_title({ period: run.period })}
              </h2>
              <PayrollStatusBadge status={run.status} />
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_run_detail_batch_code()} <span className='font-mono font-medium'>{run.code}</span> · {m.payroll_run_detail_cutoff()}{' '}
              {run.cutoffStartDate} – {run.cutoffEndDate}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleExport}
            disabled={isExporting}
            className='gap-1.5 text-xs font-semibold rounded-xl h-9 cursor-pointer'
          >
            {isExporting ? <IconLoader2 className='animate-spin' size={15} /> : <IconDownload size={15} />}
            {isExporting ? m.payroll_run_detail_exporting() : m.payroll_run_detail_export()}
          </Button>

          {run.status === 'draft' && (
            <Button
              size='sm'
              onClick={() => onSubmitForApproval(run.id)}
            >
              <IconSend data-icon='inline-start' />
              {m.payroll_run_detail_submit_approval()}
            </Button>
          )}

          {run.status === 'in_review' && (
            <Button
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
            >
              <IconChecklist data-icon='inline-start' />
              {m.payroll_run_detail_open_approval()}
            </Button>
          )}

          {run.status === 'approved' && (
            <Button
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
            >
              <IconBuildingBank data-icon='inline-start' />
              {m.payroll_run_detail_go_disbursement()}
            </Button>
          )}

          {run.status === 'disbursed' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
            >
              <IconChecklist data-icon='inline-start' />
              {m.payroll_run_detail_view_approval()}
            </Button>
          )}
        </div>
      </div>

      {/* ── Summary KPI Cards ─────────────────────────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-primary/10 text-primary'>
              <IconUsers size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_run_detail_employees()}</p>
              <b className='text-base font-bold text-foreground'>{m.payroll_run_detail_employee_count({ count: totalEmployees })}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconReportMoney size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_run_detail_gross()}</p>
              <b className='text-base font-bold text-foreground'>{formatCompactIDR(totalGrossSum)}</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'>
              <IconReportMoney size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_run_detail_deductions()}</p>
              <b className='text-base font-bold text-amber-600 dark:text-amber-400'>
                {formatCompactIDR(totalDeductionsSum)}
              </b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'>
              <IconBuildingBank size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>{m.payroll_run_detail_net_pay()}</p>
              <b className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
                {formatCompactIDR(totalNetDisbursementSum)}
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Switcher Tabs: Rincian Payroll vs Rekonsiliasi BPJS Kes ── */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'payroll' | 'reconciliation')}>
        <TabsList className='h-auto w-full justify-start gap-2 border-b border-border/60 bg-transparent pb-3'>
        <TabsTrigger value='payroll' className='gap-2 px-4 py-2 text-xs font-bold'>
          <IconReceipt size={16} />
          <span>{m.payroll_run_detail_employee_breakdown()}</span>
          <Badge
            variant={activeTab === 'payroll' ? 'secondary' : 'outline'}
            className='text-[10px] px-1.5 py-0 rounded-md font-semibold'
          >
            {details.length}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value='reconciliation' className='gap-2 px-4 py-2 text-xs font-bold'>
          <IconFileSpreadsheet size={16} />
          <span>{m.payroll_run_detail_reconciliation()}</span>
          {issueCount > 0 ? (
            <Badge
              variant='amber'
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === 'reconciliation'
                  ? 'bg-amber-400 text-slate-900'
                  : ''
              }`}
            >
              {m.payroll_run_detail_issues({ count: issueCount })}
            </Badge>
          ) : (
            <Badge
              variant='emerald'
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === 'reconciliation'
                  ? 'bg-emerald-400 text-slate-900'
                  : ''
              }`}
            >
              {m.payroll_run_detail_matched()}
            </Badge>
          )}
        </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'payroll' ? (
        <>
          {(missingBilling.length > 0 || unmatchedBilling.length > 0) && (
            <div className='rounded-2xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs space-y-1.5'>
              {missingBilling.length > 0 && (
                <p className='text-amber-800 dark:text-amber-300'>
                  <b>{m.payroll_run_detail_missing_billing({ count: missingBilling.length })}</b> {m.payroll_run_detail_missing_billing_hint()} {missingBilling.map((d) => d.employeeName).join(', ')}
                </p>
              )}
              {unmatchedBilling.length > 0 && (
                <p className='text-amber-800 dark:text-amber-300'>
                  <b>{m.payroll_run_detail_unmatched_billing({ count: unmatchedBilling.length })}</b>{' '}
                  {m.payroll_run_detail_unmatched_billing_hint()}
                </p>
              )}
            </div>
          )}

          {/* ── Employee Breakdown Table ───────────────────────────────────────── */}
          <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
            <div className='p-5 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
              <div className='relative w-full max-w-sm'>
                <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={m.payroll_run_detail_search_placeholder()}
                  className='pl-9 h-9 text-xs bg-background rounded-xl'
                />
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-[11px] font-medium'>
                  {m.payroll_run_detail_manual_available()}
                </Badge>
                <span className='text-xs font-bold text-muted-foreground'>
                  {m.payroll_run_detail_showing({ shown: filtered.length, total: details.length })}
                </span>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                    <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_run_detail_col_employee()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_position()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_base_salary()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_gross()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_bpjs()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_pph21()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_thr_tax()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_deductions()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_run_detail_col_net_pay()}</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_run_detail_col_actions()}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40 whitespace-nowrap'>
                      <TableCell className='py-3.5 pl-6'>
                        <p className='font-bold text-foreground'>{item.employeeName}</p>
                        <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                          {item.employeeCode} · {item.department}
                        </p>
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <p className='text-foreground font-medium'>{item.position}</p>
                        <Badge variant='blue' className='text-[9px] px-1.5 py-0 mt-0.5'>
                          {item.ptkpStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className='py-3.5 font-semibold text-foreground'>
                        {formatIDR(item.baseSalary)}
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-foreground'>
                        {formatIDR(item.totalGross)}
                      </TableCell>
                      <TableCell className='py-3.5 text-amber-600 dark:text-amber-400 font-medium'>
                        -{formatIDR(item.bpjsTkEmployee + item.bpjsKesEmployee)}
                      </TableCell>
                      <TableCell className='py-3.5 text-amber-600 dark:text-amber-400 font-medium'>
                        -{formatIDR(item.pph21Tax)}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        {item.thrTaxInstallment && item.thrTaxInstallment > 0 ? (
                          <div className='space-y-0.5'>
                            <span className='font-bold text-rose-600 dark:text-rose-400'>
                              -{formatIDR(item.thrTaxInstallment)}
                            </span>
                            <div className='flex items-center gap-1 text-[9px] text-muted-foreground font-mono'>
                              <span className='px-1 py-0 rounded bg-muted'>
                                {m.payroll_run_detail_month_fraction({ current: item.thrTaxInstallmentInfo?.currentInstallmentMonth || 1, total: item.thrTaxInstallmentInfo?.tenorMonths || 3 })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className='text-muted-foreground/60'>-</span>
                        )}
                      </TableCell>
                      <TableCell className='py-3.5 text-rose-600 dark:text-rose-400 font-semibold'>
                        -{formatIDR(item.totalDeductions)}
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-emerald-600 dark:text-emerald-400'>
                        {formatIDR(item.netTakeHomePay)}
                      </TableCell>
                      <TableCell className='py-3.5 pr-6 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <TableActionButton
                            tooltip={m.payroll_run_detail_view_breakdown()}
                            icon={<IconReceipt size={16} />}
                            onClick={() => {
                              setBreakdownEmp(item)
                              setBreakdownModalOpen(true)
                            }}
                            intent='default'
                          />
                          <TableActionButton
                            tooltip={m.payroll_run_detail_adjustment_tooltip()}
                            icon={<IconAdjustments size={16} />}
                            onClick={() => handleOpenAdjustment(item)}
                            intent='primary'
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <BpjsKesReconciliationPanel
          rows={reconciliation.rows}
          summary={reconciliation.summary}
          periodLabel={run.period}
          onDownloadExcel={handleExport}
        />
      )}

      {/* ── Dialog Modal: Penyesuaian Manual & Cicilan PPh 21 THR ───────── */}
      <Dialog open={adjustModalOpen} onOpenChange={setAdjustModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold flex items-center gap-2'>
              <IconAdjustments className='size-5 text-primary' />
              {m.payroll_run_detail_dialog_title()}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              {m.payroll_run_detail_dialog_description()}{' '}
              <span className='font-bold text-foreground'>{selectedEmp?.employeeName}</span> ({selectedEmp?.employeeCode}).
            </DialogDescription>
          </DialogHeader>

          {selectedEmp && (
            <form onSubmit={handleSaveAdjustment} className='space-y-4 py-2 text-xs'>
              {/* Box 1: Cicilan PPh 21 THR Section */}
              <div className='p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <IconCoins className='size-4 text-primary' />
                    <span className='font-bold text-foreground'>{m.payroll_run_detail_thr_installment()}</span>
                  </div>
                  {selectedEmp.thrTaxInstallmentInfo && (
                    <Badge variant='outline' className='text-[10px] bg-background'>
                      {m.payroll_run_detail_month_of({ current: selectedEmp.thrTaxInstallmentInfo.currentInstallmentMonth, total: selectedEmp.thrTaxInstallmentInfo.tenorMonths })}
                    </Badge>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <FieldLabel className='font-semibold text-muted-foreground'>
                    {m.payroll_run_detail_thr_amount()}
                  </FieldLabel>
                  <Input
                    type='number'
                    step={25000}
                    value={adjustedThrTax}
                    onChange={(e) => setAdjustedThrTax(parseInt(e.target.value, 10) || 0)}
                    className='h-9 text-xs bg-background rounded-xl'
                  />
                  <div className='flex justify-between items-center text-[10px] text-muted-foreground'>
                    <span>{m.payroll_run_detail_remaining_balance({ amount: formatIDR(selectedEmp.thrTaxInstallmentInfo?.remainingBalance || 0) })}</span>
                    <Button
                      type='button'
                      onClick={() => setAdjustedThrTax(0)}
                      variant='link'
                      className='h-auto p-0 text-primary font-semibold'
                    >
                      {m.payroll_run_detail_pause_installment()}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Box 2: Penyesuaian Tambahan Lainnya (Manual Adjustment) */}
              <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3'>
                <p className='font-bold text-foreground flex items-center gap-1.5'>
                  <IconInfoCircle className='size-4 text-muted-foreground' />
                  {m.payroll_run_detail_extra_adjustment()}
                </p>

                <div className='grid grid-cols-2 gap-2.5'>
                  <div className='space-y-1'>
                    <FieldLabel className='font-semibold text-muted-foreground'>{m.payroll_run_detail_adjustment_type()}</FieldLabel>
                    <Select
                      value={manualAdjType}
                      onValueChange={(val: 'allowance' | 'deduction') => setManualAdjType(val)}
                    >
                      <SelectTrigger className='h-8.5 text-xs bg-background rounded-xl'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                        <SelectItem value='deduction'>{m.payroll_run_detail_type_deduction()}</SelectItem>
                        <SelectItem value='allowance'>{m.payroll_run_detail_type_allowance()}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <FieldLabel className='font-semibold text-muted-foreground'>{m.payroll_run_detail_adjustment_amount()}</FieldLabel>
                    <Input
                      type='number'
                      step={50000}
                      value={manualAdjAmount}
                      onChange={(e) => setManualAdjAmount(parseInt(e.target.value, 10) || 0)}
                      className='h-8.5 text-xs bg-background rounded-xl'
                      placeholder='0'
                    />
                  </div>
                </div>

                <div className='space-y-1'>
                  <FieldLabel className='font-semibold text-muted-foreground'>{m.payroll_run_detail_adjustment_reason()}</FieldLabel>
                  <Input
                    value={manualAdjName}
                    onChange={(e) => setManualAdjName(e.target.value)}
                    placeholder={m.payroll_run_detail_adjustment_reason_placeholder()}
                    className='h-8.5 text-xs bg-background rounded-xl'
                  />
                </div>
              </div>

              {/* Box 3: Live Impact Calculation Preview */}
              {(() => {
                const prevThr = selectedEmp.thrTaxInstallment || 0
                const thrDelta = adjustedThrTax - prevThr
                let extraGross = 0
                let extraDeduction = 0
                if (manualAdjAmount > 0) {
                  if (manualAdjType === 'allowance') extraGross = manualAdjAmount
                  else extraDeduction = manualAdjAmount
                }
                const previewNet =
                  selectedEmp.totalGross +
                  extraGross -
                  (selectedEmp.totalDeductions + thrDelta + extraDeduction)

                return (
                  <div className='p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1.5'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='font-semibold text-foreground'>{m.payroll_run_detail_new_net_pay()}</span>
                      <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                        {formatIDR(previewNet)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px] text-muted-foreground'>
                      <span>{m.payroll_run_detail_previous_net_pay({ amount: formatIDR(selectedEmp.netTakeHomePay) })}</span>
                      <span className='font-medium font-mono'>
                        {m.payroll_run_detail_difference({ amount: formatIDR(previewNet - selectedEmp.netTakeHomePay) })}
                      </span>
                    </div>
                  </div>
                )
              })()}

              <DialogFooter className='pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setAdjustModalOpen(false)}
                  className='h-9 text-xs rounded-xl'
                >
                  {m.payroll_wizard_cancel()}
                </Button>
                <Button type='submit' className='h-9 text-xs font-semibold rounded-xl'>
                  {m.payroll_run_detail_apply_adjustment()}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Rincian Komponen Payroll Per Karyawan */}
      <EmployeePayrollBreakdownModal
        open={breakdownModalOpen}
        onOpenChange={setBreakdownModalOpen}
        detail={breakdownEmp}
      />
    </div>
  )
}
