import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { approvalSyncStore } from '@/shared/lib/approval-sync-store'
import type { AttendanceReportRow, EmployeeDailyAttendance, OvertimeWorkOrder } from '../types'

const INDONESIAN_DAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

/**
 * Menghasilkan rincian presensi harian per karyawan selama 1 bulan (1 s.d. 28-31 hari),
 * sesuai format formulir absensi resmi PT. Bintang Fajar Persada.
 *
 * Catatan penting:
 * Kolom PEKERJAAN diisi dari alasan kenapa karyawan tersebut lembur (overtime reason).
 */
export function generateEmployeeDailyAttendance(
  row: AttendanceReportRow,
  yearMonth = '2026-08',
): EmployeeDailyAttendance[] {
  const daysInMonth = dayjs(`${yearMonth}-01`).daysInMonth()
  const result: EmployeeDailyAttendance[] = []

  const isYosep =
    row.employeeName.toLowerCase().includes('yosep') ||
    row.id === 'ATT-000' ||
    row.project?.toLowerCase().includes('tambolaka')

  const overtimeReason =
    row.overtimeReason ||
    `PENUGASAN PROYEK ${(row.project || row.department).toUpperCase()}`

  // Ambil SPKL dari store yang tersambung
  const spklOrders = approvalSyncStore.getSpklOrdersForEmployee(row.employeeName || row.id)

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`
    const dateObj = dayjs(dateStr)
    const dayOfWeek = dateObj.day() // 0 = Minggu, 1 = Senin, ...
    const dayName = INDONESIAN_DAY_NAMES[dayOfWeek]
    const isSunday = dayOfWeek === 0

    // Cek apakah hari ini ada SPKL yang dibuat / terdaftar
    const spklToday = spklOrders.find((ord) => {
      const parts = ord.date.includes('/') ? ord.date.split('/') : ord.date.split('-')
      const orderDay = ord.date.includes('/') ? parseInt(parts[0], 10) : parseInt(parts[2], 10)
      return orderDay === day
    })

    // Cek status izin sakit (Sick Leave)
    const isSickToday =
      (row.id === 'ATT-002' || row.employeeName.toLowerCase().includes('siti')) && day === 10

    if (isSickToday) {
      result.push({
        dayNumber: day,
        dayName,
        isSunday,
        workStart: 'SAKIT',
        workEnd: 'SAKIT',
        overtimeStart: '-',
        overtimeEnd: '-',
        overtimeHoursText: '-',
        taskDescription: 'SURAT KETERANGAN DOKTER (SKD)',
        hasEmployeeSignature: true,
        hasSupervisorSignature: true,
      })
      continue
    }

    if (isYosep) {
      // Pola shift presisi sesuai form resmi Yosep Fendi Seda di AFT Tambolaka
      const offDays = [3, 4, 9, 10, 15, 16, 21, 22, 27, 28]
      const morningDays = [5, 6, 11, 12, 17, 18, 23, 24, 29, 30]

      if (offDays.includes(day)) {
        result.push({
          dayNumber: day,
          dayName,
          isSunday,
          workStart: 'OFF',
          workEnd: 'OFF',
          overtimeStart: '-',
          overtimeEnd: '-',
          overtimeHoursText: '-',
          taskDescription: '-',
          hasEmployeeSignature: false,
          hasSupervisorSignature: false,
        })
      } else if (spklToday) {
        // Hari lembur sesuai SPKL (misal HUT RI 17 Agu 12 jam, Maulid 25 Agu 5 jam)
        result.push({
          dayNumber: day,
          dayName,
          isSunday,
          workStart: spklToday.startTime || '07:00',
          workEnd: spklToday.endTime || '19:00',
          overtimeStart: spklToday.startTime,
          overtimeEnd: spklToday.endTime,
          overtimeHoursText: `${spklToday.totalHours < 10 ? '0' : ''}${spklToday.totalHours} jam`,
          taskDescription: spklToday.taskDescription || overtimeReason,
          hasEmployeeSignature: true,
          hasSupervisorSignature: true,
        })
      } else if (morningDays.includes(day)) {
        result.push({
          dayNumber: day,
          dayName,
          isSunday,
          workStart: '07:00',
          workEnd: '19:00',
          overtimeStart: '16.00',
          overtimeEnd: '19.00',
          overtimeHoursText: '04 jam',
          taskDescription: overtimeReason,
          hasEmployeeSignature: true,
          hasSupervisorSignature: true,
        })
      } else {
        // Shift Malam
        result.push({
          dayNumber: day,
          dayName,
          isSunday,
          workStart: '19:00',
          workEnd: '07:00',
          overtimeStart: '04.00',
          overtimeEnd: '07.00',
          overtimeHoursText: '04 jam',
          taskDescription: overtimeReason,
          hasEmployeeSignature: true,
          hasSupervisorSignature: true,
        })
      }
    } else {
      // Karyawan Umum: Jam kerja normal Senin-Jumat (08:00 - 17:00)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      if (isWeekend) {
        if (spklToday) {
          // Lembur di hari libur / akhir pekan
          result.push({
            dayNumber: day,
            dayName,
            isSunday,
            workStart: 'LIBUR',
            workEnd: 'LIBUR',
            overtimeStart: spklToday.startTime,
            overtimeEnd: spklToday.endTime,
            overtimeHoursText: `${spklToday.totalHours < 10 ? '0' : ''}${spklToday.totalHours} jam`,
            taskDescription: spklToday.taskDescription || overtimeReason,
            hasEmployeeSignature: true,
            hasSupervisorSignature: true,
          })
        } else {
          result.push({
            dayNumber: day,
            dayName,
            isSunday,
            workStart: 'OFF',
            workEnd: 'OFF',
            overtimeStart: '-',
            overtimeEnd: '-',
            overtimeHoursText: '-',
            taskDescription: '-',
            hasEmployeeSignature: false,
            hasSupervisorSignature: false,
          })
        }
      } else {
        // Hari kerja normal: Jika ada SPKL untuk hari ini, tampilkan SPKL tersebut
        const hasOvertimeToday = !!spklToday || (day % 4 === 1 && row.overtimeHours > 0)
        const otHours = spklToday
          ? `${spklToday.totalHours < 10 ? '0' : ''}${spklToday.totalHours} jam`
          : hasOvertimeToday
            ? '03 jam'
            : '-'
        const otStart = spklToday ? spklToday.startTime : hasOvertimeToday ? '17:00' : '-'
        const otEnd = spklToday ? spklToday.endTime : hasOvertimeToday ? '20:00' : '-'
        const taskDesc = spklToday
          ? spklToday.taskDescription
          : hasOvertimeToday
            ? overtimeReason
            : '-'

        result.push({
          dayNumber: day,
          dayName,
          isSunday,
          workStart: '08:00',
          workEnd: '17:00',
          overtimeStart: otStart,
          overtimeEnd: otEnd,
          overtimeHoursText: otHours,
          taskDescription: taskDesc,
          hasEmployeeSignature: true,
          hasSupervisorSignature: true,
        })
      }
    }
  }

  return result
}

/**
 * Ekspor Formulir Absensi Karyawan ke format Excel (.xlsx) dengan struktur
 * kop dan tabel yang persis sesuai form resmi PT. Bintang Fajar Persada.
 */
export function exportEmployeeAttendanceExcel(
  row: AttendanceReportRow,
  items: EmployeeDailyAttendance[],
  periodLabel = '01-31 Agustus 2026',
) {
  const sheetData: (string | number)[][] = [
    ['PT. BINTANG FAJAR PERSADA'],
    ['FORM ABSENSI KARYAWAN'],
    [],
    [
      `Nama    : ${row.employeeName}`,
      '',
      '',
      '',
      '',
      '',
      '',
      `Periode : ${periodLabel}`,
    ],
    [
      `NIP     : ${row.employeeCode || row.id}`,
      '',
      '',
      '',
      '',
      '',
      '',
      `Lokasi  : ${row.location || 'AFT Tambolaka'}`,
    ],
    [
      `Jabatan : ${row.position || 'Security'}`,
      '',
      '',
      '',
      '',
      '',
      '',
      `Project : ${row.project || 'AFT Tambolaka'}`,
    ],
    [],
    // Table Headers
    [
      'No',
      'Hari',
      'Tanggal',
      'Jam Kerja Mulai',
      'Jam Kerja Selesai',
      'Jam Lembur Mulai',
      'Jam Lembur Selesai',
      'Jumlah Jam Lembur',
      'PEKERJAAN',
      'Paraf Karyawan',
      'Paraf Atasan',
    ],
  ]

  items.forEach((item) => {
    sheetData.push([
      item.dayNumber,
      item.dayName,
      item.dayNumber,
      item.workStart,
      item.workEnd,
      item.overtimeStart,
      item.overtimeEnd,
      item.overtimeHoursText,
      item.taskDescription,
      '', // Paraf Karyawan kosong untuk tanda tangan basah
      '', // Paraf Atasan kosong untuk tanda tangan basah
    ])
  })

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Form Absensi')

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  // Trigger download in browser
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  const safeName = row.employeeName.replace(/\s+/g, '_')
  link.download = `Form_Absensi_${safeName}_${yearMonthLabel(periodLabel)}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

function yearMonthLabel(label: string) {
  return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
}

export interface ApproverDetail {
  name: string
  title: string
  departmentOrUnit: string
  signatureDate: string
  approvalCode: string
}

export interface TwoTierApprovers {
  deptHead: ApproverDetail
  divHead: ApproverDetail
}

/**
 * Pemetaan otomatis hierarki approver berjenjang (Level 1: Head Departemen -> Level 2: Head Divisi / Direktur)
 * berdasarkan unit kerja atau project dari struktur organisasi PT. Bintang Fajar Persada.
 */
export function getTwoTierApprovers(
  departmentName: string,
  project?: string,
): TwoTierApprovers {
  const isTambolaka =
    project?.toLowerCase().includes('tambolaka') ||
    departmentName.toLowerCase().includes('operations') ||
    departmentName.toLowerCase().includes('logistics')

  if (isTambolaka) {
    return {
      deptHead: {
        name: 'Oktavianus Taufan Juwa',
        title: 'HO AFT Tambolaka',
        departmentOrUnit: 'Operations & Field Services',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-APP-OPS-0475',
      },
      divHead: {
        name: 'Joko Priyambodo',
        title: 'Direktur Pemasaran & Operasi',
        departmentOrUnit: 'Direktorat Pemasaran & Operasi',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-DIR-OPS-001',
      },
    }
  }

  const dept = departmentName.toLowerCase()
  if (dept.includes('engineer') || dept.includes('tech')) {
    return {
      deptHead: {
        name: 'Rizky Pratama, S.Kom.',
        title: 'Head of Software Engineering',
        departmentOrUnit: 'Software Engineering',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-APP-ENG-1021',
      },
      divHead: {
        name: 'Ir. Budi Wicaksono, M.Sc.',
        title: 'VP of Technology & Engineering',
        departmentOrUnit: 'Technology & Digital',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-DIR-TECH-002',
      },
    }
  }

  if (dept.includes('finance') || dept.includes('account')) {
    return {
      deptHead: {
        name: 'Cindy Claudia, S.E., M.Ak.',
        title: 'Head of Financial Accounting & Tax',
        departmentOrUnit: 'Financial Accounting & Tax Reporting',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-APP-FIN-2018',
      },
      divHead: {
        name: 'Hendra Setiawan, S.E., Ak., CA',
        title: 'VP of Finance & Accounting (CFO)',
        departmentOrUnit: 'Finance, Tax & Accounting',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-DIR-FIN-004',
      },
    }
  }

  if (dept.includes('sales') || dept.includes('business')) {
    return {
      deptHead: {
        name: 'Eric Gunawan, B.Bus.',
        title: 'Head of Enterprise Business Dev',
        departmentOrUnit: 'Enterprise Business Development',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-APP-SBD-3042',
      },
      divHead: {
        name: 'Dimas Arya Pratama, MBA',
        title: 'VP of Commercial & Growth (CCO)',
        departmentOrUnit: 'Sales, Marketing & Commercial Growth',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-DIR-SLS-005',
      },
    }
  }

  if (dept.includes('human') || dept.includes('hr')) {
    return {
      deptHead: {
        name: 'Amanda Putri, S.Psi.',
        title: 'Head of People Operations',
        departmentOrUnit: 'People Operations & Payroll Services',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-APP-HRD-4011',
      },
      divHead: {
        name: 'Sarah Melati, S.Psi., M.M.',
        title: 'VP of People & Culture',
        departmentOrUnit: 'Human Resources & General Affairs',
        signatureDate: '01 September 2026',
        approvalCode: 'BFP-DIR-HR-003',
      },
    }
  }

  return {
    deptHead: {
      name: 'Oktavianus Taufan Juwa',
      title: 'Head of Department',
      departmentOrUnit: departmentName,
      signatureDate: '01 September 2026',
      approvalCode: 'BFP-APP-GEN-9001',
    },
    divHead: {
      name: 'Joko Priyambodo',
      title: 'Direktur Pemasaran & Operasi',
      departmentOrUnit: 'Direktorat Operasi',
      signatureDate: '01 September 2026',
      approvalCode: 'BFP-DIR-GEN-001',
    },
  }
}

/**
 * Pemetaan otomatis Approver / Head Departemen (Level 1)
 */
export function getDepartmentHead(
  departmentName: string,
  project?: string,
): ApproverDetail {
  return getTwoTierApprovers(departmentName, project).deptHead
}

/**
 * Menghasilkan Surat Perintah Kerja Lembur (SPKL) resmi sesuai form BFP halaman 2.
 */
export function generateEmployeeOvertimeOrders(
  row: AttendanceReportRow,
  yearMonth = '2026-08',
): OvertimeWorkOrder[] {
  // Cek apakah ada SPKL tersimpan di store untuk karyawan ini
  const storedOrders = approvalSyncStore.getSpklOrdersForEmployee(row.employeeName || row.id)
  if (storedOrders.length > 0) {
    return storedOrders
  }

  const [yearStr, monthStr] = (yearMonth || '2026-08').split('-')
  const monthNum = parseInt(monthStr || '8', 10)
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  const romanMonth = romanMonths[monthNum - 1] || 'VIII'

  const isYosep =
    row.employeeName.toLowerCase().includes('yosep') ||
    row.id === 'ATT-000' ||
    row.project?.toLowerCase().includes('tambolaka')

  const head = getDepartmentHead(row.department, row.project)

  if (isYosep) {
    return [
      {
        id: 'SPKL-01',
        orderNumber: `SPKL/BFP-AFT/${romanMonth}/${yearStr}/001`,
        employeeName: row.employeeName,
        nip: row.employeeCode || '20261600475',
        position: row.position || 'Security',
        department: row.department,
        location: row.location || 'AFT Tambolaka',
        periodLabel: '2026-08-01 s.d. 2026-08-31',
        date: `17/${monthStr}/${yearStr}`,
        eventDescription: 'HUT Republik Indonesia',
        taskDescription: 'Patroli Area Kantor AFT Tambolaka',
        isHoliday: true,
        startTime: '07:00',
        endTime: '19:00',
        actualStartTime: '07:00',
        actualEndTime: '19:00',
        totalHours: 12,
        approvedBy: head.name,
        approverTitle: head.title,
        approvedAt: `17 Agustus ${yearStr} 19:30 WIB`,
      },
      {
        id: 'SPKL-02',
        orderNumber: `SPKL/BFP-AFT/${romanMonth}/${yearStr}/002`,
        employeeName: row.employeeName,
        nip: row.employeeCode || '20261600475',
        position: row.position || 'Security',
        department: row.department,
        location: row.location || 'AFT Tambolaka',
        periodLabel: '2026-08-01 s.d. 2026-08-31',
        date: `25/${monthStr}/${yearStr}`,
        eventDescription: 'Maulid Nabi Muhammad SAW',
        taskDescription: 'Patroli Area Kantor AFT Tambolaka',
        isHoliday: true,
        startTime: '20:00',
        endTime: '00:00',
        actualStartTime: '20:00',
        actualEndTime: '00:00',
        totalHours: 5,
        approvedBy: head.name,
        approverTitle: head.title,
        approvedAt: `25 Agustus ${yearStr} 00:30 WIB`,
      },
    ]
  }

  if (row.overtimeHours > 0) {
    return [
      {
        id: `SPKL-${row.id}-01`,
        orderNumber: `SPKL/BFP/${row.id}/${romanMonth}/${yearStr}/001`,
        employeeName: row.employeeName,
        nip: row.employeeCode || '20261600101',
        position: row.position || 'Field Operator',
        department: row.department,
        location: row.location || 'Depot TBBM Plumpang',
        periodLabel: '2026-08-01 s.d. 2026-08-31',
        date: `14/${monthStr}/${yearStr}`,
        eventDescription: 'Operasional Tambahan & Percepatan Proyek',
        taskDescription: row.overtimeReason || `Tugas Operasional ${row.department}`,
        isHoliday: false,
        startTime: '17:00',
        endTime: '21:00',
        actualStartTime: '17:00',
        actualEndTime: '21:00',
        totalHours: Math.min(row.overtimeHours, 4),
        approvedBy: head.name,
        approverTitle: head.title,
        approvedAt: `14 Agustus ${yearStr} 21:15 WIB`,
      },
    ]
  }

  return []
}

/**
 * Menghasilkan data Sick Leave / Pengajuan Sakit yang telah disetujui (Approved).
 */
export function generateEmployeeSickLeave(
  row: AttendanceReportRow,
  yearMonth = '2026-08',
) {
  const head = getDepartmentHead(row.department, row.project)

  // Jika ada hari cuti / sakit atau employee tertentu
  const hasSickDays = row.leaveDays > 0 || row.absentDays > 0 || row.id === 'ATT-002'

  if (hasSickDays) {
    return {
      id: `SICK-${row.id}-01`,
      leaveNumber: `SKD/BFP-MED/${row.id}/2026/08`,
      startDate: `${yearMonth}-10`,
      endDate: `${yearMonth}-10`,
      totalDays: 1,
      reason: 'Sakit dengan Surat Keterangan Dokter',
      diagnosis: 'Dyspepsia Syndrome & Febris Akut (Kelelahan Fisik)',
      clinicOrHospital: 'Klinik Pratama Pertamina Bina Medika',
      doctorName: 'dr. H. Hendra Wicaksono, Sp.Ok',
      status: 'APPROVED' as const,
      approvedBy: head.name,
      approverTitle: head.title,
      approvedAt: '10 Agustus 2026 08:45 WIB',
    }
  }

  return {
    id: `SICK-${row.id}-REC`,
    leaveNumber: `SKD/BFP-MED/${row.id}/2026/08`,
    startDate: `${yearMonth}-01`,
    endDate: `${yearMonth}-31`,
    totalDays: 0,
    reason: 'Karyawan Sehat & Prima (Nihil Hari Sakit)',
    diagnosis: 'Fit for Duty / Bebas Keluhan Sakit',
    clinicOrHospital: 'Pusat Pemeriksaan Kesehatan Kerja BFP',
    doctorName: 'dr. Siti Nurbaya, M.K.K.',
    status: 'APPROVED' as const,
    approvedBy: head.name,
    approverTitle: head.title,
    approvedAt: '01 September 2026 09:00 WIB',
  }
}
