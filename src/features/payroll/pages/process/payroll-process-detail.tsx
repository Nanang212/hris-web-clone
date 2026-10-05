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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
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

  const reconciliation = useMemo(() => {
    return buildBpjsKesReconciliation({
      details,
      billingRecords: billingUpload?.records ?? [],
      bpjsKesConfig,
    })
  }, [details, billingUpload, bpjsKesConfig])

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
      snackbar.success(`Laporan payroll lengkap dan rekonsiliasi ${run.period} berhasil diekspor ke Excel!`)
    } catch (err) {
      console.error(err)
      snackbar.error('Gagal mengekspor laporan ke Excel.')
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
                      name: manualAdjName || 'Penyesuaian Manual',
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

    snackbar.success(`Penyesuaian payroll untuk ${selectedEmp.employeeName} berhasil disimpan!`)
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
                Payroll Run: {run.period}
              </h2>
              <PayrollStatusBadge status={run.status} />
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Batch Code: <span className='font-mono font-medium'>{run.code}</span> · Cut-off:{' '}
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
            {isExporting ? 'Mengekspor...' : 'Export Excel (3 Sheet)'}
          </Button>

          {run.status === 'draft' && (
            <Button
              size='sm'
              onClick={() => onSubmitForApproval(run.id)}
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 shadow-xs cursor-pointer'
            >
              <IconSend size={15} />
              Submit for Approval
            </Button>
          )}

          {run.status === 'in_review' && (
            <Button
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer'
            >
              <IconChecklist size={15} />
              Buka Approval & Disbursement
            </Button>
          )}

          {run.status === 'approved' && (
            <Button
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
            >
              <IconBuildingBank size={15} />
              Lanjut ke Pencairan (Disbursement)
            </Button>
          )}

          {run.status === 'disbursed' && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => onNavigateToApproval?.(run.id)}
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer'
            >
              <IconChecklist size={15} />
              Lihat di Approval & Disbursement
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
              <p className='text-[11px] font-semibold text-muted-foreground'>Employees Count</p>
              <b className='text-base font-bold text-foreground'>{totalEmployees} Karyawan</b>
            </div>
          </div>
        </div>

        <div className='p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'>
              <IconReportMoney size={20} />
            </span>
            <div>
              <p className='text-[11px] font-semibold text-muted-foreground'>Total Gross Salary</p>
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
              <p className='text-[11px] font-semibold text-muted-foreground'>Tax & Deductions</p>
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
              <p className='text-[11px] font-semibold text-muted-foreground'>Net Take Home Pay</p>
              <b className='text-base font-bold text-emerald-600 dark:text-emerald-400'>
                {formatCompactIDR(totalNetDisbursementSum)}
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Switcher Tabs: Rincian Payroll vs Rekonsiliasi BPJS Kes ── */}
      <div className='flex items-center gap-2 border-b border-border/60 pb-3'>
        <button
          type='button'
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <IconReceipt size={16} />
          <span>Rincian Payroll Karyawan</span>
          <Badge
            variant={activeTab === 'payroll' ? 'secondary' : 'outline'}
            className='text-[10px] px-1.5 py-0 rounded-md font-semibold'
          >
            {details.length}
          </Badge>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
          }`}
        >
          <IconFileSpreadsheet size={16} />
          <span>Rekonsiliasi BPJS Kesehatan (Upload vs Payroll)</span>
          {issueCount > 0 ? (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === 'reconciliation'
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              {issueCount} Temuan
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === 'reconciliation'
                  ? 'bg-emerald-400 text-slate-900'
                  : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              Match
            </span>
          )}
        </button>
      </div>

      {activeTab === 'payroll' ? (
        <>
          {(missingBilling.length > 0 || unmatchedBilling.length > 0) && (
            <div className='rounded-2xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs space-y-1.5'>
              {missingBilling.length > 0 && (
                <p className='text-amber-800 dark:text-amber-300'>
                  <b>{missingBilling.length} karyawan belum ada tagihan BPJS Kesehatan</b> (potongan
                  dihitung Rp 0, periksa): {missingBilling.map((d) => d.employeeName).join(', ')}
                </p>
              )}
              {unmatchedBilling.length > 0 && (
                <p className='text-amber-800 dark:text-amber-300'>
                  <b>{unmatchedBilling.length} baris tagihan tidak cocok dengan karyawan mana pun</b>{' '}
                  (NIK / No. Kepesertaan tidak ditemukan).
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
                  placeholder='Search employee name, ID, or department...'
                  className='pl-9 h-9 text-xs bg-background rounded-xl'
                />
              </div>

              <div className='flex items-center gap-2'>
                <Badge variant='outline' className='text-[11px] font-medium'>
                  Cicilan PPh 21 THR Aktif & Penyesuaian Manual Tersedia
                </Badge>
                <span className='text-xs font-bold text-muted-foreground'>
                  Showing {filtered.length} of {details.length} Records
                </span>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                    <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>Employee</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Position / PTKP</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Base Salary</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Gross Pay</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>BPJS TK + Kes</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>PPh 21 Reguler</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Cicilan PPh 21 THR</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Total Potongan</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5'>Net Pay</TableHead>
                    <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>Aksi</TableHead>
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
                                Bulan {item.thrTaxInstallmentInfo?.currentInstallmentMonth || 1}/{item.thrTaxInstallmentInfo?.tenorMonths || 3}
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
                            tooltip='Lihat Rincian Payroll'
                            icon={<IconReceipt size={16} />}
                            onClick={() => {
                              setBreakdownEmp(item)
                              setBreakdownModalOpen(true)
                            }}
                            intent='default'
                          />
                          <TableActionButton
                            tooltip='Penyesuaian Manual & Cicilan Pajak THR'
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
              Penyesuaian Manual & Cicilan Pajak THR
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Sesuaikan potongan cicilan pajak THR atau tambahkan penyesuaian gaji manual untuk{' '}
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
                    <span className='font-bold text-foreground'>Cicilan Pajak PPh 21 THR Bulan Ini</span>
                  </div>
                  {selectedEmp.thrTaxInstallmentInfo && (
                    <Badge variant='outline' className='text-[10px] bg-background'>
                      Bulan {selectedEmp.thrTaxInstallmentInfo.currentInstallmentMonth} dari {selectedEmp.thrTaxInstallmentInfo.tenorMonths}
                    </Badge>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <label className='font-semibold text-muted-foreground'>
                    Nominal Potongan Cicilan THR (Rp)
                  </label>
                  <Input
                    type='number'
                    step={25000}
                    value={adjustedThrTax}
                    onChange={(e) => setAdjustedThrTax(parseInt(e.target.value, 10) || 0)}
                    className='h-9 text-xs bg-background rounded-xl'
                  />
                  <div className='flex justify-between items-center text-[10px] text-muted-foreground'>
                    <span>Sisa saldo sebelum periode ini: {formatIDR(selectedEmp.thrTaxInstallmentInfo?.remainingBalance || 0)}</span>
                    <button
                      type='button'
                      onClick={() => setAdjustedThrTax(0)}
                      className='text-primary hover:underline font-semibold cursor-pointer'
                    >
                      Set 0 (Tunda Cicilan)
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Penyesuaian Tambahan Lainnya (Manual Adjustment) */}
              <div className='p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-3'>
                <p className='font-bold text-foreground flex items-center gap-1.5'>
                  <IconInfoCircle className='size-4 text-muted-foreground' />
                  Penyesuaian Manual Tambahan (Koreksi / Insentif)
                </p>

                <div className='grid grid-cols-2 gap-2.5'>
                  <div className='space-y-1'>
                    <label className='font-semibold text-muted-foreground'>Tipe Penyesuaian</label>
                    <Select
                      value={manualAdjType}
                      onValueChange={(val: 'allowance' | 'deduction') => setManualAdjType(val)}
                    >
                      <SelectTrigger className='h-8.5 text-xs bg-background rounded-xl'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='deduction'>Potongan (-) [Pengurangan Gaji]</SelectItem>
                        <SelectItem value='allowance'>Tunjangan / Bonus (+) [Penambahan]</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-1'>
                    <label className='font-semibold text-muted-foreground'>Nominal Penyesuaian (Rp)</label>
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
                  <label className='font-semibold text-muted-foreground'>Keterangan / Alasan Penyesuaian</label>
                  <Input
                    value={manualAdjName}
                    onChange={(e) => setManualAdjName(e.target.value)}
                    placeholder='e.g. Koreksi kelebihan potong pajak, bonus prestasi...'
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
                      <span className='font-semibold text-foreground'>Estimasi Take-Home Pay Baru:</span>
                      <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                        {formatIDR(previewNet)}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-[10px] text-muted-foreground'>
                      <span>Take-Home Pay Sebelumnya: {formatIDR(selectedEmp.netTakeHomePay)}</span>
                      <span className='font-medium font-mono'>
                        Selisih: {formatIDR(previewNet - selectedEmp.netTakeHomePay)}
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
                  Batal
                </Button>
                <Button type='submit' className='h-9 text-xs font-semibold rounded-xl'>
                  Terapkan Penyesuaian
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
