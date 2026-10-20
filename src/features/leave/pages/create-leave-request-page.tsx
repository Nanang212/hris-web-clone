import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconCheck,
  IconFileCertificate,
  IconHeartbeat,
  IconMapPin,
  IconSearch,
  IconSelector,
  IconSend,
  IconSparkles,
  IconStethoscope,
  IconUpload,
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
import { LeaveTabs } from '@/features/leave/components/leave-tabs'
import { approvalSyncStore } from '@/shared/lib/approval-sync-store'
import { getTwoTierApprovers } from '@/features/report/utils/employee-attendance-generator'
import type { LeaveRequest } from '@/features/leave/types'
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
]

type LeaveTypeKey = 'annual' | 'sick' | 'personal' | 'maternity'

const LEAVE_TYPES: { key: LeaveTypeKey; label: string; icon: string; quota: string; description: string }[] = [
  {
    key: 'annual',
    label: 'Cuti Tahunan',
    icon: '🌴',
    quota: '12 Hari / Tahun',
    description: 'Hak cuti tahunan reguler bagi karyawan tetap & kontrak',
  },
  {
    key: 'sick',
    label: 'Izin Sakit (Sick Leave)',
    icon: '🩺',
    quota: 'Sesuai Rekomendasi Medis',
    description: 'Dispensasi sakit wajib menyertakan Surat Keterangan Dokter (SKD)',
  },
  {
    key: 'personal',
    label: 'Izin Pribadi / Khusus',
    icon: '📅',
    quota: 'Sesuai Regulasi PKB',
    description: 'Keperluan penting (pernikahan, kedukaan, keluarga inti)',
  },
  {
    key: 'maternity',
    label: 'Cuti Melahirkan',
    icon: '👶',
    quota: '3 Bulan (90 Hari)',
    description: 'Cuti bersalin bagi karyawati sesuai perundangan',
  },
]

