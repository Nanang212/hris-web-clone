// src/features/payroll/components/bpjs-kes-billing-panel.tsx
// Upload tagihan BPJS Kesehatan per periode + pratinjau pencocokan (Nopeg) + history upload bulanan.
// Dipakai di: Configuration > BPJS Kesehatan dan wizard Create Payroll.
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconRefresh,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { useMemo, useRef, useState } from 'react'
import { initialPayrollEmployeeInputs } from '../data/mock-payroll-inputs'
import { formatIDR } from '../data/mock-payroll-data'
import { downloadBillingTemplate, parseBillingFile } from '../lib/bpjs-kes-billing-excel'
import { computeBillingAmounts } from '../lib/bpjs-kes-billing-calc'
import { matchBillingToEmployees } from '../lib/bpjs-kes-billing-match'
import { bpjsKesConfigForPeriod } from '../lib/bpjs-effective'
import { usePayrollBpjsBillingStore } from '../store/payroll-bpjs-billing-store'
import { usePayrollBpjsStore } from '../store/payroll-bpjs-store'
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
}

export function BpjsKesBillingPanel({ periodKey, periodLabel }: BpjsKesBillingPanelProps) {
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

  const fileInputRef = useRef<HTMLInputElement>(null)
  /** Periode tujuan upload berikutnya (periode aktif, atau baris history yang direvisi). */
  const targetPeriodRef = useRef(periodKey)
  const [isParsing, setIsParsing] = useState(false)
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [project, setProject] = useState(ALL_PROJECTS)

  const projects = useMemo(
    () => Array.from(new Set(initialPayrollEmployeeInputs.map((e) => e.project))).sort(),
    [],
  )

  const match = useMemo(
    () => matchBillingToEmployees(initialPayrollEmployeeInputs, upload?.records ?? []),
    [upload],
  )

  const visibleRows = match.rows.filter(
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
    event.target.value = '' // izinkan upload ulang file yang sama
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

  return (
    <div className='rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden'>
      <div className='p-5 border-b border-border/60 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='text-sm font-bold text-foreground'>Upload Tagihan BPJS Kesehatan</h3>
          <p className='text-xs text-muted-foreground mt-0.5 max-w-xl'>
            Periode <span className='font-semibold text-foreground'>{periodLabel}</span>. Template
            berisi Nopeg, NIK KTP, No BPJS Kesehatan, Upah BPJS, dan Pot Keluarga Tambahan. Potongan karyawan{' '}
            <b>{bpjsKesConfig.employeeRatePercent}%</b> dan bagian perusahaan{' '}
            <b>{bpjsKesConfig.companyRatePercent}%</b> dihitung dari Upah BPJS (maks.{' '}
            {formatIDR(bpjsKesConfig.maxWageCap)}).
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Select value={project} onValueChange={setProject}>
            <SelectTrigger className='h-9 w-44 text-xs rounded-xl'>
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
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='gap-1.5 h-9 text-xs font-semibold rounded-xl'
            onClick={handleDownloadTemplate}
          >
            <IconDownload size={15} />
            Unduh template
          </Button>
          <Button
            type='button'
            size='sm'
            className='gap-1.5 h-9 text-xs font-semibold rounded-xl'
            disabled={isParsing}
            onClick={() => openPicker(periodKey)}
          >
            <IconUpload size={15} />
            {upload ? 'Ganti File' : 'Upload tagihan Excel'}
          </Button>
          <input
            ref={fileInputRef}
            type='file'
            accept='.xlsx,.xls'
            className='hidden'
            onChange={handleFileChange}
          />
        </div>
      </div>

      {!upload ? (
        <div className='p-8 flex flex-col items-center text-center gap-2'>
          <span className='p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/30'>
            <IconAlertTriangle size={22} />
          </span>
          <p className='text-sm font-bold text-foreground'>
            Tagihan BPJS Kesehatan {periodLabel} belum diupload
          </p>
          <p className='text-xs text-muted-foreground max-w-md'>
            Payroll periode ini belum bisa dihitung sebelum tagihan diupload. Unduh template, isi
            Nopeg dan Upah BPJS, lalu upload.
          </p>
        </div>
      ) : (
        <div className='p-5 space-y-4'>
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
                {visibleRows.map(({ employee, record, issues }) => {
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
                            <IconAlertTriangle size={14} /> Belum ada tagihan — periksa
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
        </div>
      )}

      {/* ── History upload bulanan ── */}
      {history.length > 0 && (
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
