// src/features/payroll/components/bpjs-kes-billing-panel.tsx
// Panel kalkulasi otomatis BPJS Kesehatan dari Master Upah + opsi simpan langsung ke sistem.
// Di wizard Create Payroll: otomatis dihitung & disimpan, tanpa perlu unduh/unggah template Excel.
// Di Configuration: opsi upload file e-Dabu dan history bulanan tetap tersedia.
import {
  IconAlertTriangle,
  IconCheck,
  IconCircleCheck,
  IconDeviceFloppy,
  IconDownload,
  IconFileSpreadsheet,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/id'
import { initialPayrollEmployeeInputs } from '../data/mock-payroll-inputs'
import { formatIDR } from '../data/mock-payroll-data'
import { downloadBillingTemplate, parseBillingFile } from '../lib/bpjs-kes-billing-excel'
import { computeBillingAmounts } from '../lib/bpjs-kes-billing-calc'
import { matchBillingToEmployees } from '../lib/bpjs-kes-billing-match'
import { bpjsKesConfigForPeriod } from '../lib/bpjs-effective'
import { usePayrollBpjsBillingStore } from '../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../store/payroll-bpjs-store'
import type { BpjsKesBillingRecord } from '../types'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { TableActionButton } from '@/shared/components/ui/table-action-button'
import { TablePagination } from '@/shared/components/ui/table-pagination'
import { snackbar } from '@/shared/lib/snackbar'
import { m } from '@/i18n/paraglide/messages'
import { getLocale } from '@/i18n/paraglide/runtime'

/** "2026-07" -> "Juli 2026" */
const labelFromPeriodKey = (key: string) => dayjs(`${key}-01`).locale(getLocale()).format('MMMM YYYY')

const ALL_PROJECTS = '__all__'

interface BpjsKesBillingPanelProps {
  periodKey: string
  periodLabel: string
  isWizard?: boolean
}

export function BpjsKesBillingPanel({
  periodKey,
  periodLabel,
  isWizard = false,
}: BpjsKesBillingPanelProps) {
  const uploads = usePayrollBpjsBillingStore((s) => s.uploads)
  const setUpload = usePayrollBpjsBillingStore((s) => s.setUpload)
  const removeUpload = usePayrollBpjsBillingStore((s) => s.removeUpload)
  const baseKesConfig = usePayrollBpjsStore((s) => s.bpjsKesConfig)
  const wageCapRules = usePayrollBpjsStore((s) => s.wageCapRules)

  // Cap mengikuti tanggal berlaku periode yang dipilih
  const bpjsKesConfig = useMemo(
    () => bpjsKesConfigForPeriod(baseKesConfig, wageCapRules, periodKey),
    [baseKesConfig, wageCapRules, periodKey],
  )
  const upload = uploads[periodKey]

  // Mode kalkulasi: di wizard selalu 'auto', di konfigurasi bisa switch
  const [mode, setMode] = useState<'auto' | 'upload'>(isWizard ? 'auto' : upload ? 'upload' : 'auto')
  const isAutoMode = isWizard || mode === 'auto'

  const fileInputRef = useRef<HTMLInputElement>(null)
  const targetPeriodRef = useRef(periodKey)
  const [isParsing, setIsParsing] = useState(false)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [project, setProject] = useState(ALL_PROJECTS)

  const projects = useMemo(
    () => Array.from(new Set(initialPayrollEmployeeInputs.map((e) => e.project))).sort(),
    [],
  )

  // ── Mode Otomatis: Dihitung langsung dari data master karyawan ──
  const autoRows = useMemo(() => {
    return initialPayrollEmployeeInputs
      .filter((emp) => emp.bpjs.kesActive)
      .map((emp) => {
        const cappedWage = Math.min(emp.baseSalary, bpjsKesConfig.maxWageCap)
        const employeeShare = Math.round((cappedWage * bpjsKesConfig.employeeRatePercent) / 100)
        const employerShare = Math.round((cappedWage * bpjsKesConfig.companyRatePercent) / 100)
        const total = employeeShare + employerShare
        return {
          employee: emp,
          cappedWage,
          employeeShare,
          employerShare,
          total,
        }
      })
  }, [bpjsKesConfig])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const visibleAutoRows = useMemo(() => {
    return autoRows.filter(
      (row) => project === ALL_PROJECTS || row.employee.project === project,
    )
  }, [autoRows, project])

  const paginatedAutoRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return visibleAutoRows.slice(start, start + pageSize)
  }, [visibleAutoRows, currentPage, pageSize])

  const autoSummary = useMemo(() => {
    return {
      count: autoRows.length,
      totalWage: autoRows.reduce((acc, r) => acc + r.cappedWage, 0),
      totalEmployee: autoRows.reduce((acc, r) => acc + r.employeeShare, 0),
      totalEmployer: autoRows.reduce((acc, r) => acc + r.employerShare, 0),
      totalGrand: autoRows.reduce((acc, r) => acc + r.total, 0),
    }
  }, [autoRows])

  // Otomatis sinkronkan hasil hitungan master ke store (agar data langsung siap tanpa upload)
  useEffect(() => {
    if (isWizard && autoRows.length > 0 && !upload) {
      const records: BpjsKesBillingRecord[] = autoRows.map((r) => ({
        nopeg: r.employee.nopeg,
        nik: r.employee.nik,
        bpjsNumber: r.employee.bpjs.kesParticipantNumber,
        name: r.employee.name,
        bpjsWage: r.cappedWage,
        familyExtra: 0,
      }))
      setUpload({
        periodKey,
        fileName: m.payroll_billing_auto_filename({ period: periodKey }),
        uploadedAt: dayjs().locale(getLocale()).format('DD MMM YYYY HH:mm'),
        records,
      })
    }
  }, [isWizard, periodKey, autoRows, upload, setUpload])

  // ── Mode Upload: Dicocokkan dari file upload Excel (hanya untuk halaman setting) ──
  const match = useMemo(
    () => matchBillingToEmployees(initialPayrollEmployeeInputs, upload?.records ?? []),
    [upload],
  )

  const visibleUploadedRows = match.rows.filter(
    (row) => project === ALL_PROJECTS || row.employee.project === project,
  )

  const history = useMemo(
    () =>
      Object.values(uploads)
        .sort((a, b) => b.periodKey.localeCompare(a.periodKey))
        .map((item) => ({
          ...item,
          total: item.records.reduce(
            (acc, record) => acc + computeBillingAmounts(record, bpjsKesConfig).total,
            0,
          ),
        })),
    [uploads, bpjsKesConfig],
  )

  const openPicker = (targetPeriodKey: string) => {
    targetPeriodRef.current = targetPeriodKey
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const targetKey = targetPeriodRef.current
    const targetLabel = labelFromPeriodKey(targetKey)
    setIsParsing(true)
    try {
      const { records, errors } = await parseBillingFile(file)
      setParseErrors(errors)
      if (records.length === 0) {
        snackbar.error(m.payroll_billing_no_valid_rows())
        return
      }
      setUpload({
        periodKey: targetKey,
        fileName: file.name,
        uploadedAt: dayjs().locale(getLocale()).format('DD MMM YYYY HH:mm'),
        records,
      })
      setMode('upload')
      snackbar.success(m.payroll_billing_uploaded({ count: records.length, period: targetLabel }))
    } catch {
      snackbar.error(m.payroll_billing_read_error())
    } finally {
      setIsParsing(false)
    }
  }

  const handleRemove = (targetKey: string) => {
    removeUpload(targetKey)
    if (targetKey === periodKey) setParseErrors([])
    snackbar.info(m.payroll_billing_removed({ period: labelFromPeriodKey(targetKey) }))
  }

  const handleDownloadTemplate = () => {
    try {
      downloadBillingTemplate(periodLabel, bpjsKesConfig)
      snackbar.success(m.payroll_billing_template_downloaded())
    } catch {
      snackbar.error(m.payroll_billing_template_error())
    }
  }

  // Tombol "Simpan Data" langsung menyimpan data hitungan otomatis
  const handleSaveData = () => {
    const records: BpjsKesBillingRecord[] = autoRows.map((r) => ({
      nopeg: r.employee.nopeg,
      nik: r.employee.nik,
      bpjsNumber: r.employee.bpjs.kesParticipantNumber,
      name: r.employee.name,
      bpjsWage: r.cappedWage,
      familyExtra: 0,
    }))
    setUpload({
      periodKey,
      fileName: m.payroll_billing_auto_filename({ period: periodKey }),
      uploadedAt: dayjs().locale(getLocale()).format('DD MMM YYYY HH:mm'),
      records,
    })
    snackbar.success(m.payroll_billing_saved({ period: periodLabel, count: records.length }))
  }

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-0'>
      {/* ── Mode Switcher & Card Header ── */}
      <div className='p-5 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-bold text-foreground'>
              {m.payroll_billing_title()}
            </h3>
            <Badge variant='emerald'>{m.payroll_billing_from_salary_master()}</Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-xl'>
            {m.payroll_billing_description({ period: periodLabel, employeeRate: bpjsKesConfig.employeeRatePercent, employerRate: bpjsKesConfig.companyRatePercent, cap: formatIDR(bpjsKesConfig.maxWageCap) })}
          </p>
        </div>

        {/* Di wizard: tidak menampilkan toggle upload/e-Dabu agar alur bersih & otomatis */}
        {!isWizard && (
          <div className='flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60'>
            <Button
              type='button'
              variant={mode === 'auto' ? 'secondary' : 'ghost'}
              size='sm'
              aria-pressed={mode === 'auto'}
              onClick={() => setMode('auto')}
              className='rounded-lg'
            >
              <IconSparkles data-icon='inline-start' />
              <span>{m.payroll_billing_auto_mode()}</span>
              <Badge variant='green'>
                {m.payroll_billing_default()}
              </Badge>
            </Button>
            <Button
              type='button'
              variant={mode === 'upload' ? 'secondary' : 'ghost'}
              size='sm'
              aria-pressed={mode === 'upload'}
              onClick={() => setMode('upload')}
              className='rounded-lg'
            >
              <IconFileSpreadsheet data-icon='inline-start' />
              <span>{m.payroll_billing_upload_mode()}</span>
              {upload && (
                <Badge variant='blue'>
                  {upload.records.length}
                </Badge>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* ── Sub Header Filter & Action Bar ── */}
      <div className='px-5 py-3 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-semibold text-muted-foreground'>{m.payroll_billing_project_filter()}</span>
          <Select
            value={project}
            onValueChange={(val) => {
              setProject(val)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className='h-8.5 w-44 text-xs rounded-xl bg-background'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
              <SelectItem value={ALL_PROJECTS}>{m.payroll_billing_all_projects()}</SelectItem>
              {projects.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Action Controls */}
        <div className='flex flex-wrap items-center gap-2'>
          {isWizard ? (
            /* Di wizard: Cukup status tersimpan otomatis tanpa tombol simpan manual */
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold'>
                <IconCircleCheck size={16} className='text-emerald-600 dark:text-emerald-400' />
                <span>{m.payroll_billing_auto_saved()}</span>
              </span>
            </div>
          ) : mode === 'auto' ? (
            /* Di halaman Konfigurasi */
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                onClick={handleDownloadTemplate}
              >
                <IconDownload size={14} />
                {m.payroll_billing_download_template()}
              </Button>
              <Button
                type='button'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                onClick={handleSaveData}
              >
                <IconDeviceFloppy size={14} />
                {m.payroll_billing_save_data()}
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                onClick={handleDownloadTemplate}
              >
                <IconDownload size={14} />
                {m.payroll_billing_download_template()}
              </Button>
              <Button
                type='button'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                disabled={isParsing}
                onClick={() => openPicker(periodKey)}
              >
                <IconUpload size={14} />
                {upload ? m.payroll_billing_replace_excel() : m.payroll_billing_upload_excel()}
              </Button>
              <Input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── MODE 1: KALKULASI OTOMATIS DARI MASTER UPAH ── */}
      {(isWizard || isAutoMode) && (
        <div className='p-5 space-y-5'>
          {/* Info Banner */}
          <Alert variant='success' className='items-start'>
            <AlertIcon><IconShieldCheck /></AlertIcon>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <AlertTitle>
                  {m.payroll_billing_auto_active()}
                </AlertTitle>
                <Badge variant='emerald'>{m.payroll_billing_ready()}</Badge>
              </div>
              <AlertDescription>
                {m.payroll_billing_auto_description({ cap: formatIDR(bpjsKesConfig.maxWageCap), employeeRate: bpjsKesConfig.employeeRatePercent, employerRate: bpjsKesConfig.companyRatePercent })}
              </AlertDescription>
            </div>
          </Alert>

          {/* Quick Stat Cards */}
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>{m.payroll_billing_active_participants()}</p>
              <p className='text-base font-bold text-foreground'>{m.payroll_run_detail_employee_count({ count: autoSummary.count })}</p>
              <p className='text-[10px] text-muted-foreground'>{m.payroll_billing_registered()}</p>
            </div>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>{m.payroll_billing_wage_base()}</p>
              <p className='text-base font-bold text-foreground'>{formatIDR(autoSummary.totalWage)}</p>
              <p className='text-[10px] text-muted-foreground'>{m.payroll_billing_after_cap({ cap: formatIDR(bpjsKesConfig.maxWageCap) })}</p>
            </div>
            <div className='p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10 space-y-1'>
              <p className='text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400'>
                {m.payroll_billing_employee_contribution({ rate: bpjsKesConfig.employeeRatePercent })}
              </p>
              <p className='text-base font-bold text-rose-600 dark:text-rose-400'>
                {formatIDR(autoSummary.totalEmployee)}
              </p>
              <p className='text-[10px] text-muted-foreground'>{m.payroll_billing_deducted_from_pay()}</p>
            </div>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                {m.payroll_billing_employer_contribution({ rate: bpjsKesConfig.companyRatePercent })}
              </p>
              <p className='text-base font-bold text-foreground'>
                {formatIDR(autoSummary.totalEmployer)}
              </p>
              <p className='text-[10px] text-muted-foreground'>{m.payroll_billing_paid_by_company()}</p>
            </div>
            <div className='p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1'>
              <p className='text-[10px] uppercase font-bold text-primary'>{m.payroll_billing_total_contribution({ rate: bpjsKesConfig.employeeRatePercent + bpjsKesConfig.companyRatePercent })}</p>
              <p className='text-base font-bold text-primary'>{formatIDR(autoSummary.totalGrand)}</p>
              <p className='text-[10px] text-muted-foreground'>{m.payroll_billing_remitted()}</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className='rounded-xl border border-border/70 overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                  <TableHead className='font-bold text-muted-foreground pl-4'>{m.payroll_billing_col_employee()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground'>{m.payroll_billing_col_project()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>{m.payroll_billing_col_base_salary()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_col_capped_wage({ cap: formatIDR(bpjsKesConfig.maxWageCap) })}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_employee_contribution({ rate: bpjsKesConfig.employeeRatePercent })}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_employer_contribution({ rate: bpjsKesConfig.companyRatePercent })}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_col_total_bill({ rate: bpjsKesConfig.employeeRatePercent + bpjsKesConfig.companyRatePercent })}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_col_deducted()}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground pr-4'>{m.payroll_billing_col_status()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAutoRows.map(({ employee, cappedWage, employeeShare, employerShare, total }) => (
                  <TableRow key={employee.employeeId} className='text-xs whitespace-nowrap'>
                    <TableCell className='pl-4'>
                      <p className='font-bold text-foreground'>{employee.name}</p>
                      <p className='text-[10px] text-muted-foreground font-mono'>
                        {employee.nopeg} · BPJS: {employee.bpjs.kesParticipantNumber}
                      </p>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{employee.project}</TableCell>
                    <TableCell className='text-right font-medium'>{formatIDR(employee.baseSalary)}</TableCell>
                    <TableCell className='text-right font-semibold text-foreground'>{formatIDR(cappedWage)}</TableCell>
                    <TableCell className='text-right font-semibold text-rose-600 dark:text-rose-400'>
                      {formatIDR(employeeShare)}
                    </TableCell>
                    <TableCell className='text-right'>{formatIDR(employerShare)}</TableCell>
                    <TableCell className='text-right font-bold text-foreground'>{formatIDR(total)}</TableCell>
                    <TableCell className='text-right font-bold text-primary'>{formatIDR(employeeShare)}</TableCell>
                    <TableCell className='pr-4'>
                      <Badge variant='emerald' className='gap-1 font-semibold'><IconCircleCheck size={14} /> {m.payroll_billing_from_master()}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              itemLabel={m.payroll_billing_employee_item()}
              totalItems={visibleAutoRows.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        </div>
      )}

      {/* ── MODE 2: UPLOAD TAGIHAN EXCEL (Hanya di setting jika tidak di wizard) ── */}
      {!isWizard && mode === 'upload' && (
        <div className='p-5 space-y-4'>
          {!upload ? (
            <div className='p-8 flex flex-col items-center text-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/10'>
              <span className='p-3.5 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30'>
                <IconAlertTriangle size={24} />
              </span>
              <div className='space-y-1 max-w-md'>
                <p className='text-sm font-bold text-foreground'>
                  {m.payroll_billing_no_file_title()}
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {m.payroll_billing_no_file_description()}
                </p>
              </div>
              <div className='flex flex-wrap items-center gap-2 pt-2'>
                <Button
                  type='button'
                  size='sm'
                  className='gap-1.5 h-9 text-xs font-semibold rounded-xl'
                  disabled={isParsing}
                  onClick={() => openPicker(periodKey)}
                >
                  <IconUpload size={15} />
                  {m.payroll_billing_choose_upload()}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-1.5 h-9 text-xs font-semibold rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  onClick={() => setMode('auto')}
                >
                  <IconCheck size={15} />
                  {m.payroll_billing_use_auto()}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* File Info Bar */}
              <div className='flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-muted/20'>
                <div className='flex items-center gap-3 min-w-0'>
                  <span className='p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'>
                    <IconFileSpreadsheet size={18} />
                  </span>
                  <div className='min-w-0'>
                    <p className='text-xs font-bold text-foreground truncate'>{upload.fileName}</p>
                    <p className='text-[11px] text-muted-foreground'>
                      {m.payroll_billing_uploaded_at({ count: upload.records.length, date: upload.uploadedAt })}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='emerald'>{m.payroll_billing_matched({ count: match.rows.length - match.missing.length })}</Badge>
                  {match.missing.length > 0 && (
                    <Badge variant='amber'>{m.payroll_billing_missing({ count: match.missing.length })}</Badge>
                  )}
                  {match.issueCount > 0 && (
                    <Badge variant='amber'>{m.payroll_billing_identity_issues({ count: match.issueCount })}</Badge>
                  )}
                  {match.unmatched.length > 0 && (
                    <Badge variant='red'>{m.payroll_billing_unmatched({ count: match.unmatched.length })}</Badge>
                  )}
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className='p-3 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20 text-[11px] text-amber-900 dark:text-amber-300 space-y-0.5'>
                  <p className='font-bold'>{m.payroll_billing_skipped_rows({ count: parseErrors.length })}</p>
                  {parseErrors.slice(0, 5).map((err) => (
                    <p key={err}>• {err}</p>
                  ))}
                  {parseErrors.length > 5 && <p>{m.payroll_billing_more_errors({ count: parseErrors.length - 5 })}</p>}
                </div>
              )}

              <p className='text-[11px] text-muted-foreground'>
                {m.payroll_billing_amount_explanation()}
              </p>

              <div className='rounded-xl border border-border/70 overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                      <TableHead className='font-bold text-muted-foreground pl-4'>{m.payroll_billing_col_employee()}</TableHead>
                      <TableHead className='font-bold text-muted-foreground'>{m.payroll_billing_col_project()}</TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_col_bpjs_wage()}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_employee_contribution({ rate: bpjsKesConfig.employeeRatePercent })}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_employer_contribution({ rate: bpjsKesConfig.companyRatePercent })}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_col_extra_family()}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_col_bill_amount()}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        {m.payroll_billing_col_deducted()}
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground pr-4'>{m.payroll_billing_col_status()}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleUploadedRows.map(({ employee, record, issues }) => {
                      const amounts = record ? computeBillingAmounts(record, bpjsKesConfig) : undefined
                      return (
                        <TableRow key={employee.employeeId} className='text-xs whitespace-nowrap'>
                          <TableCell className='pl-4'>
                            <p className='font-bold text-foreground'>{employee.name}</p>
                            <p className='text-[10px] text-muted-foreground font-mono'>{employee.nopeg}</p>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>{employee.project}</TableCell>
                          <TableCell className='text-right'>
                            {record ? formatIDR(record.bpjsWage) : '-'}
                          </TableCell>
                          <TableCell className='text-right'>
                            {amounts ? formatIDR(amounts.employeeShare) : '-'}
                          </TableCell>
                          <TableCell className='text-right'>
                            {amounts ? formatIDR(amounts.employerShare) : '-'}
                          </TableCell>
                          <TableCell className='text-right'>
                            {amounts ? formatIDR(amounts.familyExtra) : '-'}
                          </TableCell>
                          <TableCell className='text-right font-bold text-foreground'>
                            {amounts ? formatIDR(amounts.total) : '-'}
                          </TableCell>
                          <TableCell className='text-right font-bold text-primary'>
                            {amounts ? formatIDR(amounts.employeeShare + amounts.familyExtra) : '-'}
                          </TableCell>
                          <TableCell className='pr-4'>
                            {record && issues.length > 0 ? (
                              <Badge
                                variant='amber'
                                title={issues.join(' ')}
                                className='gap-1 font-semibold'
                              >
                                <IconAlertTriangle size={14} /> {m.payroll_billing_check_identity()}
                              </Badge>
                            ) : record ? (
                              <Badge variant='emerald' className='gap-1 font-semibold'><IconCircleCheck size={14} /> {m.payroll_billing_match()}</Badge>
                            ) : (
                              <Badge variant='amber' className='gap-1 font-semibold'><IconAlertTriangle size={14} /> {m.payroll_billing_fallback()}</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {project === ALL_PROJECTS &&
                      match.unmatched.map((record) => {
                        const amounts = computeBillingAmounts(record, bpjsKesConfig)
                        return (
                          <TableRow
                            key={`${record.nopeg}-${record.nik}-${record.bpjsNumber}`}
                            className='text-xs whitespace-nowrap bg-red-50/40 dark:bg-red-950/10'
                          >
                            <TableCell className='pl-4'>
                              <p className='font-bold text-foreground'>{record.name || m.payroll_billing_unnamed()}</p>
                              <p className='text-[10px] text-muted-foreground font-mono'>
                                {record.nopeg || record.nik || record.bpjsNumber}
                              </p>
                            </TableCell>
                            <TableCell className='text-muted-foreground'>-</TableCell>
                            <TableCell className='text-right'>{formatIDR(record.bpjsWage)}</TableCell>
                            <TableCell className='text-right'>{formatIDR(amounts.employeeShare)}</TableCell>
                            <TableCell className='text-right'>{formatIDR(amounts.employerShare)}</TableCell>
                            <TableCell className='text-right'>{formatIDR(amounts.familyExtra)}</TableCell>
                            <TableCell className='text-right font-bold text-foreground'>
                              {formatIDR(amounts.total)}
                            </TableCell>
                            <TableCell className='text-right font-bold text-primary'>
                              {formatIDR(amounts.employeeShare + amounts.familyExtra)}
                            </TableCell>
                            <TableCell className='pr-4'>
                              <Badge variant='red' className='gap-1 font-semibold'><IconAlertTriangle size={14} /> {m.payroll_billing_identity_not_found()}</Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── History upload bulanan (Hanya ditampilkan di Setting, tidak di wizard) ── */}
      {!isWizard && history.length > 0 && (
        <div className='p-5 border-t border-border/60 space-y-3'>
          <h4 className='text-xs font-bold text-foreground'>{m.payroll_billing_history_title()}</h4>
          <div className='rounded-xl border border-border/70 overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                  <TableHead className='font-bold text-muted-foreground pl-4'>{m.payroll_billing_col_month_year()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground'>{m.payroll_billing_col_file()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>{m.payroll_billing_col_employee()}</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    {m.payroll_billing_col_bill_amount()}
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground pr-4 text-right'>{m.payroll_billing_col_actions()}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.periodKey} className='text-xs whitespace-nowrap'>
                    <TableCell className='pl-4 font-bold text-foreground'>
                      {labelFromPeriodKey(item.periodKey)}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>{item.fileName}</TableCell>
                    <TableCell className='text-right'>{item.records.length}</TableCell>
                    <TableCell className='text-right font-bold text-foreground'>
                      {formatIDR(item.total)}
                    </TableCell>
                    <TableCell className='pr-4'>
                      <div className='flex items-center justify-end gap-1'>
                        <TableActionButton
                          tooltip={m.payroll_billing_edit_bill()}
                          icon={<IconRefresh size={15} />}
                          intent='primary'
                          onClick={() => openPicker(item.periodKey)}
                        />
                        <TableActionButton
                          tooltip={m.payroll_billing_delete_bill()}
                          icon={<IconTrash size={15} />}
                          intent='danger'
                          onClick={() => handleRemove(item.periodKey)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
