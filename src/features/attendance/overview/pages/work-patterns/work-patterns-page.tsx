import {
  IconBriefcase,
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconInfoCircle,
  IconLayersLinked,
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Alert, AlertDescription, AlertIcon, AlertTitle } from '@/shared/components/ui/alert'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { DatePicker } from '@/shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
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
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { getAttendanceBreadcrumbs } from '@/features/attendance/components/attendance-breadcrumbs'
import { AttendanceTabs } from '@/features/attendance/components/attendance-tabs'
import {
  createDefaultWeeklyDays,
  DAY_NAMES,
  getDayIndexFromDate,
  useWorkPatternStore,
  type WorkPattern,
  type WorkPatternDay,
} from '@/features/attendance/overview/data/work-pattern-store'

const mockAvailableEmployees = [
  { id: 'EMP-014', nik: 'EMP-014', name: 'Andi Pratama', department: 'Site Operations', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-021', nik: 'EMP-021', name: 'Rina Sari', department: 'Site Operations', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-032', nik: 'EMP-032', name: 'Dodi Saputra', department: 'Facility Management', project: 'Outsourcing - Warehouse Cikarang' },
  { id: 'EMP-045', nik: 'EMP-045', name: 'Maya Savitri', department: 'Human Resources', project: 'Corporate Backoffice HQ' },
  { id: 'EMP-056', nik: 'EMP-056', name: 'Bambang Wicaksono', department: 'Customer Care & Outlet', project: 'Retail Outlet Surabaya' },
  { id: 'EMP-067', nik: 'EMP-067', name: 'Siti Rahmawati', department: 'Field Service Dispatch', project: 'Mobile Field Inspector' },
  { id: 'EMP-078', nik: 'EMP-078', name: 'Hendra Gunawan', department: 'Security & Safety', project: 'Outsourcing - Astra Tower Site' },
  { id: 'EMP-089', nik: 'EMP-089', name: 'Dian Permana', department: 'Logistics Operations', project: 'Outsourcing - Warehouse Cikarang' },
]

const mockProjects = [
  'Corporate Backoffice HQ',
  'Outsourcing - Astra Tower Site',
  'Outsourcing - Warehouse Cikarang',
  'Retail Outlet Surabaya',
]

