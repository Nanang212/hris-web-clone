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
import {
  Select,
  SelectContent,
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

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

/** "2026-07" -> "Juli 2026" */
const labelFromPeriodKey = (key: string) => {
  const [year, month] = key.split('-')
  return `${MONTHS[Number(month) - 1] ?? month} ${year}`
}

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
        fileName: `Otomatis-Sistem-${periodKey}.xlsx`,
        uploadedAt: new Date().toLocaleString('id-ID'),
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
        snackbar.error('Tidak ada data tagihan yang valid pada file ini.')
        return
      }
      setUpload({
        periodKey: targetKey,
        fileName: file.name,
        uploadedAt: new Date().toLocaleString('id-ID'),
        records,
      })
      setMode('upload')
      snackbar.success(`${records.length} baris tagihan BPJS Kesehatan ${targetLabel} berhasil diupload.`)
    } catch {
      snackbar.error('Gagal membaca file. Pastikan formatnya Excel (.xlsx / .xls).')
    } finally {
      setIsParsing(false)
    }
  }

  const handleRemove = (targetKey: string) => {
    removeUpload(targetKey)
    if (targetKey === periodKey) setParseErrors([])
    snackbar.info(`Tagihan BPJS Kesehatan ${labelFromPeriodKey(targetKey)} dihapus.`)
  }

  const handleDownloadTemplate = () => {
    try {
      downloadBillingTemplate(periodLabel, bpjsKesConfig)
      snackbar.success('Template tagihan BPJS Kesehatan berhasil didownload.')
    } catch {
      snackbar.error('Gagal mendownload template Excel.')
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
      fileName: `Otomatis-Sistem-${periodKey}.xlsx`,
      uploadedAt: new Date().toLocaleString('id-ID'),
      records,
    })
    snackbar.success(`Data BPJS Kesehatan periode ${periodLabel} (${records.length} karyawan) berhasil disimpan ke sistem!`)
  }

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-0'>
      {/* ── Mode Switcher & Card Header ── */}
      <div className='p-5 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-bold text-foreground'>
              Kalkulasi Otomatis BPJS Kesehatan
            </h3>
            <Badge variant='emerald'>Otomatis dari Master Upah</Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-xl'>
            Periode <span className='font-semibold text-foreground'>{periodLabel}</span>. Potongan karyawan{' '}
            <b>{bpjsKesConfig.employeeRatePercent}%</b> dan bagian perusahaan{' '}
            <b>{bpjsKesConfig.companyRatePercent}%</b> dihitung otomatis dari Upah BPJS (maks.{' '}
            {formatIDR(bpjsKesConfig.maxWageCap)}).
          </p>
        </div>

        {/* Di wizard: tidak menampilkan toggle upload/e-Dabu agar alur bersih & otomatis */}
        {!isWizard && (
          <div className='flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60'>
            <button
              type='button'
              onClick={() => setMode('auto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'auto'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconSparkles size={14} className={mode === 'auto' ? 'text-emerald-600' : ''} />
              <span>Kalkulasi Otomatis</span>
              <span className='px-1.5 py-0.2 text-[9px] rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold'>
                Default
              </span>
            </button>
            <button
              type='button'
              onClick={() => setMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'upload'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconFileSpreadsheet size={14} className={mode === 'upload' ? 'text-primary' : ''} />
              <span>Upload File (e-Dabu)</span>
              {upload && (
                <span className='px-1.5 py-0.2 text-[9px] rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold'>
                  {upload.records.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Sub Header Filter & Action Bar ── */}
      <div className='px-5 py-3 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-semibold text-muted-foreground'>Filter Project:</span>
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
              {ALL_PROJECTS && <SelectItem value={ALL_PROJECTS}>Semua project</SelectItem>}
              {projects.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
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
                <span>Otomatis Tersimpan di Sistem</span>
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
                Unduh template
              </Button>
              <Button
                type='button'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                onClick={handleSaveData}
              >
                <IconDeviceFloppy size={14} />
                Simpan Data
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
                Unduh template
              </Button>
              <Button
                type='button'
                size='sm'
                className='gap-1.5 h-8.5 text-xs font-semibold rounded-xl'
                disabled={isParsing}
                onClick={() => openPicker(periodKey)}
              >
                <IconUpload size={14} />
                {upload ? 'Ganti File Excel' : 'Upload tagihan Excel'}
              </Button>
              <input
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
          <div className='p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3.5 text-xs'>
            <div className='p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5'>
              <IconShieldCheck size={20} />
            </div>
            <div className='space-y-1 min-w-0'>
              <div className='flex items-center gap-2'>
                <p className='font-bold text-foreground'>
                  Perhitungan Iuran BPJS Kesehatan Otomatis Aktif
                </p>
                <Badge variant='emerald'>Siap Diproses</Badge>
              </div>
              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                Sistem menghitung otomatis iuran BPJS Kesehatan dari data <strong>Master Upah</strong> karyawan aktif
                (Upah Pokok dibatasi batas maksimal Rp 12.000.000). Iuran karyawan <strong>1%</strong> dipotong dari Take Home Pay (THP),
                dan bagian perusahaan <strong>4%</strong> ditanggung perusahaan. Data langsung tersimpan di sistem tanpa perlu upload manual.
              </p>
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>Peserta Aktif</p>
              <p className='text-base font-bold text-foreground'>{autoSummary.count} Karyawan</p>
              <p className='text-[10px] text-muted-foreground'>Terdaftar BPJS Kes</p>
            </div>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>Dasar Upah Terdaftar</p>
              <p className='text-base font-bold text-foreground'>{formatIDR(autoSummary.totalWage)}</p>
              <p className='text-[10px] text-muted-foreground'>Setelah Cap Rp 12M</p>
            </div>
            <div className='p-3.5 rounded-xl border border-rose-500/20 bg-rose-50/30 dark:bg-rose-950/10 space-y-1'>
              <p className='text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400'>
                Iuran Karyawan (1%)
              </p>
              <p className='text-base font-bold text-rose-600 dark:text-rose-400'>
                {formatIDR(autoSummary.totalEmployee)}
              </p>
              <p className='text-[10px] text-muted-foreground'>Dipotong dari gaji THP</p>
            </div>
            <div className='p-3.5 rounded-xl border border-border/70 bg-card space-y-1'>
              <p className='text-[10px] uppercase font-bold text-muted-foreground'>
                Iuran Perusahaan (4%)
              </p>
              <p className='text-base font-bold text-foreground'>
                {formatIDR(autoSummary.totalEmployer)}
              </p>
              <p className='text-[10px] text-muted-foreground'>Ditanggung Perusahaan</p>
            </div>
            <div className='p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-1'>
              <p className='text-[10px] uppercase font-bold text-primary'>Total Iuran (5%)</p>
              <p className='text-base font-bold text-primary'>{formatIDR(autoSummary.totalGrand)}</p>
              <p className='text-[10px] text-muted-foreground'>Disetor ke BPJS Kes</p>
            </div>
          </div>

          {/* Table Preview */}
          <div className='rounded-xl border border-border/70 overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                  <TableHead className='font-bold text-muted-foreground pl-4'>Karyawan</TableHead>
                  <TableHead className='font-bold text-muted-foreground'>Project</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>Upah Pokok Master</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Dasar Upah (Maks. {formatIDR(bpjsKesConfig.maxWageCap)})
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Karyawan (1%)
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Perusahaan (4%)
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Total Tagihan (5%)
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Dipotong dari THP
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground pr-4'>Status</TableHead>
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
                      <span className='inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold'>
                        <IconCircleCheck size={14} /> Otomatis dari Master
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <TablePagination
              itemLabel='karyawan'
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
                  File Tagihan Resmi e-Dabu Belum Diupload
                </p>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Upload tagihan resmi e-Dabu jika perusahaan ingin mencocokkan data tagihan BPJS Kesehatan atau memotong iuran anggota keluarga tambahan. Jika tidak diupload, perhitungan akan otomatis memakai data Master Upah.
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
                  Pilih & Upload Excel
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-1.5 h-9 text-xs font-semibold rounded-xl text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  onClick={() => setMode('auto')}
                >
                  <IconCheck size={15} />
                  Gunakan Kalkulasi Otomatis Saja
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
                      {upload.records.length} baris · diupload {upload.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='emerald'>{match.rows.length - match.missing.length} cocok</Badge>
                  {match.missing.length > 0 && (
                    <Badge variant='amber'>{match.missing.length} belum ada tagihan</Badge>
                  )}
                  {match.issueCount > 0 && (
                    <Badge variant='amber'>{match.issueCount} identitas bermasalah</Badge>
                  )}
                  {match.unmatched.length > 0 && (
                    <Badge variant='red'>{match.unmatched.length} tidak cocok</Badge>
                  )}
                </div>
              </div>

              {parseErrors.length > 0 && (
                <div className='p-3 rounded-xl border border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20 text-[11px] text-amber-900 dark:text-amber-300 space-y-0.5'>
                  <p className='font-bold'>{parseErrors.length} baris dilewati:</p>
                  {parseErrors.slice(0, 5).map((err) => (
                    <p key={err}>• {err}</p>
                  ))}
                  {parseErrors.length > 5 && <p>… dan {parseErrors.length - 5} lainnya</p>}
                </div>
              )}

              <p className='text-[11px] text-muted-foreground'>
                <b>Nilai Tagihan</b> = Karyawan + Perusahaan + Keluarga Tambahan (total yang ditagih BPJS).{' '}
                <b>Dipotong dari Gaji</b> = Karyawan + Keluarga Tambahan; porsi Perusahaan ditanggung
                perusahaan dan tidak mengurangi gaji bersih.
              </p>

              <div className='rounded-xl border border-border/70 overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                      <TableHead className='font-bold text-muted-foreground pl-4'>Karyawan</TableHead>
                      <TableHead className='font-bold text-muted-foreground'>Project</TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Upah BPJS
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Karyawan ({bpjsKesConfig.employeeRatePercent}%)
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Perusahaan ({bpjsKesConfig.companyRatePercent}%)
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Keluarga Tambahan
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Nilai Tagihan
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground text-right'>
                        Dipotong dari Gaji
                      </TableHead>
                      <TableHead className='font-bold text-muted-foreground pr-4'>Status</TableHead>
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
                              <span
                                title={issues.join(' ')}
                                className='inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold'
                              >
                                <IconAlertTriangle size={14} /> Periksa identitas
                              </span>
                            ) : record ? (
                              <span className='inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold'>
                                <IconCircleCheck size={14} /> Cocok
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold'>
                                <IconAlertTriangle size={14} /> Belum ada tagihan — fallback otomatis
                              </span>
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
                              <p className='font-bold text-foreground'>{record.name || '(tanpa nama)'}</p>
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
                              <span className='inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold'>
                                <IconAlertTriangle size={14} /> Identitas tidak ditemukan
                              </span>
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
          <h4 className='text-xs font-bold text-foreground'>History upload tagihan bulanan</h4>
          <div className='rounded-xl border border-border/70 overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/30 text-xs whitespace-nowrap'>
                  <TableHead className='font-bold text-muted-foreground pl-4'>Bulan – Tahun</TableHead>
                  <TableHead className='font-bold text-muted-foreground'>File</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>Karyawan</TableHead>
                  <TableHead className='font-bold text-muted-foreground text-right'>
                    Nilai Tagihan
                  </TableHead>
                  <TableHead className='font-bold text-muted-foreground pr-4 text-right'>Aksi</TableHead>
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
                          tooltip='Revisi tagihan'
                          icon={<IconRefresh size={15} />}
                          intent='primary'
                          onClick={() => openPicker(item.periodKey)}
                        />
                        <TableActionButton
                          tooltip='Hapus tagihan'
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
