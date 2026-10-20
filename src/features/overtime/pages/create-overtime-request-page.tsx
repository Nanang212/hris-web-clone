import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconMapPin,
  IconSearch,
  IconSelector,
  IconSend,
  IconSparkles,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react'

import { AppMain } from '@/shared/components/app-layout/app-main'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Textarea } from '@/shared/components/ui/textarea'
import { snackbar } from '@/shared/lib/snackbar'
import { cn } from '@/shared/lib/utils'
import { OvertimeTabs } from '@/features/overtime/components/overtime-tabs'
import { approvalSyncStore } from '@/shared/lib/approval-sync-store'
import { getTwoTierApprovers } from '@/features/report/utils/employee-attendance-generator'
import type { OvertimeWorkOrder } from '@/features/report/types'
import type { ApprovalRequest } from '@/features/approval/types'
import type { OvertimeRequest } from '@/features/overtime/types'
import { m } from '@/i18n/paraglide/messages'

interface EmployeeOption {
  id: string
  name: string
  nip: string
  position: string
  department: string
  location: string
  project: string
  avatar: string
}

const EMPLOYEES: EmployeeOption[] = [
  {
    id: 'ATT-001',
    name: 'Ahmad Fauzi',
    nip: '20261600101',
    position: 'Field Operator',
    department: 'Engineering & Technology',
    location: 'Depot TBBM Plumpang',
    project: 'Retail Field Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-000',
    name: 'Yosep Fendi Seda',
    nip: '20261600475',
    position: 'Security Officer',
    department: 'Operations & Logistics',
    location: 'AFT Tambolaka',
    project: 'AFT Tambolaka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-002',
    name: 'Siti Rahmawati',
    nip: '20261600102',
    position: 'Finance Specialist',
    department: 'Finance & Accounting',
    location: 'Headquarter BFP',
    project: 'Retail HRIS Rollout',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-003',
    name: 'Budi Santoso',
    nip: '20261600103',
    position: 'Site Coordinator',
    department: 'Sales & Business Dev',
    location: 'Terminal TBBM Surabaya',
    project: 'Warehouse Shift Operations',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-004',
    name: 'Dewi Lestari',
    nip: '20261600104',
    position: 'Content Marketing Lead',
    department: 'Marketing & Growth',
    location: 'Headquarter BFP',
    project: 'Brand Campaign',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-005',
    name: 'Andi Pratama',
    nip: '20261600105',
    position: 'Operator Lapangan',
    department: 'Operations & Logistics',
    location: 'Depot TBBM Plumpang',
    project: 'Depot Distribution',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-006',
    name: 'Wahyu Prasetyo',
    nip: '20261600106',
    position: 'DevOps Engineer',
    department: 'Engineering & Technology',
    location: 'Headquarter BFP',
    project: 'Cloud Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
  },
  {
    id: 'ATT-007',
    name: 'Rama Aditya',
    nip: '20261600107',
    position: 'Software Engineer',
    department: 'Engineering & Technology',
    location: 'Headquarter BFP',
    project: 'Payroll Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
]

export function CreateOvertimeRequestPage() {
  const navigate = useNavigate()

  // Form State yang selaras 100% dengan formulir SPKL PT. Bintang Fajar Persada
  const [selectedEmpId, setSelectedEmpId] = useState<string>('ATT-001')
  const [openCombobox, setOpenCombobox] = useState<boolean>(false)
  const [employeeSearch, setEmployeeSearch] = useState<string>('')
  const [dayType, setDayType] = useState<'workday' | 'holiday'>('workday')
  const [overtimeDate, setOvertimeDate] = useState<string>('2026-08-14')
  const [periodLabel, setPeriodLabel] = useState<string>('2026-08-01 s.d. 2026-08-31')
  const [eventDescription, setEventDescription] = useState<string>(
    'Operasional Tambahan & Percepatan Proyek',
  )
  const [taskDescription, setTaskDescription] = useState<string>(
    'PENGAMANAN SHIFT MALAM & MONITORING PIPA',
  )
  const [customLocation, setCustomLocation] = useState<string>('')

  // Filter karyawan untuk pencarian di dropdown
  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.toLowerCase().trim()
    if (!q) return EMPLOYEES
    return EMPLOYEES.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.nip.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q),
    )
  }, [employeeSearch])

  // Waktu Rencana & Realisasi
  const [planStartTime, setPlanStartTime] = useState<string>('17:00')
  const [planEndTime, setPlanEndTime] = useState<string>('21:00')
  const [actualStartTime, setActualStartTime] = useState<string>('17:00')
  const [actualEndTime, setActualEndTime] = useState<string>('21:00')

  const currentEmployee =
    EMPLOYEES.find((e) => e.id === selectedEmpId) || EMPLOYEES[0]!

  const effectiveLocation = customLocation.trim() || currentEmployee.location

  // Otomatis tentukan approver berjenjang sesuai unit kerja
  const approvers = getTwoTierApprovers(
    currentEmployee.department,
    currentEmployee.project,
  )

  // Hitung total jam lembur secara otomatis
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 4
    const [sh, sm] = start.split(':').map((v) => parseInt(v, 10) || 0)
    const [eh, em] = end.split(':').map((v) => parseInt(v, 10) || 0)
    let diffMinutes = eh * 60 + em - (sh * 60 + sm)
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60 // lewat tengah malam
    }
    const hours = Math.round((diffMinutes / 60) * 10) / 10
    return hours > 0 ? hours : 4
  }

  const totalHours = calculateDuration(actualStartTime, actualEndTime)
  const formattedOvertimeDate = dayjs(overtimeDate).isValid()
    ? dayjs(overtimeDate).format('DD/MM/YYYY')
    : '14/08/2026'

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const randomNum = Math.floor(Math.random() * 900 + 100)
    const spklId = `SPKL-${currentEmployee.id}-${randomNum}`
    const otId = `OT-2026-0${randomNum}`
    const orderNumber = `SPKL/BFP/${currentEmployee.nip}/VIII/2026/${randomNum}`

    // 1. SPKL Work Order Object (Sesuai Form Fisik BFP)
    const newSpklOrder: OvertimeWorkOrder = {
      id: spklId,
      orderNumber,
      employeeName: currentEmployee.name,
      employeeId: currentEmployee.id,
      nip: currentEmployee.nip,
      position: currentEmployee.position,
      department: currentEmployee.department,
      location: effectiveLocation,
      periodLabel,
      date: formattedOvertimeDate,
      eventDescription,
      taskDescription,
      isHoliday: dayType === 'holiday',
      startTime: planStartTime,
      endTime: planEndTime,
      actualStartTime,
      actualEndTime,
      totalHours,
      approvedBy: approvers.deptHead.name,
      approverTitle: approvers.deptHead.title,
      approvedAt: `${dayjs(overtimeDate).format('DD MMMM YYYY')} ${actualEndTime} WIB`,
    }

    // 2. Approval Request Object (Masuk ke menu /approval)
    const newApprovalReq: ApprovalRequest = {
      id: otId,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      department: currentEmployee.department,
      position: currentEmployee.position,
      requestType: 'overtime',
      requestDate: overtimeDate,
      details: `SPKL Lembur ${dayType === 'holiday' ? 'Hari Libur' : 'Hari Kerja'} — ${totalHours} Jam (${planStartTime}–${planEndTime})`,
      status: 'pending',
      currentLevel: 1,
      totalLevels: 2,
      workflowName: 'Overtime SPKL Approval Workflow',
      days: totalHours,
      reason: `${eventDescription}: ${taskDescription} di ${effectiveLocation}`,
      timeline: [
        {
          level: 1,
          name: 'Head of Department',
          approverName: approvers.deptHead.name,
          status: 'pending',
        },
        {
          level: 2,
          name: 'Head of Division / VP',
          approverName: approvers.divHead.name,
          status: 'waiting',
        },
      ],
    }

    // 3. Overtime Request List (Tampil di tabel list /overtime)
    const newOvertimeReq: OvertimeRequest = {
      id: otId,
      employee: currentEmployee.name,
      date: overtimeDate,
      schedule: `${planStartTime}–${planEndTime}`,
      requestedHours: totalHours,
      eligibleHours: totalHours,
      status: 'pending',
    }

    // Simpan ke unified reactive store
    approvalSyncStore.addSpklOrder(newSpklOrder, newApprovalReq, newOvertimeReq)

    snackbar.success(
      `Surat Perintah Kerja Lembur (${orderNumber}) untuk ${currentEmployee.name} berhasil dibuat! Menunggu persetujuan di menu Persetujuan.`,
    )

    navigate({ to: '/overtime' })
  }

  return (
    <AppMain
      title='Buat Surat Perintah Kerja Lembur (SPKL)'
      subtitle='Formulir resmi penugasan kerja lembur PT. Bintang Fajar Persada yang terintegrasi dengan absensi dan persetujuan.'
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/overtime', label: m.app_layout_nav_overtime() },
        { label: 'Buat SPKL Baru' },
      ]}
      backTo='/overtime'
      className='gap-5 bg-muted/30'
    >
      <OvertimeTabs active='requests' />

      <div className='grid gap-6 lg:grid-cols-1 xl:grid-cols-[minmax(420px,1.2fr)_minmax(520px,1.4fr)] items-start'>
        {/* ══════════════════════════════════════════════════════════════════
            KOLOM KIRI: FORMULIR INPUT SPKL
        ══════════════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {/* Section 1: Memberikan Perintah Lembur Kepada */}
          <Card className='shadow-xs border-border/80'>
            <CardHeader className='pb-3 border-b bg-muted/20'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-bold flex items-center gap-2 text-foreground'>
                  <IconUserCheck size={18} className='text-primary' />
                  Penerima Perintah Lembur
                </CardTitle>
                <Badge variant='outline' className='text-[10px] uppercase font-mono font-bold'>
                  BFP FORM 02
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-4 space-y-4'>
              <FieldGroup>
                {/* Pilihan Karyawan dengan Fitur Pencarian & Auto-Close */}
                <Field>
                  <FieldLabel htmlFor='employee-combobox-trigger'>Nama Karyawan *</FieldLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <button
                        id='employee-combobox-trigger'
                        type='button'
                        role='combobox'
                        aria-expanded={openCombobox}
                        className='w-full min-h-[52px] px-3.5 py-2 rounded-xl border border-input bg-background hover:bg-muted/40 transition-colors flex items-center justify-between text-left shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer'
                      >
                        <div className='flex items-center gap-3 min-w-0'>
                          <img
                            src={currentEmployee.avatar}
                            alt={currentEmployee.name}
                            className='size-9 rounded-full object-cover border border-border/80 shrink-0 shadow-2xs'
                          />
                          <div className='min-w-0'>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <span className='font-bold text-sm text-foreground truncate'>
                                {currentEmployee.name}
                              </span>
                              <span className='font-mono text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded'>
                                NIP: {currentEmployee.nip}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground truncate'>
                              {currentEmployee.position} · {currentEmployee.department}
                            </p>
                          </div>
                        </div>
                        <IconSelector className='size-4 shrink-0 text-muted-foreground ml-2' />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align='start'
                      sideOffset={6}
                      className='w-[min(calc(100vw-32px),540px)] p-2.5 rounded-2xl shadow-xl border border-border/80 bg-popover z-50 text-foreground'
                    >
                      {/* Search Bar Input */}
                      <div className='relative mb-2'>
                        <IconSearch className='absolute left-3 top-2.5 size-4 text-muted-foreground' />
                        <input
                          type='text'
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          placeholder='Cari nama karyawan, NIP, jabatan, atau unit...'
                          className='w-full h-9 pl-9 pr-8 text-xs font-medium rounded-lg border border-input bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground'
                          autoFocus
                        />
                        {employeeSearch && (
                          <button
                            type='button'
                            onClick={() => setEmployeeSearch('')}
                            className='absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer'
                          >
                            <IconX className='size-4' />
                          </button>
                        )}
                      </div>

                      {/* List Item Karyawan */}
                      <div className='max-h-64 overflow-y-auto space-y-1 pr-1 overscroll-contain'>
                        {filteredEmployees.length === 0 ? (
                          <div className='p-6 text-center text-xs text-muted-foreground'>
                            Tidak ditemukan karyawan dengan kata kunci "
                            <span className='font-bold text-foreground'>{employeeSearch}</span>".
                          </div>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const isSelected = emp.id === selectedEmpId
                            return (
                              <button
                                key={emp.id}
                                type='button'
                                onClick={() => {
                                  setSelectedEmpId(emp.id)
                                  setCustomLocation('')
                                  setOpenCombobox(false) // Otomatis dropdown close saat dipilih!
                                  setEmployeeSearch('')
                                }}
                                className={cn(
                                  'w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer group',
                                  isSelected
                                    ? 'bg-primary/10 text-foreground ring-1 ring-primary/40 font-semibold'
                                    : 'hover:bg-muted/60 text-foreground',
                                )}
                              >
                                <div className='flex items-center gap-2.5 min-w-0'>
                                  <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    className='size-8 rounded-full object-cover border border-border/60 shrink-0'
                                  />
                                  <div className='min-w-0'>
                                    <div className='flex items-center gap-1.5'>
                                      <span className='font-bold text-xs truncate text-foreground'>
                                        {emp.name}
                                      </span>
                                      <span className='font-mono text-[10.5px] text-muted-foreground'>
                                        NIP: {emp.nip}
                                      </span>
                                    </div>
                                    <p className='text-[11px] text-muted-foreground truncate'>
                                      {emp.position} · {emp.department}
                                    </p>
                                  </div>
                                </div>

                                <div className='flex items-center gap-2 shrink-0 ml-2'>
                                  <span className='text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground hidden sm:inline-block'>
                                    {emp.location}
                                  </span>
                                  {isSelected && (
                                    <IconCheck className='size-4 text-primary shrink-0 stroke-3' />
                                  )}
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </Field>

                {/* Info Auto-filled dari Karyawan */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border border-border/60 text-xs'>
                  <div>
                    <span className='text-muted-foreground block text-[11px]'>Nomor Induk Pegawai (NIP):</span>
                    <strong className='font-mono text-sm text-foreground'>{currentEmployee.nip}</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground block text-[11px]'>Jabatan:</span>
                    <strong className='text-foreground'>{currentEmployee.position}</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground block text-[11px]'>Departemen / Unit:</span>
                    <strong className='text-foreground'>{currentEmployee.department}</strong>
                  </div>
                  <div>
                    <span className='text-muted-foreground block text-[11px]'>Proyek / Lokasi Default:</span>
                    <strong className='text-foreground'>{currentEmployee.location}</strong>
                  </div>
                </div>

                {/* Lokasi Lembur */}
                <Field>
                  <FieldLabel htmlFor='overtime-location'>
                    Lokasi Lembur *
                  </FieldLabel>
                  <div className='relative'>
                    <IconMapPin size={16} className='absolute left-3 top-3 text-muted-foreground' />
                    <Input
                      id='overtime-location'
                      value={customLocation || currentEmployee.location}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder='Contoh: Depot TBBM Plumpang / AFT Tambolaka'
                      className='pl-9'
                      required
                    />
                  </div>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Section 2: Kategori & Detail Penugasan Lembur */}
          <Card className='shadow-xs border-border/80'>
            <CardHeader className='pb-3 border-b bg-muted/20'>
              <CardTitle className='text-sm font-bold flex items-center gap-2 text-foreground'>
                <IconCalendarEvent size={18} className='text-primary' />
                Klasifikasi Hari & Uraian Lembur
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-4 space-y-4'>
              {/* Toggle Hari Kerja vs Hari Libur */}
              <div>
                <FieldLabel className='mb-2 block'>Lembur Pada *</FieldLabel>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => setDayType('workday')}
                    className={cn(
                      'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                      dayType === 'workday'
                        ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary'
                        : 'border-border/80 bg-background text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    <input
                      type='radio'
                      checked={dayType === 'workday'}
                      readOnly
                      className='size-3.5 text-primary'
                    />
                    <span>Hari Kerja (Workday)</span>
                  </button>

                  <button
                    type='button'
                    onClick={() => setDayType('holiday')}
                    className={cn(
                      'flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                      dayType === 'holiday'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs ring-1 ring-blue-600'
                        : 'border-border/80 bg-background text-muted-foreground hover:bg-muted/40',
                    )}
                  >
                    <input
                      type='radio'
                      checked={dayType === 'holiday'}
                      readOnly
                      className='size-3.5 text-blue-600'
                    />
                    <span>Hari Libur (Rest Day / Holiday)</span>
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <Field>
                  <FieldLabel htmlFor='overtime-date'>Tanggal Lembur *</FieldLabel>
                  <Input
                    id='overtime-date'
                    type='date'
                    value={overtimeDate}
                    onChange={(e) => setOvertimeDate(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor='overtime-period'>Periode Lembur *</FieldLabel>
                  <Input
                    id='overtime-period'
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    placeholder='2026-08-01 s.d. 2026-08-31'
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor='overtime-event'>Keterangan Penugasan *</FieldLabel>
                <Input
                  id='overtime-event'
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder='Contoh: Operasional Tambahan & Percepatan Proyek / HUT RI'
                  required
                />
                <div className='flex gap-1.5 flex-wrap mt-1 text-[11px] text-muted-foreground'>
                  <span className='font-semibold'>Preset cepat:</span>
                  <button
                    type='button'
                    onClick={() =>
                      setEventDescription('Operasional Tambahan & Percepatan Proyek')
                    }
                    className='text-primary hover:underline'
                  >
                    Operasional Tambahan
                  </button>
                  <span>·</span>
                  <button
                    type='button'
                    onClick={() => setEventDescription('HUT Republik Indonesia')}
                    className='text-primary hover:underline'
                  >
                    HUT RI
                  </button>
                  <span>·</span>
                  <button
                    type='button'
                    onClick={() => setEventDescription('Maulid Nabi Muhammad SAW')}
                    className='text-primary hover:underline'
                  >
                    Maulid Nabi
                  </button>
                  <span>·</span>
                  <button
                    type='button'
                    onClick={() => setEventDescription('Closing Laporan Bulanan')}
                    className='text-primary hover:underline'
                  >
                    Closing Bulanan
                  </button>
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor='overtime-task'>
                  Uraian Tugas Kerja Lembur *
                </FieldLabel>
                <Textarea
                  id='overtime-task'
                  rows={2}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder='Jelaskan tugas lembur secara rinci (misal: PENGAMANAN SHIFT MALAM & MONITORING PIPA)'
                  className='uppercase font-medium'
                  required
                />
              </Field>
            </CardContent>
          </Card>

          {/* Section 3: Rincian Jam Rencana & Realisasi */}
          <Card className='shadow-xs border-border/80'>
            <CardHeader className='pb-3 border-b bg-muted/20'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-sm font-bold flex items-center gap-2 text-foreground'>
                  <IconClock size={18} className='text-primary' />
                  Rincian Jam Lembur (Rencana & Realisasi)
                </CardTitle>
                <span className='text-xs font-bold font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-md'>
                  Total: {totalHours} Jam
                </span>
              </div>
            </CardHeader>
            <CardContent className='p-4 pt-4 space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='p-3 bg-muted/30 rounded-xl border border-border/70 space-y-3'>
                  <span className='font-bold text-xs text-foreground block border-b pb-1'>
                    1. Jam Lembur Rencana
                  </span>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <span className='text-[10px] text-muted-foreground block mb-1'>Mulai</span>
                      <Input
                        type='time'
                        value={planStartTime}
                        onChange={(e) => setPlanStartTime(e.target.value)}
                        className='h-8 text-xs font-mono font-bold'
                        required
                      />
                    </div>
                    <div>
                      <span className='text-[10px] text-muted-foreground block mb-1'>Selesai</span>
                      <Input
                        type='time'
                        value={planEndTime}
                        onChange={(e) => setPlanEndTime(e.target.value)}
                        className='h-8 text-xs font-mono font-bold'
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className='p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3'>
                  <span className='font-bold text-xs text-primary block border-b border-primary/20 pb-1'>
                    2. Jam Lembur Realisasi
                  </span>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <span className='text-[10px] text-muted-foreground block mb-1'>Mulai</span>
                      <Input
                        type='time'
                        value={actualStartTime}
                        onChange={(e) => setActualStartTime(e.target.value)}
                        className='h-8 text-xs font-mono font-bold'
                        required
                      />
                    </div>
                    <div>
                      <span className='text-[10px] text-muted-foreground block mb-1'>Selesai</span>
                      <Input
                        type='time'
                        value={actualEndTime}
                        onChange={(e) => setActualEndTime(e.target.value)}
                        className='h-8 text-xs font-mono font-bold'
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Rute Persetujuan Terkoneksi Otomatis */}
              <div className='p-3 bg-muted/20 rounded-xl border border-border/70 flex items-center justify-between text-xs'>
                <div>
                  <span className='text-muted-foreground block text-[11px]'>Penerima Persetujuan (Level 1):</span>
                  <strong className='text-foreground'>{approvers.deptHead.name}</strong>{' '}
                  <span className='text-muted-foreground'>({approvers.deptHead.title})</span>
                </div>
                <Badge variant='outline' className='text-[10px] font-semibold text-emerald-700 bg-emerald-50 border-emerald-300'>
                  Alur Berjenjang Aktif
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex gap-3 pb-8'>
            <Button variant='outline' className='flex-1 h-11' asChild>
              <Link to='/overtime'>
                <IconArrowLeft size={16} />
                Batal
              </Link>
            </Button>
            <Button
              type='submit'
              className='flex-2 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md gap-2'
            >
              <IconSend size={16} />
              Buat & Kirim SPKL ke Persetujuan
            </Button>
          </div>
        </form>

        {/* ══════════════════════════════════════════════════════════════════
            KOLOM KANAN: LIVE PREVIEW SURAT PERINTAH KERJA LEMBUR (SPKL)
        ══════════════════════════════════════════════════════════════════ */}
        <div className='sticky top-20 space-y-3'>
          <div className='flex items-center justify-between px-1'>
            <div className='flex items-center gap-1.5 text-xs font-bold text-foreground'>
              <IconSparkles size={16} className='text-amber-500' />
              <span>Live Preview Dokumen Resmi SPKL</span>
            </div>
            <span className='text-[11px] font-mono text-muted-foreground'>
              Otomatis ter-update sesuai input
            </span>
          </div>

          {/* Lembaran Fisik SPKL PT. Bintang Fajar Persada (Identik dengan Gambar 1) */}
          <div className='bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 p-5 sm:p-6 rounded-2xl border-2 border-slate-800 dark:border-zinc-700 shadow-md space-y-0 text-xs select-none'>
            {/* Kop Surat Header PT. Bintang Fajar Persada */}
            <div className='flex items-center gap-2 mb-2'>
              <div className='size-5.5 rounded-sm bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-xs'>
                ★
              </div>
              <h2 className='text-[11px] font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase'>
                PT. BINTANG FAJAR PERSADA
              </h2>
            </div>

            {/* Header Banner SPKL */}
            <div className='bg-slate-200 dark:bg-zinc-800 border border-slate-900 dark:border-zinc-300 py-1.5 text-center font-black text-xs uppercase tracking-wider text-slate-900 dark:text-zinc-100'>
              SURAT PERINTAH KERJA LEMBUR
            </div>

            {/* Kotak Rincian Perintah Lembur */}
            <div className='border-x border-b border-slate-900 dark:border-zinc-300 text-xs'>
              <div className='bg-slate-100 dark:bg-zinc-800/60 p-1 px-2.5 font-bold border-b border-slate-900 dark:border-zinc-300 text-[11px]'>
                Memberikan perintah lembur kepada:
              </div>

              <div className='p-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] leading-tight'>
                {/* Kolom Kiri */}
                <div className='space-y-1'>
                  <div className='flex'>
                    <span className='w-28 font-medium shrink-0'>Nama karyawan</span>
                    <span className='font-bold truncate'>: {currentEmployee.name}</span>
                  </div>
                  <div className='flex'>
                    <span className='w-28 font-medium shrink-0'>NIP</span>
                    <span className='font-mono'>: {currentEmployee.nip}</span>
                  </div>
                  <div className='flex'>
                    <span className='w-28 font-medium shrink-0'>Jabatan</span>
                    <span className='truncate'>: {currentEmployee.position}</span>
                  </div>
                  <div className='flex'>
                    <span className='w-28 font-medium shrink-0'>Lokasi lembur</span>
                    <span className='truncate'>: {effectiveLocation}</span>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <span className='w-24 font-medium shrink-0'>Lembur pada</span>
                    <div className='flex items-center gap-3 text-[10.5px]'>
                      <label className='flex items-center gap-1'>
                        <input
                          type='checkbox'
                          readOnly
                          checked={dayType === 'workday'}
                          className='size-3 rounded accent-primary'
                        />
                        <span className={cn(dayType === 'workday' && 'font-bold')}>
                          Hari kerja
                        </span>
                      </label>
                      <label className='flex items-center gap-1'>
                        <input
                          type='checkbox'
                          readOnly
                          checked={dayType === 'holiday'}
                          className='size-3 rounded accent-blue-600'
                        />
                        <span className={cn(dayType === 'holiday' && 'font-bold text-blue-700 dark:text-blue-400')}>
                          Hari libur
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className='flex'>
                    <span className='w-24 font-medium shrink-0'>Periode lembur</span>
                    <span className='truncate'>: {periodLabel}</span>
                  </div>
                  <div className='flex'>
                    <span className='w-24 font-medium shrink-0'>Keterangan</span>
                    <span className='font-bold truncate'>: {eventDescription}</span>
                  </div>
                </div>
              </div>

              {/* Uraian Tugas Kerja Lembur */}
              <div className='p-2 px-2.5 bg-slate-50 dark:bg-zinc-900 border-t border-slate-900 dark:border-zinc-300 text-[11px] font-medium'>
                <strong>Uraian Tugas Kerja Lembur :</strong>{' '}
                <span className='uppercase font-bold text-slate-900 dark:text-zinc-100'>
                  {taskDescription || 'TUGAS OPERASIONAL LAPANGAN'}
                </span>
              </div>

              {/* Tabel Jam Lembur 4 Sub-Kolom */}
              <table className='w-full text-center text-[10.5px] border-collapse border-t border-slate-900 dark:border-zinc-300'>
                <thead>
                  <tr className='bg-slate-200 dark:bg-zinc-800 font-bold'>
                    <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-8'>
                      No
                    </th>
                    <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-24'>
                      Tanggal lembur
                    </th>
                    <th colSpan={4} className='border-r border-b border-slate-900 dark:border-zinc-300 p-0.5'>
                      Jam lembur
                    </th>
                    <th rowSpan={2} className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-24'>
                      Total Jam Lembur
                    </th>
                    <th colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-0.5 w-28'>
                      Paraf
                    </th>
                  </tr>
                  <tr className='bg-slate-200 dark:bg-zinc-800 font-bold'>
                    <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-12'>Mulai</th>
                    <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-12'>Selesai</th>
                    <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-12'>Mulai</th>
                    <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-12'>Selesai</th>
                    <th className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 w-14'>Karyawan</th>
                    <th className='border-b border-slate-900 dark:border-zinc-300 p-1 w-14'>Atasan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>
                      1
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono font-medium'>
                      {formattedOvertimeDate}
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>
                      {planStartTime}
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>
                      {planEndTime}
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>
                      {actualStartTime}
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono'>
                      {actualEndTime}
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 font-mono font-bold text-slate-900 dark:text-zinc-100'>
                      {totalHours} Jam
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1.5 text-[9px] text-muted-foreground'></td>
                    <td className='border-b border-slate-900 dark:border-zinc-300 p-1.5 text-[9px] text-muted-foreground'></td>
                  </tr>

                  {/* Baris Total Jam Lembur */}
                  <tr className='font-bold bg-slate-100 dark:bg-zinc-900'>
                    <td
                      colSpan={6}
                      className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 text-center uppercase tracking-wider text-[10px]'
                    >
                      TOTAL JAM LEMBUR
                    </td>
                    <td className='border-r border-b border-slate-900 dark:border-zinc-300 p-1 font-black text-slate-900 dark:text-zinc-100 text-[11px]'>
                      {totalHours} Jam
                    </td>
                    <td colSpan={2} className='border-b border-slate-900 dark:border-zinc-300 p-1'></td>
                  </tr>
                </tbody>
              </table>

              {/* Pengesahan Tanda Tangan SPKL 2 Kolom */}
              <div className='grid grid-cols-2 divide-x divide-slate-900 dark:divide-zinc-300 border-b border-slate-900 dark:border-zinc-300 text-center'>
                <div className='p-2 flex flex-col justify-between min-h-[90px]'>
                  <p className='text-[10px] font-semibold text-muted-foreground'>Dibuat oleh:</p>
                  <div className='my-1'>
                    <span className='font-script text-base text-slate-800 italic'>{currentEmployee.name}</span>
                  </div>
                  <div>
                    <p className='font-bold underline text-[11px]'>{currentEmployee.name}</p>
                    <p className='text-muted-foreground text-[10px]'>{currentEmployee.position}</p>
                  </div>
                </div>

                <div className='p-2 flex flex-col justify-between min-h-[90px]'>
                  <p className='text-[10px] font-semibold text-muted-foreground'>Diterima oleh:</p>
                  <div className='my-1'>
                    <span className='font-bold text-[9px] text-emerald-700 border border-emerald-400 bg-emerald-50 px-2 py-0.5 rounded'>
                      ✓ ACC DIGITAL: {approvers.deptHead.name.split(',')[0]}
                    </span>
                  </div>
                  <div>
                    <p className='font-bold underline text-[11px]'>{approvers.deptHead.name}</p>
                    <p className='text-muted-foreground text-[10px]'>{approvers.deptHead.title}</p>
                  </div>
                </div>
              </div>

              {/* Catatan Kaki SPKL */}
              <div className='p-2 bg-slate-50 dark:bg-zinc-900 text-[9px] text-slate-600 dark:text-zinc-400 space-y-0.5 leading-snug'>
                <p>* Surat Perintah Kerja Lembur (SPKL) harus di paraf dan di tanda tangan oleh karyawan dan user</p>
                <p>* Surat Perintah Kerja Lembur (SPKL) harus diserahkan paling lambat tanggal 10 setiap bulannya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