export function WorkPatternsPage() {
  const {
    patterns,
    assignments,
    addPattern,
    updatePattern,
    deletePattern,
    assignPattern,
    deleteAssignment,
  } = useWorkPatternStore()

  const [activeTab, setActiveTab] = useState<'patterns' | 'assignments'>('patterns')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal State for Pattern CRUD
  const [patternDialogOpen, setPatternDialogOpen] = useState(false)
  const [editingPattern, setEditingPattern] = useState<WorkPattern | null>(null)
  const [patternFormName, setPatternFormName] = useState('')
  const [patternFormCode, setPatternFormCode] = useState('')
  const [patternFormDescription, setPatternFormDescription] = useState('')
  const [patternFormCycleDays, setPatternFormCycleDays] = useState(7)
  const [enableTolerance, setEnableTolerance] = useState(true)
  const [toleranceMinutes, setToleranceMinutes] = useState(15)
  const [patternFormDays, setPatternFormDays] = useState<WorkPatternDay[]>(createDefaultWeeklyDays(5))

  // Bulk Change Helper inside Pattern Modal
  const [bulkSelectedDays, setBulkSelectedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [bulkClockIn, setBulkClockIn] = useState('08:30')
  const [bulkClockOut, setBulkClockOut] = useState('17:30')
  const [bulkBreakStart, setBulkBreakStart] = useState('12:00')
  const [bulkBreakEnd, setBulkBreakEnd] = useState('13:00')

  // Modal State for Assignment
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [assignMethod, setAssignMethod] = useState<'personnel' | 'group'>('personnel')
  const [selectedPatternId, setSelectedPatternId] = useState('')
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState('Outsourcing - Astra Tower Site')
  const [effectiveDate, setEffectiveDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(dayjs().add(1, 'year').toDate())
  const [customStartDayIndex, setCustomStartDayIndex] = useState<number | null>(null)

  // Auto-calculated Day index based on effective date
  const autoCalculatedDay = useMemo(() => {
    if (!effectiveDate) return { index: 1, name: 'Senin' }
    return getDayIndexFromDate(dayjs(effectiveDate).format('YYYY-MM-DD'))
  }, [effectiveDate])

  const activeStartDayIndex = customStartDayIndex ?? autoCalculatedDay.index

  // Open Create Pattern Dialog
  const handleOpenAddPattern = () => {
    setEditingPattern(null)
    setPatternFormName('')
    setPatternFormCode(`REG-${Date.now().toString().slice(-4)}`)
    setPatternFormDescription('')
    setPatternFormCycleDays(7)
    setEnableTolerance(true)
    setToleranceMinutes(15)
    setPatternFormDays(createDefaultWeeklyDays(5))
    setBulkSelectedDays([1, 2, 3, 4, 5])
    setBulkClockIn('08:30')
    setBulkClockOut('17:30')
    setPatternDialogOpen(true)
  }

  // Open Edit Pattern Dialog
  const handleOpenEditPattern = (pattern: WorkPattern) => {
    setEditingPattern(pattern)
    setPatternFormName(pattern.name)
    setPatternFormCode(pattern.code)
    setPatternFormDescription(pattern.description)
    setPatternFormCycleDays(pattern.cycleDays)
    setEnableTolerance(pattern.lateToleranceMinutes > 0)
    setToleranceMinutes(pattern.lateToleranceMinutes || 15)
    setPatternFormDays(JSON.parse(JSON.stringify(pattern.days)))
    setBulkSelectedDays([1, 2, 3, 4, 5])
    setPatternDialogOpen(true)
  }

  // Save Pattern Handler
  const handleSavePattern = (e: React.FormEvent) => {
    e.preventDefault()
    if (!patternFormName.trim()) {
      snackbar.error('Nama Pola Kerja wajib diisi.')
      return
    }

    const payload = {
      code: patternFormCode.trim() || `REG-${Date.now().toString().slice(-4)}`,
      name: patternFormName.trim(),
      description: patternFormDescription.trim(),
      cycleDays: patternFormCycleDays,
      lateToleranceMinutes: enableTolerance ? Number(toleranceMinutes) : 0,
      days: patternFormDays,
      status: 'Active' as const,
    }

    if (editingPattern) {
      updatePattern(editingPattern.id, payload)
      snackbar.success(`Pola kerja "${payload.name}" berhasil diperbarui.`)
    } else {
      addPattern(payload)
      snackbar.success(`Pola kerja baru "${payload.name}" berhasil didaftarkan.`)
    }
    setPatternDialogOpen(false)
  }

  // Apply Bulk Changes to Selected Days
  const handleApplyBulkWorkPattern = () => {
    if (bulkSelectedDays.length === 0) {
      snackbar.error('Pilih minimal satu hari untuk menerapkan jam kerja massal.')
      return
    }
    setPatternFormDays((prev) =>
      prev.map((day) => {
        if (bulkSelectedDays.includes(day.dayNumber)) {
          return {
            ...day,
            isOff: false,
            clockIn: bulkClockIn,
            clockOut: bulkClockOut,
            breakStart: bulkBreakStart,
            breakEnd: bulkBreakEnd,
          }
        }
        return day
      }),
    )
    snackbar.success(`Jam kerja berhasil diterapkan ke ${bulkSelectedDays.length} hari terpilih.`)
  }

  // Open Assignment Dialog
  const handleOpenAddAssignment = () => {
    setSelectedPatternId(patterns[0]?.id || '')
    setSelectedEmployeeIds([])
    setSelectedProject(mockProjects[0])
    setEffectiveDate(new Date())
    setEndDate(dayjs().add(1, 'year').toDate())
    setCustomStartDayIndex(null)
    setAssignmentDialogOpen(true)
  }

  // Save Assignment Handler
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatternId) {
      snackbar.error('Silakan pilih pola kerja terlebih dahulu.')
      return
    }

    let targetEmployees: typeof mockAvailableEmployees = []
    if (assignMethod === 'personnel') {
      if (selectedEmployeeIds.length === 0) {
        snackbar.error('Pilih minimal 1 karyawan.')
        return
      }
      targetEmployees = mockAvailableEmployees.filter((emp) =>
        selectedEmployeeIds.includes(emp.id),
      )
    } else {
      // Group / Project
      targetEmployees = mockAvailableEmployees.filter((emp) => emp.project === selectedProject)
      if (targetEmployees.length === 0) {
        snackbar.error(`Tidak ada karyawan di dalam project "${selectedProject}".`)
        return
      }
    }

    assignPattern({
      employees: targetEmployees,
      patternId: selectedPatternId,
      effectiveDate: dayjs(effectiveDate).format('YYYY-MM-DD'),
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : null,
      startDayIndex: activeStartDayIndex,
    })

    snackbar.success(
      `Pola kerja berhasil dipasangkan ke ${targetEmployees.length} karyawan terpilih.`,
    )
    setAssignmentDialogOpen(false)
  }

  const filteredPatterns = useMemo(() => {
    if (!searchQuery.trim()) return patterns
    const q = searchQuery.toLowerCase()
    return patterns.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    )
  }, [patterns, searchQuery])

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignments
    const q = searchQuery.toLowerCase()
    return assignments.filter(
      (a) =>
        a.employeeName.toLowerCase().includes(q) ||
        a.employeeNik.toLowerCase().includes(q) ||
        a.project.toLowerCase().includes(q) ||
        a.patternName.toLowerCase().includes(q),
    )
  }, [assignments, searchQuery])

  return (
    <AppMain
      title='Pola Kerja Personalia'
      subtitle='Daftarkan pola kerja reguler (5-2, 6-1, atau siklus kustom) dan pasangkan ke karyawan atau site outsourcing secara fleksibel.'
      breadcrumbs={getAttendanceBreadcrumbs('Pola Kerja Personalia')}
      className='gap-6 bg-muted/20'
      actions={
        <div className='flex items-center gap-2'>
          {activeTab === 'patterns' ? (
            <Button onClick={handleOpenAddPattern} className='gap-2 shadow-xs'>
              <IconPlus className='size-4' />
              Tambah Pola Kerja
            </Button>
          ) : (
            <Button onClick={handleOpenAddAssignment} className='gap-2 shadow-xs'>
              <IconUserCheck className='size-4' />
              Pasangkan Pola Kerja
            </Button>
          )}
        </div>
      }
    >
      <AttendanceTabs active='work-patterns' />

      {/* Guide Alert Banner Sesuai Lampiran 1 & 2 */}
      <Alert variant='info' className='border-blue-200 bg-blue-50/50 text-blue-900'>
        <AlertIcon>
          <IconInfoCircle className='size-5 text-blue-600' />
        </AlertIcon>
        <div className='min-w-0'>
          <AlertTitle className='font-semibold text-blue-950'>
            Pedoman Pola Kerja Reguler (Sesuai SOP Personalia)
          </AlertTitle>
          <AlertDescription className='mt-1 text-xs leading-relaxed text-blue-800/90'>
            • <b>Fungsi</b>: Menetapkan jadwal hari kerja, jam masuk, jam pulang, serta hari libur
            fix yang berlaku pada suatu divisi atau site penempatan (misal 5 Kerja 2 Off atau 6 Kerja
            1 Off).
            <br />• <b>Pemasangan Massal</b>: Karyawan dapat dipasangkan secara individu atau
            berdasarkan Grup / Project Site dengan menentukan <b>Effective Date</b> dan siklus hari
            awal (<b>Day _ from Work Pattern</b>).
            <br />• <b>Ketentuan Khusus</b>: Karyawan dengan Pola Kerja reguler tidak bisa memiliki
            Shift acak. Jika jadwal berganti, tambahkan penugasan baru dengan tanggal efektif baru
            agar riwayat masa lalu tetap aman.
          </AlertDescription>
        </div>
      </Alert>

      {/* Main Tabs Segment */}
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-3'>
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'patterns' | 'assignments')}
          >
            <TabsList variant='segmented'>
              <TabsTrigger value='patterns' className='gap-2'>
                <IconLayersLinked className='size-4' />
                Daftar Pola Kerja ({patterns.length})
              </TabsTrigger>
              <TabsTrigger value='assignments' className='gap-2'>
                <IconUsers className='size-4' />
                Pemasangan ke Karyawan ({assignments.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='relative w-full sm:w-72'>
            <IconSearch className='absolute left-3 top-2.5 size-4 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'patterns'
                  ? 'Cari nama / kode pola kerja...'
                  : 'Cari karyawan / project / pola...'
              }
              className='h-9 pl-9 text-xs bg-background'
            />
          </div>
        </div>

        {/* ─── TAB 1: DAFTAR POLA KERJA ─────────────────────────────────────── */}
        {activeTab === 'patterns' && (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {filteredPatterns.map((pattern) => {
              const workDaysCount = pattern.days.filter((d) => !d.isOff).length
              const offDaysCount = pattern.days.filter((d) => d.isOff).length

              return (
                <Card
                  key={pattern.id}
                  className='flex flex-col justify-between border-border/80 shadow-xs hover:border-primary/50 transition-all'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='font-mono text-[10px] font-semibold'>
                            {pattern.code}
                          </Badge>
                          {pattern.isDefault && (
                            <Badge variant='secondary' className='text-[10px]'>
                              Default HQ
                            </Badge>
                          )}
                        </div>
                        <CardTitle className='text-base font-bold text-foreground mt-1.5'>
                          {pattern.name}
                        </CardTitle>
                      </div>
                      <Badge
                        variant='default'
                        className='bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0 text-xs'
                      >
                        {workDaysCount} Kerja · {offDaysCount} Off
                      </Badge>
                    </div>
                    <CardDescription className='text-xs line-clamp-2 mt-1'>
                      {pattern.description || 'Tidak ada deskripsi tambahan.'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 pt-0'>
                    {/* Meta Indicators */}
                    <div className='grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-muted/40 border border-border/50'>
                      <div>
                        <span className='text-muted-foreground block text-[11px]'>Siklus Hari</span>
                        <span className='font-semibold'>{pattern.cycleDays} Hari (Mingguan)</span>
                      </div>
                      <div>
                        <span className='text-muted-foreground block text-[11px]'>
                          Toleransi Telat
                        </span>
                        <span className='font-semibold'>
                          {pattern.lateToleranceMinutes > 0
                            ? `${pattern.lateToleranceMinutes} Menit`
                            : 'Tidak Ada'}
                        </span>
                      </div>
                    </div>

                    {/* Day Schedule Chips (Senin s/d Minggu) */}
                    <div>
                      <span className='text-[11px] font-semibold text-muted-foreground mb-1.5 block'>
                        Jadwal Siklus Harian (Day 1 – Day 7):
                      </span>
                      <div className='grid grid-cols-7 gap-1 text-center'>
                        {pattern.days.map((d) => (
                          <div
                            key={d.dayNumber}
                            className={cn(
                              'p-1.5 rounded-lg border text-[10px] flex flex-col justify-center items-center min-h-12',
                              d.isOff
                                ? 'bg-muted/30 border-dashed border-border/80 text-muted-foreground'
                                : 'bg-primary/5 border-primary/20 text-foreground font-medium',
                            )}
                          >
                            <span className='font-bold text-[9px] uppercase tracking-wider text-muted-foreground'>
                              {d.dayName.slice(0, 3)}
                            </span>
                            {d.isOff ? (
                              <span className='text-[9px] font-bold text-rose-500 mt-0.5'>OFF</span>
                            ) : (
                              <span className='text-[9px] font-semibold text-primary mt-0.5 leading-tight'>
                                {d.clockIn}
                                <br />
                                {d.clockOut}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className='border-t border-border/70 pt-3 flex items-center justify-between text-xs text-muted-foreground'>
                    <div className='flex items-center gap-1.5'>
                      <IconUsers className='size-4 text-primary' />
                      <span className='font-semibold text-foreground'>
                        {pattern.assignedCount} Karyawan
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleOpenEditPattern(pattern)}
                        className='h-8 px-2.5 text-xs gap-1'
                      >
                        <IconPencil className='size-3.5' />
                        Edit
                      </Button>
                      {!pattern.isDefault && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            if (confirm(`Hapus pola kerja "${pattern.name}"?`)) {
                              deletePattern(pattern.id)
                              snackbar.success('Pola kerja berhasil dihapus.')
                            }
                          }}
                          className='h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                        >
                          <IconTrash className='size-3.5' />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* ─── TAB 2: PEMASANGAN POLA KERJA KE KARYAWAN ──────────────────────── */}
        {activeTab === 'assignments' && (
          <Card className='border-border/80 shadow-xs overflow-hidden'>
            <CardHeader className='border-b border-border/80 bg-muted/30 py-4'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <CardTitle className='text-base font-bold'>
                    Daftar Penugasan Pola Kerja Karyawan
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Karyawan yang terikat pada pola kerja reguler dengan tanggal mulai efektif dan
                    siklus hari penugasan.
                  </CardDescription>
                </div>
                <Button onClick={handleOpenAddAssignment} size='sm' className='gap-2 shadow-xs'>
                  <IconPlus className='size-4' />
                  Pasangkan Karyawan Baru
                </Button>
              </div>
            </CardHeader>

            <CardContent className='p-0 overflow-x-auto'>
              <Table className='min-w-[850px]'>
                <TableHeader className='bg-muted/40'>
                  <TableRow>
                    <TableHead className='w-48'>Karyawan</TableHead>
                    <TableHead>Project / Site Penempatan</TableHead>
                    <TableHead>Pola Kerja Terpasang</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Day _ from Pattern</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                        Tidak ada data penugasan pola kerja yang cocok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div>
                            <span className='font-semibold text-foreground text-xs block'>
                              {row.employeeName}
                            </span>
                            <span className='text-[11px] font-mono text-muted-foreground'>
                              {row.employeeNik} · {row.department}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className='text-xs'>
                          <span className='inline-flex items-center gap-1.5 font-medium text-foreground'>
                            <IconBriefcase className='size-3.5 text-muted-foreground' />
                            {row.project}
                          </span>
                        </TableCell>
                        <TableCell className='text-xs font-medium'>
                          <Badge variant='outline' className='bg-primary/5 text-primary text-[11px]'>
                            {row.patternName}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-xs text-foreground font-mono'>
                          {dayjs(row.effectiveDate).format('DD MMM YYYY')}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground font-mono'>
                          {row.endDate ? dayjs(row.endDate).format('DD MMM YYYY') : 'Selamanya'}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary' className='text-[10px] font-mono'>
                            Day {row.startDayIndex} ({row.startDayName})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={row.status === 'Active' ? 'default' : 'secondary'}
                            className={cn(
                              'text-[10px]',
                              row.status === 'Active' &&
                              'bg-emerald-50 text-emerald-700 border-emerald-200',
                            )}
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              if (confirm(`Cabut pola kerja dari ${row.employeeName}?`)) {
                                deleteAssignment(row.id)
                                snackbar.success('Penugasan berhasil dihapus.')
                              }
                            }}
                            className='h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                          >
                            <IconTrash className='size-3.5' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── MODAL 1: TAMBAH / EDIT POLA KERJA (SESUAI LAMPIRAN 1) ───────────── */}
      <Dialog open={patternDialogOpen} onOpenChange={setPatternDialogOpen}>
        <DialogContent className='sm:max-w-[760px] max-h-[85vh] overflow-y-auto p-0 rounded-3xl'>
          <div className='p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/80'>
            <div className='flex items-center gap-3'>
              <div className='size-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0'>
                <IconCalendarTime size={22} />
              </div>
              <div>
                <DialogTitle className='text-base font-bold text-foreground'>
                  {editingPattern ? 'Ubah Pola Kerja Personalia' : 'Tambah Pola Kerja Baru'}
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Atur siklus hari kerja, jam masuk, jam pulang, dan toleransi keterlambatan (Lampiran 1).
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePattern} className='p-6 space-y-5 text-xs'>
            {/* Row 1: Nama & Kode Pola Kerja */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
              <div className='sm:col-span-2 space-y-1.5'>
                <Label htmlFor='pattern-name' className='font-semibold'>
                  Nama Pola Kerja <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  id='pattern-name'
                  value={patternFormName}
                  onChange={(e) => setPatternFormName(e.target.value)}
                  placeholder='Contoh: Reguler 5-2 Head Office (Senin-Jumat)'
                  className='h-9 bg-background'
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='pattern-code' className='font-semibold'>
                  Kode Pola
                </Label>
                <Input
                  id='pattern-code'
                  value={patternFormCode}
                  onChange={(e) => setPatternFormCode(e.target.value)}
                  placeholder='REG-5-2-HQ'
                  className='h-9 bg-background font-mono'
                />
              </div>
            </div>

            {/* Row 2: Deskripsi */}
            <div className='space-y-1.5'>
              <Label htmlFor='pattern-desc' className='font-semibold'>
                Deskripsi / Keterangan
              </Label>
              <Input
                id='pattern-desc'
                value={patternFormDescription}
                onChange={(e) => setPatternFormDescription(e.target.value)}
                placeholder='Catatan penempatan site atau jam kerja berlaku...'
                className='h-9 bg-background'
              />
            </div>

            {/* Row 3: Siklus & Toleransi Keterlambatan */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/40 border border-border/80'>
              <div className='space-y-1.5'>
                <Label className='font-semibold'>
                  Jumlah Hari dalam Siklus (Poin 4 Lampiran 1)
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='number'
                    min={1}
                    max={14}
                    value={patternFormCycleDays}
                    onChange={(e) => setPatternFormCycleDays(Number(e.target.value))}
                    className='h-9 w-24 bg-background font-semibold'
                  />
                  <span className='text-xs text-muted-foreground'>
                    Hari (Disarankan 7 hari siklus mingguan)
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='toleransi-check'
                    checked={enableTolerance}
                    onCheckedChange={(c) => setEnableTolerance(!!c)}
                  />
                  <Label htmlFor='toleransi-check' className='font-semibold cursor-pointer'>
                    Terapkan Toleransi Keterlambatan (Poin 5)
                  </Label>
                </div>
                {enableTolerance && (
                  <div className='flex items-center gap-2 pl-6'>
                    <Input
                      type='number'
                      min={1}
                      max={120}
                      value={toleranceMinutes}
                      onChange={(e) => setToleranceMinutes(Number(e.target.value))}
                      className='h-8 w-20 bg-background font-semibold'
                    />
                    <span className='text-xs text-muted-foreground'>
                      Menit dari jam masuk kerja
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Ubah Massal Box (Poin 6.b Lampiran 1) */}
            <div className='p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <IconCalendarEvent className='size-4 text-primary' />
                  <span className='font-bold text-foreground'>
                    Ubah Massal Jam Kerja (Bulk Apply)
                  </span>
                </div>
                <Button
                  type='button'
                  size='sm'
                  onClick={handleApplyBulkWorkPattern}
                  className='h-8 px-3 text-xs gap-1.5'
                >
                  <IconCheck className='size-3.5' />
                  Apply Work Pattern
                </Button>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-muted-foreground text-[11px] mr-1'>Pilih Hari:</span>
                {patternFormDays.map((d) => (
                  <label
                    key={d.dayNumber}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs cursor-pointer select-none transition-all',
                      bulkSelectedDays.includes(d.dayNumber)
                        ? 'bg-primary text-primary-foreground border-primary font-semibold'
                        : 'bg-background border-border text-foreground',
                    )}
                  >
                    <input
                      type='checkbox'
                      className='sr-only'
                      checked={bulkSelectedDays.includes(d.dayNumber)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelectedDays([...bulkSelectedDays, d.dayNumber])
                        } else {
                          setBulkSelectedDays(bulkSelectedDays.filter((n) => n !== d.dayNumber))
                        }
                      }}
                    />
                    Day {d.dayNumber} ({d.dayName.slice(0, 3)})
                  </label>
                ))}
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1'>
                <div className='space-y-1'>
                  <span className='text-[10px] text-muted-foreground'>Jam Masuk:</span>
                  <Input
                    type='time'
                    value={bulkClockIn}
                    onChange={(e) => setBulkClockIn(e.target.value)}
                    className='h-8 bg-background text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-muted-foreground'>Jam Pulang:</span>
                  <Input
                    type='time'
                    value={bulkClockOut}
                    onChange={(e) => setBulkClockOut(e.target.value)}
                    className='h-8 bg-background text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-muted-foreground'>Istirahat Mulai:</span>
                  <Input
                    type='time'
                    value={bulkBreakStart}
                    onChange={(e) => setBulkBreakStart(e.target.value)}
                    className='h-8 bg-background text-xs'
                  />
                </div>
                <div className='space-y-1'>
                  <span className='text-[10px] text-muted-foreground'>Istirahat Selesai:</span>
                  <Input
                    type='time'
                    value={bulkBreakEnd}
                    onChange={(e) => setBulkBreakEnd(e.target.value)}
                    className='h-8 bg-background text-xs'
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Table Jadwal Kerja Harian (Day 1 - Day 7) */}
            <div className='space-y-2'>
              <Label className='font-semibold'>Jadwal Kerja Harian (Day 1 – Day 7)</Label>
              <div className='border border-border/80 rounded-2xl overflow-hidden'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead className='w-36'>Hari Siklus</TableHead>
                      <TableHead className='w-32'>Tipe Hari</TableHead>
                      <TableHead>Jam Masuk</TableHead>
                      <TableHead>Jam Pulang</TableHead>
                      <TableHead>Istirahat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patternFormDays.map((day, idx) => (
                      <TableRow key={day.dayNumber} className={day.isOff ? 'bg-muted/20' : ''}>
                        <TableCell className='font-semibold'>
                          Day {day.dayNumber} - {day.dayName}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={day.isOff ? 'off' : 'work'}
                            onValueChange={(val) => {
                              const isOff = val === 'off'
                              setPatternFormDays((prev) =>
                                prev.map((d, i) =>
                                  i === idx
                                    ? {
                                      ...d,
                                      isOff,
                                      clockIn: isOff ? '' : d.clockIn || '08:30',
                                      clockOut: isOff ? '' : d.clockOut || '17:30',
                                    }
                                    : d,
                                ),
                              )
                            }}
                          >
                            <SelectTrigger className='h-8 w-28 text-xs bg-background'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='work'>Hari Kerja</SelectItem>
                              <SelectItem value='off'>Hari Libur (Off)</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type='time'
                            disabled={day.isOff}
                            value={day.clockIn}
                            onChange={(e) => {
                              const val = e.target.value
                              setPatternFormDays((prev) =>
                                prev.map((d, i) => (i === idx ? { ...d, clockIn: val } : d)),
                              )
                            }}
                            className='h-8 w-28 bg-background text-xs disabled:opacity-30'
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type='time'
                            disabled={day.isOff}
                            value={day.clockOut}
                            onChange={(e) => {
                              const val = e.target.value
                              setPatternFormDays((prev) =>
                                prev.map((d, i) => (i === idx ? { ...d, clockOut: val } : d)),
                              )
                            }}
                            className='h-8 w-28 bg-background text-xs disabled:opacity-30'
                          />
                        </TableCell>
                        <TableCell>
                          {!day.isOff ? (
                            <span className='text-[11px] font-mono text-muted-foreground'>
                              {day.breakStart || '12:00'} – {day.breakEnd || '13:00'}
                            </span>
                          ) : (
                            <span className='text-[11px] text-muted-foreground italic'>-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setPatternDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type='submit'>Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: PEMASANGAN POLA KERJA KE KARYAWAN (SESUAI LAMPIRAN 2) ───── */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className='sm:max-w-[620px] max-h-[85vh] overflow-y-auto p-0 rounded-3xl'>
          <div className='p-6 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-b border-border/80'>
            <div className='flex items-center gap-3'>
              <div className='size-11 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0'>
                <IconUserCheck size={22} />
              </div>
              <div>
                <DialogTitle className='text-base font-bold text-foreground'>
                  Memasangkan Pola Kerja ke Karyawan
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground mt-0.5'>
                  Dapat dipasangkan secara personal atau berdasarkan grup personalia (Lampiran 2).
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveAssignment} className='p-6 space-y-4 text-xs'>
            {/* Tab: Add by Personnel vs Add by Group (Poin 3 Lampiran 2) */}
            <div className='space-y-1.5'>
              <Label className='font-semibold'>Metode Pemilihan Karyawan</Label>
              <Tabs
                value={assignMethod}
                onValueChange={(v) => setAssignMethod(v as 'personnel' | 'group')}
              >
                <TabsList className='grid grid-cols-2 w-full'>
                  <TabsTrigger value='personnel'>Add by Personnel (Perorangan)</TabsTrigger>
                  <TabsTrigger value='group'>Add by Group (Project Site)</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Target Selection */}
            {assignMethod === 'personnel' ? (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='font-semibold'>
                    Pilih Karyawan ({selectedEmployeeIds.length} terpilih)
                  </Label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      if (selectedEmployeeIds.length === mockAvailableEmployees.length) {
                        setSelectedEmployeeIds([])
                      } else {
                        setSelectedEmployeeIds(mockAvailableEmployees.map((e) => e.id))
                      }
                    }}
                    className='h-7 text-[11px]'
                  >
                    {selectedEmployeeIds.length === mockAvailableEmployees.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>

                <div className='max-h-40 overflow-y-auto border border-border/80 rounded-xl p-2 space-y-1.5 bg-background'>
                  {mockAvailableEmployees.map((emp) => {
                    const isChecked = selectedEmployeeIds.includes(emp.id)
                    return (
                      <label
                        key={emp.id}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                          isChecked ? 'bg-primary/5 border-primary/30' : 'border-border/50 hover:bg-muted/40',
                        )}
                      >
                        <div className='flex items-center gap-2.5'>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(c) => {
                              if (c) {
                                setSelectedEmployeeIds([...selectedEmployeeIds, emp.id])
                              } else {
                                setSelectedEmployeeIds(
                                  selectedEmployeeIds.filter((id) => id !== emp.id),
                                )
                              }
                            }}
                          />
                          <div>
                            <span className='font-semibold text-foreground block'>
                              {emp.name}
                            </span>
                            <span className='text-[10px] text-muted-foreground'>
                              {emp.nik} · {emp.project}
                            </span>
                          </div>
                        </div>
                        <Badge variant='outline' className='text-[10px]'>
                          {emp.department}
                        </Badge>
                      </label>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className='space-y-1.5'>
                <Label className='font-semibold'>Pilih Grup Personalia / Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className='h-9 text-xs bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProjects.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-[11px] text-muted-foreground'>
                  Akan memasangkan pola kerja ke seluruh karyawan aktif yang ditugaskan pada project ini.
                </p>
              </div>
            )}

            {/* Select Pola Kerja */}
            <div className='space-y-1.5'>
              <Label className='font-semibold'>Pola Kerja yang Diterapkan</Label>
              <Select value={selectedPatternId} onValueChange={setSelectedPatternId}>
                <SelectTrigger className='h-9 text-xs bg-background'>
                  <SelectValue placeholder='Pilih Pola Kerja' />
                </SelectTrigger>
                <SelectContent>
                  {patterns.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Effective Date & End Date (Poin 4 Lampiran 2) */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='font-semibold'>Effective Date (Tanggal Mulai)</Label>
                <DatePicker
                  mode='single'
                  selected={effectiveDate}
                  onSelect={(d) => {
                    setEffectiveDate(d)
                    setCustomStartDayIndex(null) // Reset to re-calculate automatically
                  }}
                  className='w-full'
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='font-semibold'>End Date (Tanggal Berakhir)</Label>
                <DatePicker
                  mode='single'
                  selected={endDate}
                  onSelect={setEndDate}
                  className='w-full'
                />
              </div>
            </div>

            {/* Day _ from Work Pattern (Poin 4.d Lampiran 2) */}
            <div className='p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5 font-bold text-amber-950 text-xs'>
                  <IconInfoCircle className='size-4 text-amber-600' />
                  Isi Kolom Day _ From Work Pattern
                </div>
                <Badge variant='outline' className='bg-white text-amber-800 border-amber-300 font-mono text-[10px]'>
                  Auto-Calculated
                </Badge>
              </div>
              <p className='text-[11px] text-amber-900 leading-relaxed'>
                Karena tanggal efektif jatuh pada hari{' '}
                <b>{dayjs(effectiveDate).format('dddd, DD MMMM YYYY')}</b>, maka siklus kerja dimulai
                dari:
              </p>
              <div className='flex items-center gap-2'>
                <Select
                  value={String(activeStartDayIndex)}
                  onValueChange={(val) => setCustomStartDayIndex(Number(val))}
                >
                  <SelectTrigger className='h-8 bg-white border-amber-300 text-xs font-semibold w-56'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((name, i) => (
                      <SelectItem key={name} value={String(i + 1)}>
                        Day {i + 1} ({name}) {i + 1 === autoCalculatedDay.index ? '• Rekomendasi' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className='text-[11px] text-amber-800 italic'>
                  (Bisa disesuaikan jika siklus non-Senin)
                </span>
              </div>
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setAssignmentDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type='submit' className='bg-emerald-600 hover:bg-emerald-700 text-white'>
                Save Personnel (Simpan Penugasan)
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppMain>
  )
}
