import {
  IconCalculator,
  IconCheck,
  IconChevronDown,
  IconCoins,
  IconEdit,
  IconInfoCircle,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconX,
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import {
  initialThrPolicyConfig,
  initialThrTaxInstallments,
  initialThrEmployeeOptions,
  formatIDR,
} from '../../data/mock-payroll-data'
import type { ThrPolicyConfig, ThrTaxInstallment, ThrEmployeeOption } from '../../types'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import { Field, FieldLabel } from '@/shared/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import { Progress } from '@/shared/components/ui/progress'
import { Slider } from '@/shared/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
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
import { cn } from '@/shared/lib/utils'
import { m } from '@/i18n/paraglide/messages'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/id'
import { getLocale } from '@/i18n/paraglide/runtime'


export function ThrConfigView() {
  // General Policy State
  const [config, setConfig] = useState<ThrPolicyConfig>(initialThrPolicyConfig)

  // Schedules State
  const [schedules, setSchedules] = useState<ThrTaxInstallment[]>(initialThrTaxInstallments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Interactive Simulator State
  const [simBaseWage, setSimBaseWage] = useState<number>(15000000)
  const [simTenureMonths, setSimTenureMonths] = useState<number>(24)
  const [simTenor, setSimTenor] = useState<number>(3)

  // Modal State for Add / Edit Installment
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ThrTaxInstallment | null>(null)
  const [modalForm, setModalForm] = useState<{
    employeeName: string
    employeeCode: string
    department: string
    totalThrAmount: number
    totalTaxAmount: number
    tenorMonths: number
    startPeriod: string
    notes: string
  }>({
    employeeName: '',
    employeeCode: '',
    department: '',
    totalThrAmount: 0,
    totalTaxAmount: 0,
    tenorMonths: 3,
    startPeriod: dayjs('2026-06-01').locale(getLocale()).format('MMMM YYYY'),
    notes: '',
  })

  // Memoized employee options (ensures any custom/editing employee code is always available)
  const allEmployeeOptions = useMemo<ThrEmployeeOption[]>(() => {
    const list = [...initialThrEmployeeOptions]
    if (editingItem && !list.some((e) => e.code === editingItem.employeeCode)) {
      list.unshift({
        id: editingItem.employeeId,
        code: editingItem.employeeCode,
        name: editingItem.employeeName,
        department: editingItem.department,
        position: 'Staff',
        baseSalary: editingItem.totalThrAmount,
        estimatedThrTax: editingItem.totalTaxAmount,
      })
    }
    return list
  }, [editingItem])

  const selectedEmployee = useMemo(() => {
    return (
      allEmployeeOptions.find((e) => e.code === modalForm.employeeCode) || null
    )
  }, [allEmployeeOptions, modalForm.employeeCode])

  // Searchable Employee Picker State in Modal
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [isEmployeePickerOpen, setIsEmployeePickerOpen] = useState(false)

  // Filtered employee options based on search query
  const filteredEmployeeOptions = useMemo(() => {
    if (!employeeSearch.trim()) return allEmployeeOptions
    const q = employeeSearch.toLowerCase().trim()
    return allEmployeeOptions.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q),
    )
  }, [allEmployeeOptions, employeeSearch])

  // Save General Policy
  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    snackbar.success(m.payroll_thr_policy_saved())
  }

  // Simulation calculations
  const simThrAmount =
    simTenureMonths >= 12
      ? simBaseWage
      : Math.round((simTenureMonths / 12) * simBaseWage)
  // Simplified TER estimate for simulation (~8%-10% depending on wage)
  const simTaxRate = simThrAmount > 15000000 ? 0.10 : 0.075
  const simEstimatedTax = Math.round(simThrAmount * simTaxRate)
  const simMonthlyInstallment = Math.round(simEstimatedTax / (simTenor || 1))

  // Filtered schedules
  const filteredSchedules = schedules.filter((item) => {
    const matchSearch =
      item.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      item.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || item.currentStatus === statusFilter
    return matchSearch && matchStatus
  })

  // Schedule Actions
  const handleTogglePause = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.currentStatus === 'paused' ? 'active' : 'paused'
          snackbar.info(nextStatus === 'paused' ? m.payroll_thr_installment_paused({ employee: item.employeeName }) : m.payroll_thr_installment_resumed({ employee: item.employeeName }))
          return { ...item, currentStatus: nextStatus }
        }
        return item
      }),
    )
  }

  const handleSettleFull = (id: string) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          snackbar.success(m.payroll_thr_installment_settled({ employee: item.employeeName }))
          return {
            ...item,
            paidInstallments: item.tenorMonths,
            remainingBalance: 0,
            currentStatus: 'completed',
          }
        }
        return item
      }),
    )
  }

  const handleOpenAdd = () => {
    setEditingItem(null)
    setEmployeeSearch('')
    setIsEmployeePickerOpen(false)
    setModalForm({
      employeeName: '',
      employeeCode: '',
      department: '',
      totalThrAmount: 0,
      totalTaxAmount: 0,
      tenorMonths: config.defaultTenorMonths || 3,
      startPeriod: dayjs('2026-06-01').locale(getLocale()).format('MMMM YYYY'),
      notes: m.payroll_thr_manual_note(),
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: ThrTaxInstallment) => {
    setEditingItem(item)
    setEmployeeSearch('')
    setIsEmployeePickerOpen(false)
    setModalForm({
      employeeName: item.employeeName,
      employeeCode: item.employeeCode,
      department: item.department,
      totalThrAmount: item.totalThrAmount,
      totalTaxAmount: item.totalTaxAmount,
      tenorMonths: item.tenorMonths,
      startPeriod: item.startPeriod,
      notes: item.notes || '',
    })
    setIsModalOpen(true)
  }

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalForm.employeeName.trim() || !modalForm.employeeCode.trim()) {
      snackbar.error(m.payroll_thr_employee_required())
      return
    }

    const calculatedInstallment = Math.round(
      modalForm.totalTaxAmount / (modalForm.tenorMonths || 1),
    )

    if (editingItem) {
      setSchedules((prev) =>
        prev.map((item) => {
          if (item.id === editingItem.id) {
            const paid = item.paidInstallments
            const remaining = Math.max(0, modalForm.totalTaxAmount - paid * calculatedInstallment)
            return {
              ...item,
              employeeName: modalForm.employeeName,
              employeeCode: modalForm.employeeCode,
              department: modalForm.department,
              totalThrAmount: modalForm.totalThrAmount,
              totalTaxAmount: modalForm.totalTaxAmount,
              tenorMonths: modalForm.tenorMonths,
              installmentPerMonth: calculatedInstallment,
              remainingBalance: remaining,
              notes: modalForm.notes,
            }
          }
          return item
        }),
      )
      snackbar.success(m.payroll_thr_schedule_updated())
    } else {
      const newItem: ThrTaxInstallment = {
        id: `thr-inst-${Date.now()}`,
        employeeId: modalForm.employeeCode,
        employeeName: modalForm.employeeName,
        employeeCode: modalForm.employeeCode,
        department: modalForm.department,
        totalThrAmount: modalForm.totalThrAmount,
        totalTaxAmount: modalForm.totalTaxAmount,
        tenorMonths: modalForm.tenorMonths,
        installmentPerMonth: calculatedInstallment,
        startPeriod: modalForm.startPeriod,
        endPeriod: dayjs('2026-08-01').locale(getLocale()).format('MMMM YYYY'),
        paidInstallments: 0,
        remainingBalance: modalForm.totalTaxAmount,
        currentStatus: 'active',
        paymentResponsibility: 'employee_deduction',
        notes: modalForm.notes,
      }
      setSchedules((prev) => [newItem, ...prev])
      snackbar.success(m.payroll_thr_schedule_added({ employee: newItem.employeeName }))
    }

    setIsModalOpen(false)
  }

  return (
    <div className='space-y-8'>
      {/* ── Section 1: Kebijakan Pokok THR & Regulasi ────────────────────── */}
      <form onSubmit={handleSavePolicy} className='space-y-6'>
        <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60'>
            <div>
              <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
                <IconCoins className='size-4.5 text-primary' />
                {m.payroll_thr_policy_title()}
              </h3>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_thr_policy_description()}
              </p>
            </div>
            <Badge variant='outline' className='text-xs font-mono font-medium'>
              {m.payroll_thr_regulation()}
            </Badge>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>
                {m.payroll_thr_min_tenure()}
              </FieldLabel>
              <Input
                type='number'
                value={config.minTenureMonths}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    minTenureMonths: parseInt(e.target.value, 10) || 1,
                  }))
                }
                className='h-9.5 text-xs bg-background rounded-xl'
              />
              <p className='text-[10px] text-muted-foreground'>
                {m.payroll_thr_min_tenure_hint()}
              </p>
            </div>

            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>
                {m.payroll_thr_payment_deadline()}
              </FieldLabel>
              <Input
                type='number'
                value={config.paymentTimingDays}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    paymentTimingDays: parseInt(e.target.value, 10) || 7,
                  }))
                }
                className='h-9.5 text-xs bg-background rounded-xl'
              />
              <p className='text-[10px] text-muted-foreground'>
                {m.payroll_thr_payment_deadline_hint()}
              </p>
            </div>

            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>
                {m.payroll_thr_tax_scheme()}
              </FieldLabel>
              <Select
                value={config.taxDeductionScheme}
                onValueChange={(val: 'combined' | 'separate') =>
                  setConfig((prev) => ({ ...prev, taxDeductionScheme: val }))
                }
              >
                <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                  <SelectValue placeholder={m.payroll_thr_select_scheme()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                  <SelectItem value='combined'>{m.payroll_thr_scheme_combined()}</SelectItem>
                  <SelectItem value='separate'>{m.payroll_thr_scheme_separate()}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className='text-[10px] text-muted-foreground'>
                {m.payroll_thr_tax_scheme_hint()}
              </p>
            </div>
          </div>
        </div>

        {/* ── Section 2: Skema Cicilan Pajak THR (Tax Installment Policy) ── */}
        <div className='rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-card to-card p-6 shadow-xs space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/60'>
            <div>
              <div className='flex items-center gap-2'>
                <h3 className='text-sm font-bold text-foreground'>
                  {m.payroll_thr_installment_title()}
                </h3>
                <Badge variant='blue'>{m.payroll_thr_internal_policy()}</Badge>
              </div>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {m.payroll_thr_installment_description()}
              </p>
            </div>

            <div className='flex items-center gap-3 bg-background/80 px-3.5 py-1.5 rounded-xl border border-border/80 shadow-2xs'>
              <span className='text-xs font-semibold text-foreground'>
                {config.taxInstallmentEnabled ? m.payroll_thr_facility_active() : m.payroll_thr_facility_inactive()}
              </span>
              <Switch
                checked={config.taxInstallmentEnabled}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, taxInstallmentEnabled: checked }))
                }
              />
            </div>
          </div>

          {config.taxInstallmentEnabled ? (
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground'>
                    {m.payroll_thr_default_tenor()}
                  </FieldLabel>
                  <Select
                    value={String(config.defaultTenorMonths)}
                    onValueChange={(val) =>
                      setConfig((prev) => ({
                        ...prev,
                        defaultTenorMonths: parseInt(val, 10),
                      }))
                    }
                  >
                    <SelectTrigger className='h-9.5 text-xs bg-background rounded-xl'>
                      <SelectValue placeholder={m.payroll_thr_select_tenor()} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                      <SelectItem value='1'>{m.payroll_thr_tenor_1()}</SelectItem>
                      <SelectItem value='2'>{m.payroll_thr_tenor_2()}</SelectItem>
                      <SelectItem value='3'>{m.payroll_thr_tenor_3()}</SelectItem>
                      <SelectItem value='4'>{m.payroll_thr_tenor_4()}</SelectItem>
                      <SelectItem value='6'>{m.payroll_thr_tenor_6()}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p className='text-[10px] text-muted-foreground'>
                    {m.payroll_thr_default_tenor_hint()}
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground'>
                    {m.payroll_thr_min_tax()}
                  </FieldLabel>
                  <Input
                    type='number'
                    step={50000}
                    value={config.minTaxForInstallment}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        minTaxForInstallment: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className='h-9.5 text-xs bg-background rounded-xl'
                  />
                  <p className='text-[10px] text-muted-foreground'>
                    {m.payroll_thr_min_tax_hint({ amount: formatIDR(config.minTaxForInstallment) })}
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <FieldLabel className='text-xs font-semibold text-foreground'>
                    {m.payroll_thr_auto_deduction()}
                  </FieldLabel>
                  <div className='flex items-center justify-between p-2.5 rounded-xl border border-border/80 bg-background h-9.5'>
                    <span className='text-xs text-foreground font-medium'>{m.payroll_thr_auto_apply()}</span>
                    <Switch
                      checked={config.autoDeductInPayroll}
                      onCheckedChange={(checked) =>
                        setConfig((prev) => ({ ...prev, autoDeductInPayroll: checked }))
                      }
                    />
                  </div>
                  <p className='text-[10px] text-muted-foreground'>
                    {m.payroll_thr_auto_deduction_hint()}
                  </p>
                </div>
              </div>

              {/* Information Callout */}
              <Alert variant='info' className='items-start'>
                <AlertIcon><IconInfoCircle /></AlertIcon>
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <AlertTitle>
                    {m.payroll_thr_how_it_works()}
                  </AlertTitle>
                  <AlertDescription>
                  <ul className='flex list-inside list-disc flex-col gap-0.5'>
                    <li>
                      {m.payroll_thr_how_step_1()}
                    </li>
                    <li>
                      {m.payroll_thr_how_step_2({ months: config.defaultTenorMonths })}
                    </li>
                    <li>
                      {m.payroll_thr_how_step_3()}
                    </li>
                  </ul>
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          ) : (
            <Alert variant='info' className='items-start'>
              <AlertIcon><IconInfoCircle /></AlertIcon>
              <AlertDescription className='min-w-0 flex-1'>{m.payroll_thr_facility_disabled_hint()}</AlertDescription>
            </Alert>
          )}

          <div className='flex justify-end pt-2'>
            <Button type='submit' className='h-9.5 px-6 text-xs font-semibold rounded-xl shadow-xs'>
              {m.payroll_thr_save_policy()}
            </Button>
          </div>
        </div>
      </form>

      {/* ── Section 3: Interactive THR Tax & Installment Calculator ──────── */}
      <div className='rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-5'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <IconCalculator className='size-4.5 text-primary' />
              {m.payroll_thr_simulator_title()}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_thr_simulator_description()}
            </p>
          </div>
          <Badge variant='outline' className='text-xs bg-primary/5 text-primary border-primary/20 gap-1'>
            <IconSparkles size={13} />
            {m.payroll_thr_realtime()}
          </Badge>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Inputs */}
          <div className='lg:col-span-5 space-y-4 p-4 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>
                {m.payroll_thr_base_wage()}
              </FieldLabel>
              <Input
                type='number'
                step={500000}
                value={simBaseWage}
                onChange={(e) => setSimBaseWage(parseInt(e.target.value, 10) || 0)}
                className='h-9 text-xs bg-background rounded-xl'
              />
            </div>

            <div className='space-y-1.5'>
              <div className='flex justify-between items-center text-xs'>
                <span className='font-semibold text-foreground'>{m.payroll_thr_employee_tenure()}</span>
                <span className='font-mono font-bold text-primary'>{m.payroll_thr_months({ count: simTenureMonths })}</span>
              </div>
              <Slider
                aria-label={m.payroll_thr_employee_tenure()}
                min={1}
                max={48}
                value={[simTenureMonths]}
                onValueChange={(value) => setSimTenureMonths(value[0] ?? 1)}
              />
              <div className='flex justify-between text-[10px] text-muted-foreground'>
                <span>{m.payroll_thr_tenure_one_month()}</span>
                <span>{m.payroll_thr_tenure_full()}</span>
              </div>
            </div>

            <div className='space-y-1.5'>
              <FieldLabel className='text-xs font-semibold text-foreground'>
                {m.payroll_thr_tenor_choice()}
              </FieldLabel>
              <Select
                value={String(simTenor)}
                onValueChange={(val) => setSimTenor(parseInt(val, 10))}
              >
                <SelectTrigger className='h-9 text-xs bg-background rounded-xl'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                  <SelectItem value='1'>{m.payroll_thr_tenor_1_full()}</SelectItem>
                  <SelectItem value='2'>{m.payroll_thr_months({ count: 2 })}</SelectItem>
                  <SelectItem value='3'>{m.payroll_thr_months({ count: 3 })}</SelectItem>
                  <SelectItem value='4'>{m.payroll_thr_months({ count: 4 })}</SelectItem>
                  <SelectItem value='6'>{m.payroll_thr_months({ count: 6 })}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Display */}
          <div className='lg:col-span-7 flex flex-col justify-between p-5 rounded-xl border border-border/80 bg-linear-to-br from-card via-card to-primary/5'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4 border-b border-border/60'>
              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>{m.payroll_thr_gross_amount()}</p>
                <p className='text-base font-bold text-foreground mt-0.5'>{formatIDR(simThrAmount)}</p>
                <p className='text-[10px] text-muted-foreground'>
                  {simTenureMonths >= 12 ? m.payroll_thr_full_wage() : m.payroll_thr_prorated({ months: simTenureMonths })}
                </p>
              </div>

              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>{m.payroll_thr_estimated_tax()}</p>
                <p className='text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5'>
                  {formatIDR(simEstimatedTax)}
                </p>
                <p className='text-[10px] text-muted-foreground'>{m.payroll_thr_estimated_ter({ rate: (simTaxRate * 100).toFixed(1) })}</p>
              </div>

              <div>
                <p className='text-[11px] text-muted-foreground font-medium'>{m.payroll_thr_monthly_deduction()}</p>
                <p className='text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5'>
                  {formatIDR(simMonthlyInstallment)}
                </p>
                <p className='text-[10px] text-muted-foreground'>{m.payroll_thr_over_months({ count: simTenor })}</p>
              </div>
            </div>

            {/* Tenor Schedule Flow Preview */}
            <div className='pt-4 space-y-2'>
              <p className='text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
                {m.payroll_thr_allocation_schedule()}
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-2.5'>
                {Array.from({ length: Math.min(simTenor, 3) }).map((_, idx) => (
                  <div
                    key={idx}
                    className='p-2.5 rounded-lg border border-border/80 bg-background text-xs space-y-1'
                  >
                    <div className='flex justify-between items-center'>
                      <span className='font-bold text-foreground'>{m.payroll_thr_month_number({ number: idx + 1 })}</span>
                      <Badge variant='outline' className='text-[9px] px-1.5 py-0'>
                        {idx + 1}/{simTenor}
                      </Badge>
                    </div>
                    <p className='text-xs font-semibold text-rose-600 dark:text-rose-400'>
                      -{formatIDR(simMonthlyInstallment)}
                    </p>
                    <p className='text-[9px] text-muted-foreground'>{m.payroll_thr_payslip_deduction()}</p>
                  </div>
                ))}
              </div>
              {simTenor > 3 && (
                <p className='text-[10px] text-muted-foreground italic text-right'>
                  {m.payroll_thr_more_months({ count: simTenor - 3 })}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Daftar Jadwal Cicilan Pajak Karyawan ─────────────── */}
      <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-0'>
        <div className='p-6 pb-4 border-b border-border/60 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h3 className='text-sm font-bold text-foreground flex items-center gap-2'>
              <IconCoins className='size-4.5 text-primary' />
              {m.payroll_thr_schedule_title()}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {m.payroll_thr_schedule_description()}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              onClick={handleOpenAdd}
              size='sm'
              className='gap-1.5 text-xs font-semibold rounded-xl h-9 shadow-xs'
            >
              <IconPlus size={15} />
              {m.payroll_thr_add_schedule()}
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className='p-4 border-b border-border/50 bg-muted/15 flex flex-wrap items-center justify-between gap-3'>
          <div className='relative w-full max-w-xs'>
            <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={m.payroll_thr_schedule_search()}
              className='pl-9 h-8.5 text-xs bg-background rounded-xl'
            />
          </div>

          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground font-medium'>{m.payroll_thr_status_label()}</span>
            <div className='flex items-center gap-1 bg-background p-1 rounded-xl border border-border/80'>
              {[
                { id: 'all', label: m.payroll_thr_filter_all() },
                { id: 'active', label: m.payroll_thr_filter_active() },
                { id: 'completed', label: m.payroll_thr_filter_completed() },
                { id: 'paused', label: m.payroll_thr_filter_paused() },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  type='button'
                  size='xs'
                  variant={statusFilter === filter.id ? 'default' : 'ghost'}
                  aria-pressed={statusFilter === filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Table of Installment Schedules */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/30 text-xs border-b border-border/60 whitespace-nowrap'>
                <TableHead className='font-bold text-muted-foreground py-3.5 pl-6'>{m.payroll_thr_col_employee()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_total_thr()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_total_tax()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_tenor_period()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_monthly()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_progress()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_col_balance()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5'>{m.payroll_thr_status_label()}</TableHead>
                <TableHead className='font-bold text-muted-foreground py-3.5 pr-6 text-right'>{m.payroll_thr_col_actions()}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='text-center py-8 text-xs text-muted-foreground'>
                    {m.payroll_thr_schedule_empty()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((item) => {
                  const percent = Math.min(100, Math.round((item.paidInstallments / item.tenorMonths) * 100))
                  return (
                    <TableRow key={item.id} className='text-xs hover:bg-muted/20 border-b border-border/40 whitespace-nowrap'>
                      <TableCell className='py-3.5 pl-6'>
                        <p className='font-bold text-foreground'>{item.employeeName}</p>
                        <p className='text-[10px] text-muted-foreground font-mono mt-0.5'>
                          {item.employeeCode} · {item.department}
                        </p>
                      </TableCell>
                      <TableCell className='py-3.5 font-medium text-foreground'>
                        {formatIDR(item.totalThrAmount)}
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-amber-600 dark:text-amber-400'>
                        {formatIDR(item.totalTaxAmount)}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <p className='font-semibold text-foreground'>{m.payroll_thr_months({ count: item.tenorMonths })}</p>
                        <p className='text-[10px] text-muted-foreground'>{item.startPeriod} – {item.endPeriod}</p>
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-foreground'>
                        {formatIDR(item.installmentPerMonth)}
                      </TableCell>
                      <TableCell className='py-3.5 min-w-[140px]'>
                        <div className='space-y-1.5'>
                          <div className='flex justify-between items-center text-[10px]'>
                            <span className='font-semibold text-foreground'>
                              {m.payroll_thr_month_of({ current: item.paidInstallments, total: item.tenorMonths })}
                            </span>
                            <span className='text-muted-foreground font-mono'>{percent}%</span>
                          </div>
                          <Progress value={percent} className='h-1.5' />
                        </div>
                      </TableCell>
                      <TableCell className='py-3.5 font-bold text-rose-600 dark:text-rose-400'>
                        {formatIDR(item.remainingBalance)}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        {item.currentStatus === 'active' && (
                          <Badge variant='blue' className='text-[10px] font-semibold'>
                            {m.payroll_thr_status_active()}
                          </Badge>
                        )}
                        {item.currentStatus === 'completed' && (
                          <Badge variant='outline' className='text-[10px] font-semibold text-emerald-600 border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'>
                            {m.payroll_thr_filter_completed()}
                          </Badge>
                        )}
                        {item.currentStatus === 'paused' && (
                          <Badge variant='outline' className='text-[10px] font-semibold text-amber-600 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20'>
                            {m.payroll_thr_filter_paused()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='py-3.5 pr-6 text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <TableActionButton
                            tooltip={m.payroll_thr_edit_tooltip()}
                            icon={<IconEdit size={15} />}
                            onClick={() => handleOpenEdit(item)}
                            intent='default'
                          />

                          {item.currentStatus !== 'completed' && (
                            <>
                              <TableActionButton
                                tooltip={item.currentStatus === 'paused' ? m.payroll_thr_resume_tooltip() : m.payroll_thr_pause_tooltip()}
                                icon={item.currentStatus === 'paused' ? <IconPlayerPlay size={15} /> : <IconPlayerPause size={15} />}
                                onClick={() => handleTogglePause(item.id)}
                                intent={item.currentStatus === 'paused' ? 'primary' : 'warning'}
                              />

                              <TableActionButton
                                tooltip={m.payroll_thr_settle_tooltip()}
                                icon={<IconCheck size={15} />}
                                onClick={() => handleSettleFull(item.id)}
                                intent='success'
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Dialog Modal: Add / Edit Installment Schedule ───────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-base font-bold'>
              {editingItem ? m.payroll_thr_edit_dialog_title() : m.payroll_thr_add_dialog_title()}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              {m.payroll_thr_dialog_description()}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveModal} className='space-y-4 py-2 text-xs'>
            {/* Unified Searchable Employee Selector */}
            <div className='space-y-2'>
              <FieldLabel className='font-semibold text-foreground flex items-center justify-between'>
                <span>{m.payroll_thr_select_employee()}</span>
                <span className='text-[10px] text-muted-foreground font-normal'>
                  {m.payroll_thr_select_employee_hint()}
                </span>
              </FieldLabel>

              <Popover modal={true} open={isEmployeePickerOpen} onOpenChange={setIsEmployeePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    role='combobox'
                    aria-expanded={isEmployeePickerOpen}
                    className='w-full justify-between h-10 text-xs rounded-xl font-normal px-3 bg-background hover:bg-muted/40 border-border/80'
                  >
                    {selectedEmployee ? (
                      <div className='flex items-center gap-2 truncate'>
                        <span className='font-semibold text-foreground truncate'>
                          {selectedEmployee.name}
                        </span>
                        <span className='text-muted-foreground font-mono text-[11px]'>
                          ({selectedEmployee.code})
                        </span>
                        <span className='text-muted-foreground/60 text-[11px] truncate'>
                          · {selectedEmployee.department}
                        </span>
                      </div>
                    ) : (
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <IconSearch size={14} className='opacity-60' />
                        <span>{m.payroll_thr_select_employee_placeholder()}</span>
                      </div>
                    )}
                    <IconChevronDown size={14} className='ml-2 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className='w-(--radix-popover-trigger-width) p-2 rounded-2xl gap-2 shadow-xl border border-border/80 bg-popover z-60'
                  align='start'
                  data-radix-scroll-lock-ignore
                  onWheel={(e) => e.stopPropagation()}
                >
                  {/* Search Input Field */}
                  <div className='relative'>
                    <IconSearch className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none' />
                    <Input
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      placeholder={m.payroll_thr_employee_search_placeholder()}
                      className='h-8.5 pl-8 pr-7 text-xs rounded-xl bg-muted/40 focus-visible:bg-background'
                      autoFocus
                    />
                    {employeeSearch && (
                      <Button
                        type='button'
                        onClick={() => setEmployeeSearch('')}
                        className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                      >
                        <IconX size={12} />
                      </Button>
                    )}
                  </div>

                  {/* Employee Options List with ScrollArea and Scroll Lock Ignore */}
                  <ScrollArea
                    className='h-60 pr-1.5'
                    data-radix-scroll-lock-ignore
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <div className='space-y-1 py-0.5'>
                      {filteredEmployeeOptions.length === 0 ? (
                        <div className='py-6 text-center text-xs text-muted-foreground'>
                          {m.payroll_thr_employee_not_found({ search: employeeSearch })}
                        </div>
                      ) : (
                        filteredEmployeeOptions.map((emp) => {
                          const isSelected = modalForm.employeeCode === emp.code
                          return (
                            <Button
                              key={emp.code}
                              type='button'
                              onClick={() => {
                                setModalForm((p) => ({
                                  ...p,
                                  employeeCode: emp.code,
                                  employeeName: emp.name,
                                  department: emp.department,
                                  ...(emp.code !== modalForm.employeeCode
                                    ? {
                                      totalThrAmount: emp.baseSalary,
                                      totalTaxAmount: emp.estimatedThrTax,
                                    }
                                    : {}),
                                }))
                                setIsEmployeePickerOpen(false)
                                setEmployeeSearch('')
                              }}
                              className={cn(
                                'w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer',
                                isSelected
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-muted/60 text-foreground',
                              )}
                            >
                              <div className='flex items-center gap-2.5 min-w-0'>
                                <div
                                  className={cn(
                                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {emp.name.charAt(0)}
                                </div>
                                <div className='min-w-0 flex-1 truncate'>
                                  <p className='text-xs font-semibold leading-tight truncate'>
                                    {emp.name}
                                  </p>
                                  <p className='text-[11px] text-muted-foreground leading-tight truncate'>
                                    <span className='font-mono font-medium'>{emp.code}</span> · {emp.department}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <IconCheck size={16} className='text-primary shrink-0 ml-2' />
                              )}
                            </Button>
                          )
                        })
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Auto-populated Employee Details Card */}
              {selectedEmployee && (
                <div className='flex items-center justify-between rounded-xl border border-border/80 bg-muted/40 p-2.5 transition-all'>
                  <div className='flex items-center gap-2.5'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs'>
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <p className='font-semibold text-foreground text-xs leading-tight'>
                        {selectedEmployee.name}
                      </p>
                      <p className='text-[11px] text-muted-foreground'>
                        NIK: <span className='font-mono font-medium'>{selectedEmployee.code}</span> · {selectedEmployee.position}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-[10px] bg-background font-medium'>
                      {selectedEmployee.department}
                    </Badge>
                    <Button
                      type='button'
                      onClick={() => {
                        setModalForm((p) => ({
                          ...p,
                          employeeCode: '',
                          employeeName: '',
                          department: '',
                          totalThrAmount: 0,
                          totalTaxAmount: 0,
                        }))
                      }}
                      className='p-1 text-muted-foreground hover:text-destructive transition-colors rounded-md'
                      title={m.payroll_thr_clear_employee()}
                    >
                      <IconX size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <Field data-disabled>
                <FieldLabel htmlFor='thr-schedule-amount' className='font-semibold text-foreground'>
                  {m.payroll_thr_gross_field()}
                </FieldLabel>
                <Input
                  id='thr-schedule-amount'
                  type='number'
                  value={modalForm.totalThrAmount}
                  className='h-9 text-xs rounded-xl'
                  disabled
                />
              </Field>

              <Field data-disabled>
                <FieldLabel htmlFor='thr-schedule-tax' className='font-semibold text-foreground'>
                  {m.payroll_thr_tax_field()}
                </FieldLabel>
                <Input
                  id='thr-schedule-tax'
                  type='number'
                  value={modalForm.totalTaxAmount}
                  className='h-9 text-xs rounded-xl'
                  disabled
                />
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <FieldLabel className='font-semibold text-foreground'>{m.payroll_thr_tenor_field()}</FieldLabel>
                <Select
                  value={String(modalForm.tenorMonths)}
                  onValueChange={(val) =>
                    setModalForm((p) => ({ ...p, tenorMonths: parseInt(val, 10) }))
                  }
                >
                  <SelectTrigger className='h-9 text-xs rounded-xl'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                    <SelectItem value='1'>{m.payroll_thr_tenor_1_full()}</SelectItem>
                    <SelectItem value='2'>{m.payroll_thr_months({ count: 2 })}</SelectItem>
                    <SelectItem value='3'>{m.payroll_thr_tenor_3_standard()}</SelectItem>
                    <SelectItem value='4'>{m.payroll_thr_months({ count: 4 })}</SelectItem>
                    <SelectItem value='6'>{m.payroll_thr_months({ count: 6 })}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <FieldLabel className='font-semibold text-foreground'>{m.payroll_thr_start_period()}</FieldLabel>
                <Input
                  value={modalForm.startPeriod}
                  onChange={(e) => setModalForm((p) => ({ ...p, startPeriod: e.target.value }))}
                  placeholder={m.payroll_thr_start_period_example()}
                  className='h-9 text-xs rounded-xl'
                />
              </div>
            </div>

            {/* Calculated Preview Card */}
            <div className='p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs'>
              <div>
                <p className='text-muted-foreground text-[10px] font-medium'>{m.payroll_thr_estimated_monthly()}</p>
                <p className='text-sm font-bold text-primary mt-0.5'>
                  {formatIDR(Math.round(modalForm.totalTaxAmount / (modalForm.tenorMonths || 1)))}
                </p>
              </div>
              <Badge variant='outline' className='text-[10px] bg-background font-mono'>
                {m.payroll_thr_payment_count({ count: modalForm.tenorMonths })}
              </Badge>
            </div>

            <div className='space-y-1.5'>
              <FieldLabel className='font-semibold text-foreground'>{m.payroll_thr_notes()}</FieldLabel>
              <Input
                value={modalForm.notes}
                onChange={(e) => setModalForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder={m.payroll_thr_notes_placeholder()}
                className='h-9 text-xs rounded-xl'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsModalOpen(false)}
                className='h-9 text-xs rounded-xl'
              >
                {m.payroll_wizard_cancel()}
              </Button>
              <Button type='submit' className='h-9 text-xs font-semibold rounded-xl'>
                {m.payroll_thr_save_schedule()}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
