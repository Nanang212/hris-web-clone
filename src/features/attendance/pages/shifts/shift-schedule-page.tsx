import {
  IconAlertCircle,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconDownload,
  IconEye,
  IconFileSpreadsheet,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { ShiftTabs } from '@/features/attendance/components/shift-tabs'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns array of date numbers [1..daysInMonth] for the given year + month (1-indexed). */
function getDatesInMonth(year: number, month: number): number[] {
  const daysInMonth = new Date(year, month, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => i + 1)
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]


/** Build a YYYY-MM string from year + month (1-indexed). */
function makePeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

/** Parse a YYYY-MM string into { year, month (1-indexed), label }. */
function parsePeriod(value: string) {
  const [y, m] = value.split('-').map(Number)
  return { year: y, month: m, label: `${MONTH_NAMES[m - 1]} ${y}`, value }
}

// ─── static mock data ────────────────────────────────────────────────────────

const EMPLOYEES_RAW = [
  {
    nik: 'EMP-014',
    name: 'Andi Pratama',
    project: 'BFP Operations · SPBU A',
    cycleShifts: ['M', 'M', 'E', 'E', 'N', 'N', 'OFF', 'OFF'] as string[],
  },
  {
    nik: 'EMP-021',
    name: 'Rina Sari',
    project: 'BFP Operations · SPBU A',
    cycleShifts: ['E', 'E', 'N', 'N', 'OFF', 'OFF', 'M', 'M'] as string[],
  },
  {
    nik: 'EMP-032',
    name: 'Dodi Saputra',
    project: 'BFP Operations · SPBU B',
    cycleShifts: ['N', 'N', 'OFF', 'M', 'M', 'E', 'E', 'N'] as string[],
  },
]

const shiftOptions = [
  { value: 'M', label: 'Morning', time: '06:00–14:00', badge: 'green' },
  { value: 'E', label: 'Evening', time: '14:00–23:00', badge: 'teal' },
  { value: 'N', label: 'Night', time: '23:00–07:00 (+1)', badge: 'amber' },
  { value: 'OFF', label: 'Day Off', time: '', badge: 'rose' },
] as const

const weekdayRules = [
  ['Mon', 'M'],
  ['Tue', 'M'],
  ['Wed', 'E'],
  ['Thu', 'E'],
  ['Fri', 'N'],
  ['Sat', 'OFF'],
  ['Sun', 'OFF'],
] as const

const cycleRules = ['M', 'M', 'E', 'E', 'N', 'N', 'OFF', 'OFF'] as const

function shiftTone(value?: string) {
  if (value === 'OFF') return 'border-rose-300/80 bg-rose-500/15 text-rose-800 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-300'
  if (value === 'N') return 'border-amber-300/80 bg-amber-500/15 text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300'
  if (value === 'E') return 'border-teal-300/80 bg-teal-500/15 text-teal-800 dark:border-teal-700/60 dark:bg-teal-950/40 dark:text-teal-300'
  if (value === 'M') return 'border-emerald-300/80 bg-emerald-500/15 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  if (value) return 'border-emerald-300/80 bg-emerald-500/15 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300'
  return 'border-border/60 bg-muted/40 text-muted-foreground'
}

/** Generate and download an Excel template (.xlsx) for the monthly shift roster */
function downloadShiftRosterTemplate(periodStr: string) {
  const { year, month } = parsePeriod(periodStr)
  const dates = getDatesInMonth(year, month)

  // Sheet 1: Template Roster
  const headers = ['NIK', 'Nama Karyawan', 'Proyek', ...dates.map((d) => String(d))]

  const sampleData = EMPLOYEES_RAW.map((emp) => {
    const row: (string | number)[] = [emp.nik, emp.name, emp.project]
    dates.forEach((_, idx) => {
      row.push(emp.cycleShifts[idx % emp.cycleShifts.length])
    })
    return row
  })

  const wsRoster = XLSX.utils.aoa_to_sheet([headers, ...sampleData])
  wsRoster['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 28 },
    ...dates.map(() => ({ wch: 5 })),
  ]

  // Sheet 2: Petunjuk & Kode Shift
  const legendData = [
    ['PANDUAN PENGISIAN TEMPLATE SHIFT ROSTER', ''],
    ['', ''],
    ['1. Jangan mengubah nama kolom header pada baris pertama.', ''],
    ['2. Kolom NIK wajib diisi sesuai NIK karyawan terdaftar.', ''],
    ['3. Kolom tanggal (1 sampai ' + dates.length + ') diisi dengan salah satu kode shift valid:', ''],
    ['', ''],
    ['Kode Shift', 'Nama Shift', 'Jam Kerja', 'Keterangan'],
    ['M', 'Morning', '06:00 - 14:00', 'Shift Pagi'],
    ['E', 'Evening', '14:00 - 23:00', 'Shift Siang / Sore'],
    ['N', 'Night', '23:00 - 07:00 (+1)', 'Shift Malam'],
    ['OFF', 'Day Off', '-', 'Libur / Lepas Shift'],
  ]
  const wsLegend = XLSX.utils.aoa_to_sheet(legendData)
  wsLegend['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 22 }, { wch: 30 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsRoster, 'Shift_Roster')
  XLSX.utils.book_append_sheet(wb, wsLegend, 'Petunjuk_Pengisian')

  const MONTH_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  const fileName = `Shift_Roster_Template_${MONTH_ID[month - 1]}_${year}_(${dates.length}_Hari).xlsx`
  XLSX.writeFile(wb, fileName)
}

// ─── page ────────────────────────────────────────────────────────────────────

export function ShiftSchedulePage() {
  const now = new Date()
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [period, setPeriod] = useState(defaultPeriod)
  const [modal, setModal] = useState<'upload' | 'add' | 'edit' | 'detail' | 'pattern' | null>(null)
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false)
  const [editingEmpNik, setEditingEmpNik] = useState<string>('EMP-014')
  const [schedules, setSchedules] = useState<Record<string, Record<number, string>>>({})

  const { year, month, label: periodLabel } = parsePeriod(period)
  const datesInMonth = useMemo(() => getDatesInMonth(year, month), [year, month])

  function handleSaveSchedule(empNik: string, updatedShifts: Record<number, string>) {
    setSchedules((prev) => ({
      ...prev,
      [empNik]: {
        ...(prev[empNik] || {}),
        ...updatedShifts,
      },
    }))
    setModal(null)
    toast.success('Schedule updated successfully')
  }

  function handleDownloadTemplate(targetPeriod = period) {
    downloadShiftRosterTemplate(targetPeriod)
    toast.success('Template Excel shift roster berhasil didownload.')
  }

  return (
    <AppMain
      title='Monthly Shift Schedule'
      subtitle='Build, upload, and edit employee shifting schedules by project and period/month.'
      breadcrumbs={getAttendanceBreadcrumbs('Monthly Shift Schedule')}
      backTo='/attendance/management'
      className='gap-5 bg-muted/30'
    >
      <ShiftTabs active='schedule' />
      <Card className='overflow-visible shadow-sm'>
        <CardContent className='grid gap-4 p-4 md:grid-cols-[auto_1fr_1.2fr_auto_auto] md:items-end'>
          {/* Period: split Month + Year selectors */}
          <div className='grid gap-1.5'>
            <Label className='text-xs text-muted-foreground'>Period</Label>
            <PeriodSelector
              id='schedule-period'
              value={period}
              onChange={setPeriod}
            />
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='schedule-project' className='text-xs text-muted-foreground'>
              Project
            </Label>
            <Select defaultValue='bfp-operations'>
              <SelectTrigger id='schedule-project'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                <SelectItem value='retail-support'>Retail Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='grid gap-1.5'>
            <Label htmlFor='schedule-search' className='text-xs text-muted-foreground'>
              Search Employee
            </Label>
            <Input id='schedule-search' placeholder='Search name / ID' />
          </div>
          <Button variant='outline' onClick={() => setShowTemplateConfirm(true)}>
            <IconFileSpreadsheet />
            Upload Excel
          </Button>
          <Button onClick={() => setModal('add')}>
            <IconPlus />
            Add Schedule
          </Button>
        </CardContent>
      </Card>
      <div className='flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/10 px-4 py-3 text-xs text-primary'>
        <IconInfoCircle className='mt-0.5 size-4 shrink-0' />
        <p>
          Upload Excel (.xlsx) using the template, or add rows manually. Imported cells remain
          editable before and after saving.
        </p>
      </div>
      <Card className='overflow-hidden shadow-sm'>
        <CardHeader className='border-b'>
          <CardTitle>Schedule Preview · {periodLabel} · BFP Operations</CardTitle>
          <p className='text-xs text-muted-foreground'>
            Multiple project shift masters: Morning 06–14 · Evening 14–23 · Night 23–07.
          </p>
        </CardHeader>
        {/*
          Wrapper: `overflow-x-auto` hanya pada area tanggal.
          Kolom NIK / Employee / Project menggunakan `position: sticky`
          agar tetap terlihat saat scroll horizontal.
        */}
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full min-w-max border-collapse text-sm'>
              <thead>
                {/* ── Row 1: fixed-col labels (rowSpan=2) + month grouping header ── */}
                <tr className='border-b bg-muted'>
                  <th
                    rowSpan={2}
                    className='sticky left-0 z-20 w-20 border-r bg-muted px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'
                  >
                    NIK
                  </th>
                  <th
                    rowSpan={2}
                    className='sticky left-20 z-20 w-36 border-r bg-muted px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'
                  >
                    Employee
                  </th>
                  <th
                    rowSpan={2}
                    className='sticky left-56 z-20 w-48 border-r bg-muted px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'
                  >
                    Project / Location
                  </th>
                  {/* Month-group spanning all date columns */}
                  <th
                    colSpan={datesInMonth.length}
                    className='border-b border-r px-3 py-1.5 text-center text-xs font-semibold text-foreground'
                  >
                    {periodLabel}
                  </th>
                  <th
                    rowSpan={2}
                    className='bg-muted px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground'
                  >
                    Action
                  </th>
                </tr>
                {/* ── Row 2: individual date numbers ── */}
                <tr className='border-b bg-muted'>
                  {datesInMonth.map((date) => (
                    <th
                      key={date}
                      className='min-w-[36px] px-1 py-1.5 text-center text-[11px] font-medium text-muted-foreground'
                    >
                      {date}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EMPLOYEES_RAW.map((emp, empIdx) => {
                  const empCustomShifts = schedules[emp.nik] || {}
                  const shifts = datesInMonth.map(
                    (date, i) =>
                      empCustomShifts[date] ?? emp.cycleShifts[i % emp.cycleShifts.length],
                  )
                  // Use solid (opaque) colors — transparent bg bleeds through sticky columns
                  const rowBg = empIdx % 2 === 0 ? 'bg-background' : 'bg-card'
                  const stickyBg = empIdx % 2 === 0 ? 'bg-background' : 'bg-card'
                  return (
                    <tr key={emp.nik} className={`border-b ${rowBg} hover:bg-muted`}>
                      {/* ── Sticky: NIK ── */}
                      <td
                        className={`sticky left-0 z-10 w-20 border-r px-3 py-3 font-mono text-xs font-semibold ${stickyBg}`}
                      >
                        {emp.nik}
                      </td>
                      {/* ── Sticky: Employee ── */}
                      <td
                        className={`sticky left-20 z-10 w-36 border-r px-3 py-3 font-semibold whitespace-nowrap ${stickyBg}`}
                      >
                        {emp.name}
                      </td>
                      {/* ── Sticky: Project / Location ── */}
                      <td
                        className={`sticky left-56 z-10 w-48 border-r px-3 py-3 whitespace-nowrap text-xs text-muted-foreground ${stickyBg}`}
                      >
                        {emp.project}
                      </td>
                      {/* ── Scrollable: shift badges ── */}
                      {shifts.map((shift, index) => (
                        <td key={`${emp.nik}-${index}`} className='px-1 py-2 text-center'>
                          <Badge
                            variant={shift === 'OFF' ? 'rose' : shift === 'N' ? 'amber' : 'green'}
                            className='min-w-[32px] justify-center'
                          >
                            {shift}
                          </Badge>
                        </td>
                      ))}
                      <td className='px-2 py-2 text-center'>
                        <div className='flex items-center justify-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            title='View Detail'
                            onClick={() => {
                              setEditingEmpNik(emp.nik)
                              setModal('detail')
                            }}
                            className='size-8 text-muted-foreground hover:text-primary'
                          >
                            <IconEye className='size-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            title='Edit Row'
                            onClick={() => {
                              setEditingEmpNik(emp.nik)
                              setModal('edit')
                            }}
                            className='size-8 text-muted-foreground hover:text-primary'
                          >
                            <IconPencil className='size-4' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <div className='flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground'>
        <span className='font-semibold text-foreground'>Shift legend</span>
        <span className='flex items-center gap-2'>
          <Badge variant='green'>M</Badge>
          Morning 06–14
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='teal'>E</Badge>
          Evening 14–23
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='amber'>N</Badge>
          Night 23–07 (+1)
        </span>
        <span className='flex items-center gap-2'>
          <Badge variant='rose'>OFF</Badge>
          Day Off
        </span>
        <Button variant='link' size='sm' className='h-auto px-0' asChild>
          <Link to='/attendance/management/shifts/setup'>Edit shift masters</Link>
        </Button>
      </div>
      {showTemplateConfirm && (
        <TemplateConfirmDialog
          period={period}
          onClose={() => setShowTemplateConfirm(false)}
          onProceedUpload={(chosenPeriod) => {
            setPeriod(chosenPeriod)
            setModal('upload')
          }}
          onDownloadTemplate={(chosenPeriod) => handleDownloadTemplate(chosenPeriod)}
        />
      )}
      {modal && (
        <ScheduleDialog
          modal={modal}
          period={period}
          selectedEmpNik={editingEmpNik}
          initialShifts={
            schedules[editingEmpNik] ||
            Object.fromEntries(
              datesInMonth.map((date, idx) => {
                const emp =
                  EMPLOYEES_RAW.find((e) => e.nik === editingEmpNik) || EMPLOYEES_RAW[0]
                return [date, emp.cycleShifts[idx % emp.cycleShifts.length]]
              }),
            )
          }
          onSave={handleSaveSchedule}
          onPeriodChange={setPeriod}
          onClose={() => setModal(null)}
          onPattern={() => setModal('pattern')}
        />
      )}
    </AppMain>
  )
}

// ─── template confirmation dialog ────────────────────────────────────────────

function TemplateConfirmDialog({
  period,
  onClose,
  onProceedUpload,
  onDownloadTemplate,
}: Readonly<{
  period: string
  onClose: () => void
  onProceedUpload: (chosenPeriod: string) => void
  onDownloadTemplate: (chosenPeriod: string) => void
}>) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [downloaded, setDownloaded] = useState(false)

  const { year, month, label: periodLabel } = parsePeriod(selectedPeriod)
  const dates = useMemo(() => getDatesInMonth(year, month), [year, month])
  const daysCount = dates.length

  function handleDownload() {
    onDownloadTemplate(selectedPeriod)
    setDownloaded(true)
  }

  return (
    <Dialog open onOpenChange={(val) => !val && onClose()}>
      <DialogContent className='overflow-hidden p-0 gap-0 sm:max-w-2xl rounded-2xl sm:rounded-3xl border shadow-2xl'>
        {/* ── Dialog Header ── */}
        <div className='border-b bg-muted/40 px-7 py-5 pe-16'>
          <div className='flex items-center gap-4'>
            <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <IconFileSpreadsheet className='size-6' />
            </div>
            <div>
              <DialogTitle className='text-base font-semibold'>
                Upload Shift Roster Excel
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                Template Excel dibuat spesifik per bulan mengikuti jumlah hari kalender ({daysCount} Hari).
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* ── Dialog Body ── */}
        <div className='p-7 space-y-4 text-xs'>
          {/* Card 1: Periode & Jumlah Tanggal Dinamis */}
          <div className='rounded-xl border bg-card/60 p-4 space-y-3 shadow-2xs'>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <Label htmlFor='confirm-template-period' className='font-semibold text-foreground text-xs'>
                Periode Template Roster
              </Label>
              <Badge variant='outline' className='font-mono font-semibold text-[11px] bg-primary/10 text-primary border-primary/25'>
                {daysCount} Hari Kalender (Tgl 1 – {daysCount})
              </Badge>
            </div>
            <div className='grid sm:grid-cols-[1fr_1.3fr] gap-3 items-center'>
              <PeriodSelector
                id='confirm-template-period'
                value={selectedPeriod}
                onChange={(p) => {
                  setSelectedPeriod(p)
                  setDownloaded(false)
                }}
              />
              <div className='rounded-lg bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground leading-relaxed border border-border/50'>
                Otomatis dibuat tepat <b>{daysCount} kolom tanggal</b> (1 s/d {daysCount} {periodLabel}).
              </div>
            </div>
          </div>

          {/* Card 2: Panduan Format Kolom & Kode Shift */}
          <div className='rounded-xl border border-border/80 bg-muted/25 p-4 space-y-2.5 shadow-2xs'>
            <div className='flex items-center gap-2 font-semibold text-foreground text-xs'>
              <IconInfoCircle className='size-4 text-primary shrink-0' />
              <span>Format Kolom & Kode Shift Resmi:</span>
            </div>
            <p className='text-[11px] text-muted-foreground leading-relaxed'>
              Template berisi kolom: <b>NIK</b>, <b>Nama Karyawan</b>, <b>Proyek</b>, dan kolom tanggal <b>1 s/d {daysCount}</b>.
            </p>
            <div className='flex flex-wrap items-center gap-1.5 pt-0.5'>
              <span className='text-[10px] text-muted-foreground font-medium mr-1'>Kode shift:</span>
              <Badge variant='green' className='px-2 py-0.5 text-[10px] font-semibold'>M · Pagi</Badge>
              <Badge variant='teal' className='px-2 py-0.5 text-[10px] font-semibold'>E · Sore</Badge>
              <Badge variant='amber' className='px-2 py-0.5 text-[10px] font-semibold'>N · Malam</Badge>
              <Badge variant='rose' className='px-2 py-0.5 text-[10px] font-semibold'>OFF · Libur</Badge>
            </div>
          </div>

          {/* Card 3: Status Download Alert */}
          {downloaded ? (
            <div className='flex items-center gap-3 rounded-xl border border-emerald-300/80 bg-emerald-500/10 p-3.5 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs'>
              <IconCircleCheck className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
              <div className='space-y-0.5 text-[11px]'>
                <p className='font-semibold'>Template {periodLabel} ({daysCount} Hari) Berhasil Didownload!</p>
                <p className='text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed'>
                  Silakan isi kode shift karyawan di Excel, lalu klik <b>Lanjut Upload Excel</b> untuk mengunggah file.
                </p>
              </div>
            </div>
          ) : (
            <div className='flex items-center gap-3 rounded-xl border border-amber-300/60 bg-amber-500/10 p-3.5 text-[11px] text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200 shadow-2xs'>
              <IconAlertCircle className='size-5 shrink-0 text-amber-600 dark:text-amber-400' />
              <span className='leading-relaxed'>
                Jika belum memiliki template untuk <b>{periodLabel}</b>, silakan download template terlebih dahulu agar format kolom sesuai dan tidak tertolak saat diunggah.
              </span>
            </div>
          )}
        </div>

        {/* ── Dialog Footer ── */}
        <div className='border-t bg-muted/20 px-7 py-4.5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3'>
          <Button
            type='button'
            variant='outline'
            className='gap-2 w-full sm:w-auto text-xs font-medium'
            onClick={handleDownload}
          >
            <IconDownload className='size-4 text-primary' />
            {downloaded ? `Download Ulang (${daysCount} Hari)` : `Download Template (${daysCount} Hari)`}
          </Button>
          <div className='flex items-center gap-2.5 w-full sm:w-auto justify-end'>
            <Button
              type='button'
              className='gap-2 w-full sm:w-auto text-xs font-semibold'
              onClick={() => {
                onClose()
                onProceedUpload(selectedPeriod)
              }}
            >
              <IconUpload className='size-4' />
              {downloaded ? 'Lanjut Upload Excel' : 'Sudah Punya File, Lanjut Upload'}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full sm:w-auto text-xs px-4'
              onClick={onClose}
            >
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── dialog ──────────────────────────────────────────────────────────────────

function ScheduleDialog({
  modal,
  period,
  selectedEmpNik = 'EMP-014',
  initialShifts,
  onSave,
  onPeriodChange,
  onClose,
  onPattern,
}: Readonly<{
  modal: 'upload' | 'add' | 'edit' | 'detail' | 'pattern'
  period: string
  selectedEmpNik?: string
  initialShifts?: Record<number, string>
  onSave: (empNik: string, shifts: Record<number, string>) => void
  onPeriodChange: (v: string) => void
  onClose: () => void
  onPattern: () => void
}>) {
  const [patternTab, setPatternTab] = useState<'weekday' | 'cycle'>('weekday')
  const [dialogPeriod, setDialogPeriod] = useState(period)
  const [employeeNik, setEmployeeNik] = useState(selectedEmpNik)

  const { year, month, label: periodLabel } = parsePeriod(dialogPeriod)
  const datesInMonth = useMemo(() => getDatesInMonth(year, month), [year, month])
  const isEdit = modal === 'edit'
  const isDetail = modal === 'detail'
  const isLocked = isEdit || isDetail

  const selectedEmp = EMPLOYEES_RAW.find((e) => e.nik === employeeNik)

  const [shiftsByDate, setShiftsByDate] = useState<Record<number, string>>(() => {
    if (initialShifts && Object.keys(initialShifts).length > 0) {
      return { ...initialShifts }
    }
    const emp = EMPLOYEES_RAW.find((e) => e.nik === selectedEmpNik) || EMPLOYEES_RAW[0]
    const initial: Record<number, string> = {}
    datesInMonth.forEach((d, idx) => {
      initial[d] = isLocked ? emp.cycleShifts[idx % emp.cycleShifts.length] : 'M'
    })
    return initial
  })

  function handlePeriodChange(v: string) {
    setDialogPeriod(v)
    onPeriodChange(v)
    const { year: y, month: m } = parsePeriod(v)
    const newDates = getDatesInMonth(y, m)
    const emp0 = EMPLOYEES_RAW[0]
    setShiftsByDate((prev) => {
      const next: Record<number, string> = {}
      newDates.forEach((d, idx) => {
        next[d] = prev[d] ?? (isLocked ? emp0.cycleShifts[idx % emp0.cycleShifts.length] : 'M')
      })
      return next
    })
  }

  function handleClearAll() {
    const cleared: Record<number, string> = {}
    datesInMonth.forEach((d) => {
      cleared[d] = 'OFF'
    })
    setShiftsByDate(cleared)
  }

  const title =
    modal === 'upload'
      ? 'Upload Shift Roster'
      : modal === 'add'
        ? 'Add Monthly Schedule'
        : isDetail
          ? 'Schedule Row Detail'
          : isEdit
            ? 'Edit Schedule Row'
            : 'Apply Pattern'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl'>
        <DialogHeader className='border-b px-6 py-4 pe-14'>
          <div className='flex items-start justify-between gap-4'>
            <div className='grid gap-1.5'>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className='text-xs'>
                {modal === 'upload'
                  ? 'Import an Excel roster for a project and period.'
                  : modal === 'pattern'
                    ? 'Fill the month based on weekday rules.'
                    : isDetail
                      ? `View monthly shift roster for ${selectedEmp ? `${selectedEmp.nik} · ${selectedEmp.name}` : 'this employee'}.`
                      : isEdit
                        ? `Update shift roster for ${selectedEmp ? `${selectedEmp.nik} · ${selectedEmp.name}` : 'this employee'}.`
                        : 'Assign shifts for one employee in the selected project and month.'}
              </DialogDescription>
            </div>
            {isDetail && <Badge variant='teal'>Read-only view</Badge>}
            {isEdit && <Badge variant='blue'>Editing row</Badge>}
          </div>
        </DialogHeader>

        <div className='max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-5'>
          {modal === 'upload' ? (
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='upload-project' className='text-xs text-muted-foreground'>
                    Project <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='bfp-operations'>
                    <SelectTrigger id='upload-project'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label className='text-xs text-muted-foreground'>
                    Period <span className='text-destructive'>*</span>
                  </Label>
                  <PeriodSelector
                    id='upload-period'
                    value={dialogPeriod}
                    onChange={setDialogPeriod}
                  />
                </div>
              </div>

              <div className='grid gap-1.5'>
                <Label className='text-xs text-muted-foreground'>
                  Excel File <span className='text-destructive'>*</span>
                </Label>
                <div className='flex items-center justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div className='grid size-9 shrink-0 place-items-center rounded-lg bg-green-500/10 text-green-700'>
                      <IconFileSpreadsheet className='size-5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='truncate text-xs font-semibold'>shift_roster_sep_2026.xlsx</p>
                      <p className='mt-1 text-[10px] text-muted-foreground'>
                        Ready to import · XLSX file
                      </p>
                    </div>
                  </div>
                  <Button variant='link' size='sm' className='h-auto px-0'>
                    Replace file
                  </Button>
                </div>
              </div>

              <Button
                variant='link'
                size='sm'
                className='h-auto w-fit px-0 gap-1.5 font-medium'
                onClick={() => {
                  downloadShiftRosterTemplate(dialogPeriod)
                  toast.success('Template Excel shift roster berhasil didownload.')
                }}
              >
                <IconDownload className='size-3.5' />
                Download Excel Template
              </Button>
              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-xs text-primary'>
                <p className='font-semibold'>Validation preview</p>
                <p className='mt-1'>48 employees · 1,440 schedule cells · 3 warnings.</p>
                <p className='mt-1'>Imported cells can be edited after import.</p>
              </div>
            </div>
          ) : modal === 'pattern' ? (
            <div className='flex flex-col gap-4'>
              <Tabs
                value={patternTab}
                onValueChange={(value) => {
                  if (value === 'weekday' || value === 'cycle') setPatternTab(value)
                }}
              >
                <TabsList variant='segmented' className='w-full sm:w-fit'>
                  <TabsTrigger value='weekday'>By Day of Week</TabsTrigger>
                  <TabsTrigger value='cycle'>Rotating Cycle</TabsTrigger>
                </TabsList>
              </Tabs>

              {patternTab === 'weekday' ? (
                <>
                  <div className='grid gap-1.5 sm:max-w-sm'>
                    <Label htmlFor='pattern-scope' className='text-xs text-muted-foreground'>
                      Apply to
                    </Label>
                    <Select defaultValue='whole-month'>
                      <SelectTrigger id='pattern-scope'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='whole-month'>Whole Month</SelectItem>
                        <SelectItem value='selected-dates'>Selected Dates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className='text-xs font-semibold'>Weekday rules</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>
                      Choose which active project shift should apply to each weekday.
                    </p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                      {weekdayRules.map(([day, shift]) => (
                        <div key={day} className='flex items-center gap-3'>
                          <b className='w-8 text-[10px]'>{day}</b>
                          <ShiftSelect defaultValue={shift} />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className='grid gap-1.5 sm:max-w-sm'>
                    <Label htmlFor='cycle-start' className='text-xs text-muted-foreground'>
                      Start pattern from
                    </Label>
                    <Input id='cycle-start' defaultValue='01 Sep 2026' />
                  </div>
                  <div>
                    <p className='text-xs font-semibold'>Cycle days</p>
                    <p className='mt-1 text-[10px] text-muted-foreground'>
                      The cycle repeats continuously until the end of the period.
                    </p>
                    <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                      {cycleRules.map((shift, index) => (
                        <div key={`cycle-${index + 1}`} className='flex items-center gap-3'>
                          <span className='w-12 shrink-0 text-[10px] text-muted-foreground'>
                            Day {index + 1}
                          </span>
                          <ShiftSelect defaultValue={shift} />
                        </div>
                      ))}
                    </div>
                    <Button variant='link' size='sm' className='mt-2 h-auto px-0'>
                      + Add Cycle Day
                    </Button>
                  </div>
                </>
              )}

              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-[10px] text-primary'>
                <span className='font-semibold'>Preview: </span>
                {patternTab === 'weekday'
                  ? `M → M → E → E → N → OFF → OFF, repeated by weekday for ${periodLabel}.`
                  : 'M → M → E → E → N → N → OFF → OFF, then repeat.'}
              </div>
              <div className='flex items-center justify-between gap-4 rounded-xl border bg-muted/20 px-3 py-2.5'>
                <div>
                  <p className='text-xs font-medium'>Overwrite existing schedules</p>
                  <p className='mt-1 text-[10px] text-muted-foreground'>
                    OFF · keep existing manual overrides
                  </p>
                </div>
                <Switch size='sm' aria-label='Overwrite existing schedules' />
              </div>
            </div>
          ) : (
            // ── add / edit / detail form ─────────────────────────────────────
            <div className='flex flex-col gap-4'>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='grid gap-1.5'>
                  <Label htmlFor='schedule-employee' className='text-xs text-muted-foreground'>
                    Employee <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={employeeNik}
                    disabled={isLocked}
                    onValueChange={(val) => {
                      setEmployeeNik(val)
                      const emp = EMPLOYEES_RAW.find((e) => e.nik === val)
                      if (emp) {
                        const next: Record<number, string> = {}
                        datesInMonth.forEach((d, idx) => {
                          next[d] = isLocked ? emp.cycleShifts[idx % emp.cycleShifts.length] : 'M'
                        })
                        setShiftsByDate(next)
                      }
                    }}
                  >
                    <SelectTrigger
                      id='schedule-employee'
                      disabled={isLocked}
                      className={isLocked ? 'cursor-not-allowed bg-muted/40 opacity-80' : ''}
                    >
                      <SelectValue placeholder='Select employee' />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEES_RAW.map((emp) => (
                        <SelectItem key={emp.nik} value={emp.nik}>
                          {emp.nik} · {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label htmlFor='schedule-project-modal' className='text-xs text-muted-foreground'>
                    Project <span className='text-destructive'>*</span>
                  </Label>
                  <Select defaultValue='bfp-operations' disabled={isLocked}>
                    <SelectTrigger
                      id='schedule-project-modal'
                      disabled={isLocked}
                      className={isLocked ? 'cursor-not-allowed bg-muted/40 opacity-80' : ''}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='bfp-operations'>BFP Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='grid gap-1.5'>
                  <Label className='text-xs text-muted-foreground'>
                    Period <span className='text-destructive'>*</span>
                  </Label>
                  {/* Changing month/year auto-generates all dates below */}
                  <PeriodSelector
                    id='schedule-period-modal'
                    value={dialogPeriod}
                    disabled={isLocked}
                    onChange={handlePeriodChange}
                  />
                </div>
              </div>

              <div className='flex flex-wrap items-end justify-between gap-2'>
                <div>
                  <p className='text-xs font-semibold'>Schedule by Date</p>
                  <p className='mt-1 text-[10px] text-muted-foreground'>
                    {datesInMonth.length} dates in {periodLabel}. {isDetail ? 'View assigned shift per date.' : 'Select one shift per date.'}
                  </p>
                </div>
                {!isDetail && (
                  <div className='flex items-center gap-3'>
                    <Button
                      variant='link'
                      size='sm'
                      className='h-auto px-0 text-muted-foreground hover:text-foreground'
                      onClick={handleClearAll}
                    >
                      Clear All
                    </Button>
                    <Button variant='outline' size='sm' onClick={onPattern}>
                      Apply Pattern
                    </Button>
                  </div>
                )}
              </div>

              {/* All dates in the selected month, auto-generated */}
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'>
                {datesInMonth.map((date) => (
                  <DateShiftCell
                    key={date}
                    date={date}
                    year={year}
                    month={month}
                    value={shiftsByDate[date]}
                    readOnly={isDetail}
                    onChange={(val) =>
                      setShiftsByDate((prev) => ({ ...prev, [date]: val }))
                    }
                  />
                ))}
              </div>

              <div className='rounded-xl border border-primary/15 bg-primary/10 p-3 text-[10px] text-primary'>
                {isDetail
                  ? 'Schedule is in view-only mode. Use the Edit button from the table to modify this employee’s shifts.'
                  : isEdit
                    ? 'Existing schedule: Morning → Morning → Evening → Evening → Night → OFF → OFF. Changes apply only to this employee.'
                    : 'Tip: use Apply Pattern to fill the whole month faster. Individual dates remain editable afterward.'}
              </div>

              <div>
                <p className='text-xs font-semibold'>Shift source</p>
                <p className='mt-1 text-[10px] text-muted-foreground'>
                  Only active shift masters from BFP Operations can be selected.
                </p>
                <div className='mt-2 flex flex-wrap gap-2'>
                  {shiftOptions.map((option) => (
                    <Badge key={option.value} variant={option.badge}>
                      {option.value} · {option.label} {option.time}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          {isDetail ? (
            <Button onClick={onClose} className='w-full sm:w-auto'>
              Close
            </Button>
          ) : (
            <>
              <Button variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (modal === 'edit' || modal === 'add') {
                    onSave(employeeNik, shiftsByDate)
                  } else {
                    onClose()
                  }
                }}
              >
                {modal === 'upload'
                  ? 'Import Schedule'
                  : modal === 'pattern'
                    ? 'Apply Pattern'
                    : isEdit
                      ? 'Save Changes'
                      : 'Save Schedule'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Month/Year picker with two views (like MUI DatePicker):
 *  - "month" view  : 3×4 month grid, year shown at top
 *  - "decade" view : click year label → shows 3×4 year grid for current decade
 * Max selectable year = currentYear + 1 (next year for planning ahead).
 * Uses Radix Popover Portal so it is never clipped by overflow-hidden containers.
 */
function PeriodSelector({
  id,
  value,
  disabled = false,
  onChange,
}: Readonly<{ id: string; value: string; disabled?: boolean; onChange: (v: string) => void }>) {
  const { month, year } = parsePeriod(value)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'month' | 'decade'>('month')
  const [pickerYear, setPickerYear] = useState(year)
  const [decadeStart, setDecadeStart] = useState(Math.floor(year / 10) * 10)
  const mm = String(month).padStart(2, '0')

  // Max allowed year = current year + 1 (allow planning 1 year ahead)
  const MAX_YEAR = new Date().getFullYear() + 1

  const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  function handleOpenChange(nextOpen: boolean) {
    if (disabled) return
    if (nextOpen) {
      setPickerYear(year)
      setDecadeStart(Math.floor(year / 10) * 10)
      setView('month')
    }
    setOpen(nextOpen)
  }

  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type='button'
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-full min-w-[140px] justify-between font-normal',
            disabled && 'cursor-not-allowed bg-muted/40 opacity-80 hover:bg-muted/40'
          )}
        >
          <span className='tabular-nums'>{mm}/{year}</span>
          <IconCalendar className='size-4 text-muted-foreground' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-64 p-3' align='start' sideOffset={4}>
        {view === 'month' ? (
          <>
            {/* Month view header: < [Year] > — click year → decade view */}
            <div className='mb-3 flex items-center justify-between'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setPickerYear((y) => y - 1)}
                className='size-7'
              >
                <IconChevronLeft className='size-4' />
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => {
                  setDecadeStart(Math.floor(pickerYear / 10) * 10)
                  setView('decade')
                }}
                className='h-7 px-2 font-semibold'
              >
                {pickerYear}
              </Button>
              {/* Next year button — disabled if already at MAX_YEAR */}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                disabled={pickerYear >= MAX_YEAR}
                onClick={() => setPickerYear((y) => y + 1)}
                className='size-7'
              >
                <IconChevronRight className='size-4' />
              </Button>
            </div>

            {/* Month grid 3 × 4 */}
            <div className='grid grid-cols-3 gap-1.5'>
              {MONTH_ABBR.map((abbr, idx) => {
                const m = idx + 1
                const isSelected = m === month && pickerYear === year
                return (
                  <Button
                    key={abbr}
                    type='button'
                    variant={isSelected ? 'default' : 'ghost'}
                    size='sm'
                    onClick={() => {
                      onChange(makePeriod(pickerYear, m))
                      setOpen(false)
                    }}
                    className='h-8 font-normal data-[state=active]:font-semibold'
                  >
                    {abbr}
                  </Button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            {/* Decade view header: < [2020–2029] > */}
            <div className='mb-3 flex items-center justify-between'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setDecadeStart((d) => d - 10)}
                className='size-7'
              >
                <IconChevronLeft className='size-4' />
              </Button>
              <span className='text-sm font-semibold'>
                {decadeStart} – {decadeStart + 9}
              </span>
              {/* Next decade — disabled if all years in next decade exceed MAX_YEAR */}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                disabled={decadeStart + 10 > MAX_YEAR}
                onClick={() => setDecadeStart((d) => d + 10)}
                className='size-7'
              >
                <IconChevronRight className='size-4' />
              </Button>
            </div>

            {/* Year grid 3 × 4 (12 years: decadeStart-1 … decadeStart+10) */}
            <div className='grid grid-cols-3 gap-1.5'>
              {Array.from({ length: 12 }, (_, i) => decadeStart - 1 + i).map((y) => {
                const inDecade = y >= decadeStart && y <= decadeStart + 9
                const isSelected = y === year
                const isFuture = y > MAX_YEAR // beyond allowed range → disabled
                return (
                  <Button
                    key={y}
                    type='button'
                    variant={isSelected ? 'default' : 'ghost'}
                    size='sm'
                    disabled={isFuture}
                    onClick={() => {
                      if (isFuture) return
                      setPickerYear(y)
                      setView('month')
                    }}
                    className={cn(
                      'h-8 font-normal',
                      !isSelected && !inDecade && 'text-muted-foreground',
                    )}
                  >
                    {y}
                  </Button>
                )
              })}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}


function DateShiftCell({
  date,
  year,
  month,
  value,
  readOnly = false,
  onChange,
}: Readonly<{
  date: number
  year: number
  month: number
  value?: string
  readOnly?: boolean
  onChange: (v: string) => void
}>) {
  const d = new Date(year, month - 1, date)
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
  const isWeekend = d.getDay() === 0 || d.getDay() === 6
  const isDayOff = value === 'OFF'
  const currentOption = shiftOptions.find((o) => o.value === value)

  const CYCLE_ORDER = ['M', 'E', 'N', 'OFF']
  function handleQuickCycle() {
    if (readOnly) return
    const currentIdx = CYCLE_ORDER.indexOf(value || 'M')
    const nextVal = CYCLE_ORDER[(currentIdx + 1) % CYCLE_ORDER.length]
    onChange(nextVal)
  }

  return (
    <div
      className={cn(
        'group flex min-w-0 flex-col gap-1.5 rounded-xl border p-2 shadow-2xs transition-all',
        !readOnly && 'hover:border-primary/40',
        isDayOff
          ? 'border-rose-200/80 bg-rose-500/8 dark:border-rose-900/50 dark:bg-rose-950/25'
          : 'border-border/70 bg-card/60'
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between text-xs select-none rounded-md px-0.5 py-0.5',
          !readOnly && 'cursor-pointer transition-colors hover:bg-muted/60'
        )}
        onClick={readOnly ? undefined : handleQuickCycle}
        title={readOnly ? undefined : 'Klik untuk ganti shift cepat (M → E → N → OFF)'}
      >
        <span
          className={cn(
            'flex size-5.5 items-center justify-center rounded-md font-bold text-xs tabular-nums transition-transform',
            !readOnly && 'group-hover:scale-105',
            isDayOff
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              : 'text-foreground'
          )}
        >
          {date}
        </span>
        <span
          className={cn(
            'text-[10px] uppercase tracking-wider',
            isDayOff
              ? 'text-rose-500/90 font-bold'
              : isWeekend
                ? 'text-foreground/70 font-semibold'
                : 'text-muted-foreground font-medium'
          )}
        >
          {dayName}
        </span>
      </div>

      {readOnly ? (
        <div
          className={cn(
            'flex h-8 w-full min-w-0 items-center justify-center rounded-lg border px-2 text-xs font-semibold select-none shadow-2xs',
            shiftTone(value)
          )}
        >
          <span className='truncate'>
            {currentOption ? `${currentOption.value} · ${currentOption.label}` : (value || '–')}
          </span>
        </div>
      ) : (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            size='sm'
            className={cn(
              'h-8 w-full min-w-0 px-2 text-xs font-semibold justify-between rounded-lg border cursor-pointer transition-all shadow-2xs hover:brightness-95',
              shiftTone(value)
            )}
          >
            <span className='truncate'>
              {currentOption ? `${currentOption.value} · ${currentOption.label}` : (value || '–')}
            </span>
          </SelectTrigger>
          <SelectContent position='popper' align='center' sideOffset={4} className='z-50 min-w-44'>
            {shiftOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className='cursor-pointer'>
                <div className='flex w-full items-center justify-between gap-3 text-xs'>
                  <span className='font-semibold'>
                    {option.value} · {option.label}
                  </span>
                  {option.time && (
                    <span className='text-[10px] text-muted-foreground'>
                      {option.time}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}

function ShiftSelect({ defaultValue }: Readonly<{ defaultValue: string }>) {
  const [val, setVal] = useState(defaultValue)
  return (
    <Select value={val} onValueChange={setVal}>
      <SelectTrigger className={cn('h-8 text-xs font-semibold', shiftTone(val))}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {shiftOptions.map((option) => (
          <ShiftSelectItem key={option.value} option={option} />
        ))}
      </SelectContent>
    </Select>
  )
}

function ShiftSelectItem({ option }: Readonly<{ option: (typeof shiftOptions)[number] }>) {
  return (
    <SelectItem value={option.value}>
      <span className='flex w-full items-center justify-between gap-4'>
        <span>
          {option.value} · {option.label}
        </span>
        {option.time && <span className='text-[10px] text-muted-foreground'>{option.time}</span>}
      </span>
    </SelectItem>
  )
}