export function CreateLeaveRequestPage() {
  const navigate = useNavigate()

  // ── Form State ──
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption>(EMPLOYEES[0])
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false)

  const [leaveType, setLeaveType] = useState<LeaveTypeKey>('sick')
  const [startDate, setStartDate] = useState('2026-08-10')
  const [endDate, setEndDate] = useState('2026-08-11')
  const [halfDay, setHalfDay] = useState<'no' | 'morning' | 'afternoon'>('no')
  const [reason, setReason] = useState('Istirahat Pemulihan Sakit dengan Surat Keterangan Dokter')

  // Sick Leave Medical Fields
  const [diagnosis, setDiagnosis] = useState('Dyspepsia Syndrome & Febris Akut (Kelelahan Fisik)')
  const [clinicOrHospital, setClinicOrHospital] = useState('Klinik Pratama Pertamina Bina Medika')
  const [doctorName, setDoctorName] = useState('dr. H. Hendra Wicaksono, Sp.Ok')
  const [attachmentFileName, setAttachmentFileName] = useState('SKD_Pertamina_Bina_Medika_2026.pdf')

  // Calculate Duration
  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 1
    const start = dayjs(startDate)
    const end = dayjs(endDate)
    const diff = end.diff(start, 'day') + 1
    if (diff <= 0) return 1
    if (halfDay !== 'no') return 0.5
    return diff
  }, [startDate, endDate, halfDay])

  // Approver Mapping
  const approvers = useMemo(() => {
    return getTwoTierApprovers(selectedEmployee.department, selectedEmployee.project)
  }, [selectedEmployee])

  // Document Number & YearMonth
  const yearMonth = useMemo(() => {
    return startDate ? startDate.slice(0, 7) : '2026-08'
  }, [startDate])

  const documentNumber = useMemo(() => {
    const seq = selectedEmployee.nip ? selectedEmployee.nip.slice(-3) : '001'
    if (leaveType === 'sick') {
      return `SKD/BFP-MED/${selectedEmployee.id}/${yearMonth.replace('-', '/')}/${seq}`
    }
    return `CUTI/BFP/${selectedEmployee.id}/${yearMonth.replace('-', '/')}/${seq}`
  }, [leaveType, selectedEmployee.id, selectedEmployee.nip, yearMonth])

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return EMPLOYEES
    const q = employeeSearch.toLowerCase().trim()
    return EMPLOYEES.filter(
      (emp) =>
        emp.name.toLowerCase().includes(q) ||
        emp.nip.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q),
    )
  }, [employeeSearch])

  // Quick Preset Reasons
  const presetReasons = useMemo(() => {
    if (leaveType === 'sick') {
      return [
        'Istirahat Pemulihan Sakit dengan Surat Keterangan Dokter',
        'Kelelahan Fisik & Pengobatan Rawat Jalan',
        'Pemeriksaan Kontrol Pasca Rawat Inap',
      ]
    }
    if (leaveType === 'annual') {
      return [
        'Cuti Tahunan untuk Keperluan Keluarga & Istirahat',
        'Agenda Liburan Keluarga Luar Kota',
        'Pengurusan Administrasi Kependudukan',
      ]
    }
    if (leaveType === 'maternity') {
      return [
        'Cuti Bersalin / Melahirkan Sesuai HPL Rumah Sakit',
        'Masa Pemulihan Pasca Persalinan',
      ]
    }
    return [
      'Acara Pernikahan Keluarga Inti',
      'Urusan Mendesak Keluarga',
      'Izin Khusus Resmi Keagamaan',
    ]
  }, [leaveType])

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newLeave: LeaveRequest = {
      id: `REQ-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      employee: selectedEmployee.name,
      employeeRole: `${selectedEmployee.position} · ${selectedEmployee.department}`,
      leaveType,
      startDate,
      endDate,
      duration: String(durationDays),
      status: 'pending',
      reason:
        leaveType === 'sick' && diagnosis
          ? `${reason} (Diagnosa: ${diagnosis} · RS/Klinik: ${clinicOrHospital})`
          : reason,
      submittedAt: new Date().toISOString(),
      coverage: 'safe',
    }

    approvalSyncStore.addLeave(newLeave)

    snackbar.success(
      `Pengajuan ${leaveType === 'sick' ? 'Sick Leave' : 'Cuti'} atas nama ${selectedEmployee.name} (${durationDays} Hari) berhasil diajukan! Notifikasi persetujuan diteruskan ke ${approvers.deptHead.name}.`,
    )

    navigate({ to: '/leave/requests' })
  }

  return (
    <AppMain
      title='Buat Pengajuan Cuti & Izin Sakit'
      subtitle='Formulir resmi pengajuan cuti tahunan, izin sakit (sick leave), dan dispensasi resmi PT. Bintang Fajar Persada.'
      breadcrumbs={[
        { label: m.app_layout_nav_time_management() },
        { to: '/leave', label: m.app_layout_nav_leave() },
        { to: '/leave/requests', label: m.leave_tab_requests() },
        { label: 'Buat Pengajuan Cuti' },
      ]}
      actions={
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild className='gap-1.5'>
            <Link to='/leave/requests'>
              <IconArrowLeft size={16} />
              <span>Kembali</span>
            </Link>
          </Button>
          <Button
            type='button'
            onClick={handleSubmit}
            className='gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs'
          >
            <IconSend size={16} />
            <span>Kirim Pengajuan</span>
          </Button>
        </div>
      }
      className='gap-6 bg-muted/20'
    >
      <LeaveTabs active='requests' />

      {/* ── Two Column Master Layout (Left: Form, Right: Live Document Overview) ── */}
      <div className='grid grid-cols-1 xl:grid-cols-12 gap-6 items-start'>
        {/* ══════════════════════════════════════════════════════════════════
            KOLOM KIRI: FORMULIR INPUT PENGAJUAN (6 Kolom)
        ══════════════════════════════════════════════════════════════════ */}
        <div className='xl:col-span-6 space-y-6'>
          <Card className='border border-border/80 shadow-xs rounded-2xl overflow-hidden'>
            <CardHeader className='p-5 pb-3 border-b border-border/70 bg-muted/30'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-base font-bold text-foreground flex items-center gap-2'>
                    <span>Formulir Pengajuan Cuti / Izin</span>
                    <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 text-[11px] font-bold'>
                      HRIS Form
                    </Badge>
                  </CardTitle>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Isi data cuti/izin karyawan. Dokumen resmi di kolom kanan akan diperbarui secara otomatis.
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-5 space-y-5'>
              <FieldGroup className='space-y-4'>
                {/* 1. Pilih Karyawan (Searchable Combobox dengan Auto-Close) */}
                <Field>
                  <div className='flex items-center justify-between'>
                    <FieldLabel className='text-xs font-bold text-foreground'>
                      Nama Karyawan Pemohon *
                    </FieldLabel>
                    <span className='text-[11px] text-muted-foreground'>
                      Pilih dari master pegawai BFP
                    </span>
                  </div>

                  <Popover open={employeeDropdownOpen} onOpenChange={setEmployeeDropdownOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type='button'
                        className='w-full flex items-center justify-between p-2.5 rounded-xl border border-input bg-background hover:bg-muted/40 transition-colors text-left shadow-xs focus:ring-2 focus:ring-primary/20 focus:outline-hidden'
                      >
                        <div className='flex items-center gap-3 min-w-0'>
                          <img
                            src={selectedEmployee.avatar}
                            alt={selectedEmployee.name}
                            className='size-9 rounded-full object-cover border border-border shrink-0'
                          />
                          <div className='min-w-0'>
                            <p className='text-xs font-bold text-foreground truncate'>
                              {selectedEmployee.name}
                            </p>
                            <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
                              <span className='font-mono font-semibold text-primary'>NIP: {selectedEmployee.nip}</span>
                              <span>•</span>
                              <span className='truncate'>{selectedEmployee.position}</span>
                            </div>
                          </div>
                        </div>
                        <IconSelector size={16} className='text-muted-foreground shrink-0 ml-2' />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className='w-[380px] p-2 rounded-xl shadow-xl' align='start'>
                      <div className='relative mb-2'>
                        <IconSearch size={14} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground' />
                        <Input
                          placeholder='Cari nama, NIP, jabatan, atau unit...'
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className='pl-8 pr-7 h-8.5 text-xs'
                          autoFocus
                        />
                        {employeeSearch && (
                          <button
                            type='button'
                            onClick={() => setEmployeeSearch('')}
                            className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5'
                          >
                            <IconX size={12} />
                          </button>
                        )}
                      </div>

                      <div className='max-h-60 overflow-y-auto space-y-1 divide-y divide-border/40'>
                        {filteredEmployees.length === 0 ? (
                          <p className='text-center py-4 text-xs text-muted-foreground'>
                            Tidak ada karyawan yang cocok dengan pencarian
                          </p>
                        ) : (
                          filteredEmployees.map((emp) => {
                            const isSelected = emp.id === selectedEmployee.id
                            return (
                              <button
                                key={emp.id}
                                type='button'
                                onClick={() => {
                                  setSelectedEmployee(emp)
                                  setEmployeeDropdownOpen(false)
                                  setEmployeeSearch('')
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-xs',
                                  isSelected
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'hover:bg-muted/70 text-foreground',
                                )}
                              >
                                <div className='flex items-center gap-2.5 min-w-0'>
                                  <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    className='size-7 rounded-full object-cover shrink-0'
                                  />
                                  <div className='min-w-0'>
                                    <p className='font-bold truncate text-[11px] leading-tight'>{emp.name}</p>
                                    <p className='text-[10px] text-muted-foreground font-mono'>
                                      {emp.nip} · {emp.position}
                                    </p>
                                  </div>
                                </div>
                                {isSelected && <IconCheck size={14} className='text-primary shrink-0 ml-1' />}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Info Badge Profil Karyawan Terpilih */}
                  <div className='mt-2 p-2.5 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-[11px]'>
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                      <IconMapPin size={13} className='text-primary shrink-0' />
                      <span className='truncate font-medium'>
                        {selectedEmployee.department} · {selectedEmployee.location}
                      </span>
                    </div>
                    <Badge variant='outline' className='text-[10px] font-mono font-bold bg-background text-foreground border-border shrink-0'>
                      {selectedEmployee.project}
                    </Badge>
                  </div>
                </Field>

                {/* 2. Jenis Cuti (Visual Pills Selector) */}
                <Field>
                  <FieldLabel className='text-xs font-bold text-foreground'>
                    Jenis Cuti / Izin *
                  </FieldLabel>
                  <div className='grid grid-cols-2 gap-2 mt-1'>
                    {LEAVE_TYPES.map((type) => {
                      const isSelected = leaveType === type.key
                      return (
                        <button
                          key={type.key}
                          type='button'
                          onClick={() => {
                            setLeaveType(type.key)
                            if (type.key === 'sick') {
                              setReason('Istirahat Pemulihan Sakit dengan Surat Keterangan Dokter')
                            } else if (type.key === 'annual') {
                              setReason('Cuti Tahunan untuk Keperluan Keluarga & Istirahat')
                            } else if (type.key === 'maternity') {
                              setReason('Cuti Bersalin / Melahirkan Sesuai HPL Rumah Sakit')
                            } else {
                              setReason('Urusan Mendesak Keluarga & Kepentingan Pribadi')
                            }
                          }}
                          className={cn(
                            'p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between',
                            isSelected
                              ? 'border-primary bg-primary/5 text-primary shadow-xs ring-1 ring-primary/30'
                              : 'border-border/80 bg-background text-foreground hover:bg-muted/40',
                          )}
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-base'>{type.icon}</span>
                            {isSelected && <IconCheck size={14} className='text-primary' />}
                          </div>
                          <p className='font-bold text-xs mt-1 leading-tight'>{type.label}</p>
                          <p className='text-[10px] text-muted-foreground mt-0.5'>{type.quota}</p>
                        </button>
                      )
                    })}
                  </div>
                </Field>

                {/* 3. Periode Cuti & Durasi */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <Field>
                    <FieldLabel className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                      <IconCalendarEvent size={13} className='text-primary' />
                      <span>Tanggal Mulai</span>
                    </FieldLabel>
                    <Input
                      type='date'
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className='h-9 text-xs font-medium'
                    />
                  </Field>

                  <Field>
                    <FieldLabel className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                      <IconCalendarEvent size={13} className='text-primary' />
                      <span>Tanggal Selesai</span>
                    </FieldLabel>
                    <Input
                      type='date'
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className='h-9 text-xs font-medium'
                    />
                  </Field>
                </div>

                {/* 4. Durasi & Opsi Setengah Hari */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <Field>
                    <FieldLabel className='text-xs font-bold text-foreground'>
                      Total Durasi Cuti
                    </FieldLabel>
                    <div className='h-9 px-3 rounded-md border border-input bg-muted/30 flex items-center justify-between text-xs font-bold text-foreground'>
                      <span>{durationDays} Hari Kalender / Kerja</span>
                      <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20 text-[10px]'>
                        Otomatis
                      </Badge>
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel className='text-xs font-bold text-foreground'>
                      Opsi Setengah Hari (Half Day)
                    </FieldLabel>
                    <select
                      value={halfDay}
                      onChange={(e) => setHalfDay(e.target.value as 'no' | 'morning' | 'afternoon')}
                      className='h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:outline-hidden w-full'
                    >
                      <option value='no'>Tidak (Sehari Penuh)</option>
                      <option value='morning'>Ya - Setengah Hari Pagi</option>
                      <option value='afternoon'>Ya - Setengah Hari Siang</option>
                    </select>
                  </Field>
                </div>

                {/* 5. Alasan / Keperluan Cuti */}
                <Field>
                  <div className='flex items-center justify-between'>
                    <FieldLabel className='text-xs font-bold text-foreground'>
                      Alasan / Keperluan Cuti *
                    </FieldLabel>
                    <span className='text-[10px] text-muted-foreground'>Sebutkan rincian</span>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder='Tuliskan alasan pengajuan cuti atau dispensasi...'
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className='text-xs leading-relaxed'
                  />
                  {/* Preset Suggestions */}
                  <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                    <span className='text-[10px] text-muted-foreground flex items-center gap-1 font-semibold'>
                      <IconSparkles size={11} className='text-amber-500' />
                      Template:
                    </span>
                    {presetReasons.map((preset, idx) => (
                      <button
                        key={idx}
                        type='button'
                        onClick={() => setReason(preset)}
                        className='text-[10px] px-2 py-0.5 rounded-full border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors'
                      >
                        {preset.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </Field>

                {/* 6. Bidang Khusus SICK LEAVE (Izin Sakit dengan SKD Dokter) */}
                {leaveType === 'sick' && (
                  <div className='p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 dark:border-rose-900 space-y-3'>
                    <div className='flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs'>
                      <IconHeartbeat size={16} className='text-rose-600 shrink-0' />
                      <span>Kelengkapan Medis & Surat Keterangan Dokter (SKD)</span>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <Field>
                        <FieldLabel className='text-[11px] font-semibold text-foreground'>
                          Diagnosa Medis Dokter
                        </FieldLabel>
                        <Input
                          placeholder='Contoh: Dyspepsia Syndrome, Febris Akut...'
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          className='h-8.5 text-xs'
                        />
                      </Field>

                      <Field>
                        <FieldLabel className='text-[11px] font-semibold text-foreground'>
                          Fasilitas Kesehatan / RS / Klinik
                        </FieldLabel>
                        <Input
                          placeholder='Contoh: Klinik Pratama Pertamina Bina Medika'
                          value={clinicOrHospital}
                          onChange={(e) => setClinicOrHospital(e.target.value)}
                          className='h-8.5 text-xs'
                        />
                      </Field>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      <Field>
                        <FieldLabel className='text-[11px] font-semibold text-foreground flex items-center gap-1'>
                          <IconStethoscope size={13} className='text-rose-600' />
                          <span>Nama Dokter Pemeriksa</span>
                        </FieldLabel>
                        <Input
                          placeholder='Contoh: dr. H. Hendra Wicaksono, Sp.Ok'
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className='h-8.5 text-xs'
                        />
                      </Field>

                      <Field>
                        <FieldLabel className='text-[11px] font-semibold text-foreground flex items-center gap-1'>
                          <IconUpload size={13} className='text-rose-600' />
                          <span>Lampiran Dokumen SKD (PDF/JPG)</span>
                        </FieldLabel>
                        <div className='relative flex items-center'>
                          <Input
                            type='file'
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) setAttachmentFileName(f.name)
                            }}
                            className='h-8.5 text-xs cursor-pointer'
                          />
                        </div>
                      </Field>
                    </div>

                    <div className='p-2 rounded bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-[11px]'>
                      <div className='flex items-center gap-1.5'>
                        <IconFileCertificate size={15} className='text-emerald-600 shrink-0' />
                        <span className='font-medium text-foreground truncate max-w-[220px]'>
                          {attachmentFileName}
                        </span>
                      </div>
                      <Badge variant='outline' className='bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold'>
                        ✓ Validasi SKD
                      </Badge>
                    </div>
                  </div>
                )}

                {/* 7. Entitlement Kuota Cuti Card */}
                <div className='p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900'>
                  <div className='flex items-center justify-between text-xs font-bold text-blue-950 dark:text-blue-300'>
                    <span>Ringkasan Kuota Hak Cuti Karyawan</span>
                    <Badge variant='outline' className='bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-bold'>
                      Tahun Berjalan 2026
                    </Badge>
                  </div>
                  <div className='grid grid-cols-3 gap-2 mt-2.5 text-center'>
                    <div className='p-2 rounded-lg bg-background border border-border/80'>
                      <p className='text-[10px] text-muted-foreground'>Hak Tersedia</p>
                      <p className='text-sm font-black text-emerald-600 mt-0.5'>12 Hari</p>
                    </div>
                    <div className='p-2 rounded-lg bg-background border border-border/80'>
                      <p className='text-[10px] text-muted-foreground'>Pengajuan Ini</p>
                      <p className='text-sm font-black text-primary mt-0.5'>{durationDays} Hari</p>
                    </div>
                    <div className='p-2 rounded-lg bg-background border border-border/80'>
                      <p className='text-[10px] text-muted-foreground'>Sisa Kuota</p>
                      <p className='text-sm font-black text-foreground mt-0.5'>
                        {Math.max(0, 12 - 1 - durationDays)} Hari
                      </p>
                    </div>
                  </div>
                </div>
              </FieldGroup>

              {/* Form Buttons */}
              <div className='pt-2 flex items-center justify-end gap-2.5 border-t border-border/70'>
                <Button variant='outline' asChild>
                  <Link to='/leave/requests'>Batalkan</Link>
                </Button>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  className='bg-primary text-primary-foreground font-bold shadow-xs gap-1.5'
                >
                  <IconSend size={15} />
                  <span>Kirim Pengajuan Cuti / Izin</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            KOLOM KANAN: LIVE DOCUMENT PREVIEW OVERVIEW (6 Kolom)
        ══════════════════════════════════════════════════════════════════ */}
        <div className='xl:col-span-6 xl:sticky xl:top-6 space-y-3'>
          {/* Top Bar Preview Indicators */}
          <div className='flex items-center justify-between px-1'>
            <div className='flex items-center gap-2'>
              <span className='size-2 rounded-full bg-emerald-500 animate-pulse' />
              <span className='text-xs font-bold text-foreground uppercase tracking-wider'>
                Live Document Overview
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold'>
                Draft Pengajuan Baru
              </Badge>
              <Badge variant='outline' className='bg-background text-muted-foreground border-border text-[10px] font-mono'>
                A4 Official Layout
              </Badge>
            </div>
          </div>

          {/* Official Document Sheet */}
          <div className='bg-white text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 p-6 sm:p-7 rounded-2xl border-2 border-slate-300 dark:border-zinc-800 shadow-md space-y-5'>
            {/* ── KOP PT BINTANG FAJAR PERSADA ── */}
            <div className='flex items-center justify-between pb-3 border-b-2 border-slate-900 dark:border-zinc-100 gap-4'>
              <div className='flex items-center gap-3'>
                <div className='relative size-9 flex items-center justify-center shrink-0'>
                  <svg viewBox='0 0 100 100' className='size-9'>
                    <polygon
                      points='50,5 64,35 98,38 72,62 80,95 50,78 20,95 28,62 2,38 36,35'
                      className='fill-amber-500 stroke-blue-900'
                      strokeWidth='4'
                    />
                    <path
                      d='M10 50 Q 50 20 90 50 Q 50 80 10 50'
                      fill='none'
                      className='stroke-blue-800'
                      strokeWidth='5'
                    />
                  </svg>
                </div>
                <div>
                  <h1 className='text-lg font-black tracking-wider text-blue-950 dark:text-blue-400 leading-none'>
                    PT. BINTANG FAJAR PERSADA
                  </h1>
                  <p className='text-[8.5px] tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 font-semibold uppercase'>
                    Manpower Supply & Facility Support Services
                  </p>
                </div>
              </div>

              <div className='text-right'>
                <span className='inline-block px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-mono text-[10px] font-bold border border-slate-300 dark:border-zinc-700'>
                  {documentNumber}
                </span>
              </div>
            </div>

            {/* Document Title Header Banner */}
            <div className='text-center space-y-0.5'>
              <h2 className='text-sm sm:text-base font-black uppercase tracking-wide underline underline-offset-4 text-blue-950 dark:text-blue-400'>
                {leaveType === 'sick'
                  ? 'FORMULIR VERIFIKASI SICK LEAVE (IZIN SAKIT)'
                  : 'FORMULIR PERMOHONAN CUTI KARYAWAN'}
              </h2>
              <p className='text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold'>
                {leaveType === 'sick'
                  ? 'Rekap Kesehatan Kerja & Dispensasi Medis Karyawan'
                  : 'Divisi Sumber Daya Manusia & General Affairs'}
              </p>
            </div>

            {/* ── SECTION INFORMASI PEGAWAI ── */}
            <div className='rounded-lg border border-slate-300 dark:border-zinc-700 p-4 bg-slate-50/50 dark:bg-zinc-900/40 text-xs space-y-3'>
              <div className='flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2'>
                <span className='font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-zinc-300'>
                  Data Pemohon & Penempatan
                </span>
                <span className='inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-[10px]'>
                  <span className='size-1.5 rounded-full bg-amber-500 animate-pulse shrink-0' />
                  Menunggu Persetujuan
                </span>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs'>
                <div className='space-y-1.5'>
                  <div className='flex items-baseline gap-2'>
                    <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Nama Pemohon</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='font-bold text-slate-900 dark:text-zinc-100'>{selectedEmployee.name}</span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>NIP Pegawai</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='font-mono text-slate-800 dark:text-zinc-200'>{selectedEmployee.nip}</span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Jabatan</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='text-slate-800 dark:text-zinc-200'>{selectedEmployee.position}</span>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <div className='flex items-baseline gap-2'>
                    <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Departemen</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='text-slate-800 dark:text-zinc-200'>{selectedEmployee.department}</span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Lokasi / Proyek</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='text-slate-800 dark:text-zinc-200'>
                      {selectedEmployee.location === selectedEmployee.project
                        ? selectedEmployee.location
                        : `${selectedEmployee.location} (${selectedEmployee.project})`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION DETAIL PERMOHONAN CUTI / DISPENSASI ── */}
            <div className='rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 p-4 space-y-3 text-xs'>
              <div className='flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2'>
                <span className='font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-zinc-300'>
                  Rincian Pengajuan Cuti / Dispensasi
                </span>
                <Badge variant='outline' className='bg-primary/10 text-primary border-primary/30 text-[10px] font-bold px-2.5 py-0.5'>
                  {LEAVE_TYPES.find((t) => t.key === leaveType)?.label}
                </Badge>
              </div>

              <div className='flex flex-wrap items-center justify-between gap-2 text-xs'>
                <div className='flex items-baseline gap-2'>
                  <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Periode Tanggal</span>
                  <span className='text-slate-400 shrink-0'>:</span>
                  <span className='font-bold text-slate-900 dark:text-zinc-100'>
                    {startDate} <span className='font-normal text-muted-foreground'>s.d.</span> {endDate}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='font-semibold text-slate-600 dark:text-zinc-400 text-[11px]'>Total Durasi:</span>
                  <span className='font-black text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900'>
                    {durationDays} Hari {halfDay !== 'no' && <span className='text-[10px] font-normal text-muted-foreground'>({halfDay === 'morning' ? 'Pagi' : 'Siang'})</span>}
                  </span>
                </div>
              </div>

              <div className='flex items-start gap-2 text-xs pt-2 border-t border-slate-200/80 dark:border-zinc-800/80'>
                <span className='w-28 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Keperluan / Alasan</span>
                <span className='text-slate-400 shrink-0'>:</span>
                <span className='text-slate-800 dark:text-zinc-200 leading-relaxed font-medium'>
                  {reason || '-'}
                </span>
              </div>
            </div>

            {/* ── SECTION KHUSUS IZIN SAKIT (SKD) ── */}
            {leaveType === 'sick' && (
              <div className='rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-3 text-xs'>
                <div className='flex items-center justify-between border-b border-rose-200/80 dark:border-rose-900/40 pb-2'>
                  <span className='font-bold text-rose-950 dark:text-rose-300 flex items-center gap-1.5 text-xs'>
                    <IconHeartbeat size={15} className='text-rose-600 shrink-0' />
                    Verifikasi Medis & Surat Keterangan Dokter (SKD)
                  </span>
                  <Badge variant='outline' className='bg-emerald-100 text-emerald-800 border-emerald-300 text-[9px] font-bold font-mono'>
                    VALIDATED BY HRIS
                  </Badge>
                </div>

                <div className='space-y-2 text-xs'>
                  <div className='flex items-start gap-2'>
                    <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Diagnosa Dokter</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='font-bold italic text-slate-900 dark:text-zinc-100 leading-snug'>
                      {diagnosis}
                    </span>
                  </div>

                  <div className='flex items-start gap-2'>
                    <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Fasilitas Kesehatan</span>
                    <span className='text-slate-400 shrink-0'>:</span>
                    <span className='text-slate-800 dark:text-zinc-200 font-medium'>{clinicOrHospital}</span>
                  </div>

                  <div className='flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-200/60 dark:border-rose-900/40'>
                    <div className='flex items-baseline gap-2'>
                      <span className='w-32 shrink-0 font-semibold text-slate-600 dark:text-zinc-400'>Dokter Pemeriksa</span>
                      <span className='text-slate-400 shrink-0'>:</span>
                      <span className='text-slate-800 dark:text-zinc-200 font-medium'>{doctorName}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-primary font-mono text-[11px] font-semibold bg-white dark:bg-zinc-900 px-2.5 py-1 rounded border border-rose-200 dark:border-rose-900/60 shadow-xs max-w-full overflow-hidden'>
                      <IconFileCertificate className='size-3.5 text-rose-600 shrink-0' />
                      <span className='truncate max-w-[220px]' title={attachmentFileName}>{attachmentFileName}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION PENGESAHAN & TANDA TANGAN DIGITAL 3 KOLOM ── */}
            <div className='pt-2 border-t-2 border-slate-900 dark:border-zinc-300 space-y-3'>
              <div className='text-left'>
                <p className='text-[10px] font-semibold text-slate-700 dark:text-zinc-300'>
                  {selectedEmployee.location}, {dayjs().format('DD MMMM YYYY')}
                </p>
              </div>

              <div className='grid grid-cols-3 gap-3 text-center text-xs'>
                {/* Kolom 1: Pemohon */}
                <div className='flex flex-col items-center justify-between min-h-[110px] p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/20'>
                  <p className='text-[10px] font-semibold text-muted-foreground'>Yang mengajukan,</p>
                  <div className='my-1 py-1 px-2 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-center'>
                    <span className='text-[8.5px] font-bold text-primary block'>✓ DIAJUKAN VIA HRIS</span>
                    <span className='text-[8px] font-mono text-muted-foreground'>Akun Terverifikasi</span>
                  </div>
                  <div>
                    <p className='font-bold underline text-[11px]'>{selectedEmployee.name}</p>
                    <p className='text-muted-foreground text-[9px]'>{selectedEmployee.position}</p>
                  </div>
                </div>

                {/* Kolom 2: Mengetahui (Head Departemen) */}
                <div className='flex flex-col items-center justify-between min-h-[110px] p-2 rounded-lg border border-dashed border-amber-300 bg-amber-50/40 dark:bg-amber-950/20'>
                  <p className='text-[10px] font-semibold text-muted-foreground'>Mengetahui (Tahap 1),</p>
                  <div className='my-1 py-1 px-2 rounded-md border border-amber-300 bg-amber-100/60 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-center'>
                    <span className='text-[8.5px] font-bold block uppercase'>MENUNGGU ACC</span>
                    <span className='text-[8px] font-mono'>Head Departemen</span>
                  </div>
                  <div>
                    <p className='font-bold underline text-[11px]'>{approvers.deptHead.name}</p>
                    <p className='text-muted-foreground text-[9px]'>{approvers.deptHead.title}</p>
                  </div>
                </div>

                {/* Kolom 3: Menyetujui (Head Divisi & HRD) */}
                <div className='flex flex-col items-center justify-between min-h-[110px] p-2 rounded-lg border border-dashed border-slate-300 dark:border-zinc-800 bg-muted/20'>
                  <p className='text-[10px] font-semibold text-muted-foreground'>Menyetujui (Tahap 2),</p>
                  <div className='my-1 py-1 px-2 rounded-md border border-border bg-background text-muted-foreground text-center'>
                    <span className='text-[8.5px] font-bold block uppercase'>MENUNGGU ACC</span>
                    <span className='text-[8px] font-mono'>Head Divisi / HRD</span>
                  </div>
                  <div>
                    <p className='font-bold underline text-[11px]'>{approvers.divHead.name}</p>
                    <p className='text-muted-foreground text-[9px]'>{approvers.divHead.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dokumen Catatan Kaki */}
            <div className='p-2 bg-slate-50 dark:bg-zinc-900 text-[8.5px] text-slate-500 dark:text-zinc-400 space-y-0.5 rounded'>
              <p>* Dokumen resmi pengajuan cuti & dispensasi PT. Bintang Fajar Persada diterbitkan secara digital melalui HRIS.</p>
              <p>* Persetujuan dilakukan berjenjang sesuai alur Standar Operasional Prosedur (SOP) Divisi HRD & Operasional.</p>
            </div>
          </div>
        </div>
      </div>
    </AppMain>
  )
}
