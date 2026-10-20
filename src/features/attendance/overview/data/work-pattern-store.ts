import { create } from 'zustand'
import dayjs from 'dayjs'

export interface WorkPatternDay {
  dayNumber: number // 1..7 (1 = Senin, ..., 7 = Minggu)
  dayName: string // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  isOff: boolean
  clockIn: string
  clockOut: string
  breakStart?: string
  breakEnd?: string
}

export interface WorkPattern {
  id: string
  code: string
  name: string
  description: string
  cycleDays: number // default 7
  lateToleranceMinutes: number
  days: WorkPatternDay[]
  assignedCount: number
  isDefault?: boolean
  status: 'Active' | 'Inactive'
  createdAt: string
}

export interface WorkPatternAssignment {
  id: string
  employeeId: string
  employeeNik: string
  employeeName: string
  department: string
  project: string
  patternId: string
  patternName: string
  effectiveDate: string // YYYY-MM-DD
  endDate?: string | null // YYYY-MM-DD
  startDayIndex: number // 1..7
  startDayName: string
  status: 'Active' | 'Scheduled' | 'Expired'
}

export const DAY_NAMES = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
]

export function getDayIndexFromDate(dateStr: string): { index: number; name: string } {
  // dayjs().day(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const d = dayjs(dateStr)
  const day = d.day()
  // Map so 1 = Senin ... 7 = Minggu
  const index = day === 0 ? 7 : day
  return {
    index,
    name: DAY_NAMES[index - 1],
  }
}

export function createDefaultWeeklyDays(
  workDaysCount = 5,
  defaultIn = '08:30',
  defaultOut = '17:30',
): WorkPatternDay[] {
  return DAY_NAMES.map((name, i) => {
    const isOff = i >= workDaysCount
    return {
      dayNumber: i + 1,
      dayName: name,
      isOff,
      clockIn: isOff ? '' : defaultIn,
      clockOut: isOff ? '' : defaultOut,
      breakStart: isOff ? '' : '12:00',
      breakEnd: isOff ? '' : '13:00',
    }
  })
}

const initialPatterns: WorkPattern[] = [
  {
    id: 'wp-5-2-office',
    code: 'REG-5-2-HQ',
    name: 'Reguler 5 Hari Kerja (2 Hari Off) - Head Office',
    description: 'Pola standar kantor pusat: Senin sampai Jumat kerja, Sabtu dan Minggu off.',
    cycleDays: 7,
    lateToleranceMinutes: 15,
    days: [
      { dayNumber: 1, dayName: 'Senin', isOff: false, clockIn: '08:30', clockOut: '17:30', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 2, dayName: 'Selasa', isOff: false, clockIn: '08:30', clockOut: '17:30', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 3, dayName: 'Rabu', isOff: false, clockIn: '08:30', clockOut: '17:30', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 4, dayName: 'Kamis', isOff: false, clockIn: '08:30', clockOut: '17:30', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 5, dayName: 'Jumat', isOff: false, clockIn: '08:30', clockOut: '17:30', breakStart: '11:45', breakEnd: '13:15' },
      { dayNumber: 6, dayName: 'Sabtu', isOff: true, clockIn: '', clockOut: '' },
      { dayNumber: 7, dayName: 'Minggu', isOff: true, clockIn: '', clockOut: '' },
    ],
    assignedCount: 42,
    isDefault: true,
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'wp-6-1-site',
    code: 'REG-6-1-SITE',
    name: 'Reguler 6 Hari Kerja (1 Hari Off) - Site Operasional',
    description: 'Pola kerja penempatan outsourcing lapangan: Senin sampai Sabtu kerja, Minggu off.',
    cycleDays: 7,
    lateToleranceMinutes: 10,
    days: [
      { dayNumber: 1, dayName: 'Senin', isOff: false, clockIn: '08:00', clockOut: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 2, dayName: 'Selasa', isOff: false, clockIn: '08:00', clockOut: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 3, dayName: 'Rabu', isOff: false, clockIn: '08:00', clockOut: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 4, dayName: 'Kamis', isOff: false, clockIn: '08:00', clockOut: '16:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 5, dayName: 'Jumat', isOff: false, clockIn: '08:00', clockOut: '16:00', breakStart: '11:45', breakEnd: '13:15' },
      { dayNumber: 6, dayName: 'Sabtu', isOff: false, clockIn: '08:00', clockOut: '14:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 7, dayName: 'Minggu', isOff: true, clockIn: '', clockOut: '' },
    ],
    assignedCount: 68,
    isDefault: false,
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: 'wp-6-1-retail',
    code: 'REG-6-1-OFF-MON',
    name: 'Reguler 6-1 Operasional Retail (Libur Senin)',
    description: 'Pola kerja operasional cabang/outlet: Libur di hari Senin, Selasa sampai Minggu aktif.',
    cycleDays: 7,
    lateToleranceMinutes: 15,
    days: [
      { dayNumber: 1, dayName: 'Senin', isOff: true, clockIn: '', clockOut: '' },
      { dayNumber: 2, dayName: 'Selasa', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 3, dayName: 'Rabu', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 4, dayName: 'Kamis', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 5, dayName: 'Jumat', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '11:45', breakEnd: '13:15' },
      { dayNumber: 6, dayName: 'Sabtu', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayNumber: 7, dayName: 'Minggu', isOff: false, clockIn: '09:00', clockOut: '18:00', breakStart: '12:00', breakEnd: '13:00' },
    ],
    assignedCount: 24,
    isDefault: false,
    status: 'Active',
    createdAt: '2026-03-15',
  },
]

const initialAssignments: WorkPatternAssignment[] = [
  {
    id: 'asn-1',
    employeeId: 'EMP-014',
    employeeNik: 'EMP-014',
    employeeName: 'Andi Pratama',
    department: 'Site Operations',
    project: 'Outsourcing - Astra Tower Site',
    patternId: 'wp-6-1-site',
    patternName: 'Reguler 6 Hari Kerja (1 Hari Off) - Site Operasional',
    effectiveDate: '2026-01-01',
    endDate: '2026-12-31',
    startDayIndex: 4, // Kamis
    startDayName: 'Kamis',
    status: 'Active',
  },
  {
    id: 'asn-2',
    employeeId: 'EMP-021',
    employeeNik: 'EMP-021',
    employeeName: 'Rina Sari',
    department: 'Site Operations',
    project: 'Outsourcing - Astra Tower Site',
    patternId: 'wp-6-1-site',
    patternName: 'Reguler 6 Hari Kerja (1 Hari Off) - Site Operasional',
    effectiveDate: '2026-01-01',
    endDate: '2026-12-31',
    startDayIndex: 4,
    startDayName: 'Kamis',
    status: 'Active',
  },
  {
    id: 'asn-3',
    employeeId: 'EMP-032',
    employeeNik: 'EMP-032',
    employeeName: 'Dodi Saputra',
    department: 'Facility Management',
    project: 'Outsourcing - Warehouse Cikarang',
    patternId: 'wp-6-1-site',
    patternName: 'Reguler 6 Hari Kerja (1 Hari Off) - Site Operasional',
    effectiveDate: '2026-02-01',
    endDate: '2027-01-31',
    startDayIndex: 7, // Minggu
    startDayName: 'Minggu',
    status: 'Active',
  },
  {
    id: 'asn-4',
    employeeId: 'EMP-045',
    employeeNik: 'EMP-045',
    employeeName: 'Maya Savitri',
    department: 'Human Resources',
    project: 'Corporate Backoffice HQ',
    patternId: 'wp-5-2-office',
    patternName: 'Reguler 5 Hari Kerja (2 Hari Off) - Head Office',
    effectiveDate: '2026-01-01',
    endDate: null,
    startDayIndex: 4,
    startDayName: 'Kamis',
    status: 'Active',
  },
  {
    id: 'asn-5',
    employeeId: 'EMP-056',
    employeeNik: 'EMP-056',
    employeeName: 'Bambang Wicaksono',
    department: 'Customer Care & Outlet',
    project: 'Retail Outlet Surabaya',
    patternId: 'wp-6-1-retail',
    patternName: 'Reguler 6-1 Operasional Retail (Libur Senin)',
    effectiveDate: '2026-03-01',
    endDate: '2026-09-30',
    startDayIndex: 7,
    startDayName: 'Minggu',
    status: 'Active',
  },
]

interface WorkPatternStore {
  patterns: WorkPattern[]
  assignments: WorkPatternAssignment[]

  // Pattern Actions
  addPattern: (data: Omit<WorkPattern, 'id' | 'assignedCount' | 'createdAt'>) => void
  updatePattern: (id: string, data: Partial<WorkPattern>) => void
  deletePattern: (id: string) => void

  // Assignment Actions
  assignPattern: (data: {
    employees: Array<{ id: string; nik: string; name: string; department: string; project: string }>
    patternId: string
    effectiveDate: string
    endDate?: string | null
    startDayIndex?: number
  }) => void
  updateAssignment: (id: string, data: Partial<WorkPatternAssignment>) => void
  deleteAssignment: (id: string) => void
}

export const useWorkPatternStore = create<WorkPatternStore>((set, get) => ({
  patterns: initialPatterns,
  assignments: initialAssignments,

  addPattern: (data) => {
    const id = `wp-${Date.now()}`
    const newPattern: WorkPattern = {
      ...data,
      id,
      assignedCount: 0,
      createdAt: dayjs().format('YYYY-MM-DD'),
    }
    set({ patterns: [newPattern, ...get().patterns] })
  },

  updatePattern: (id, data) => {
    set({
      patterns: get().patterns.map((p) => (p.id === id ? { ...p, ...data } : p)),
      // Sync pattern name in assignments if changed
      assignments: data.name
        ? get().assignments.map((a) => (a.patternId === id ? { ...a, patternName: data.name! } : a))
        : get().assignments,
    })
  },

  deletePattern: (id) => {
    set({
      patterns: get().patterns.filter((p) => p.id !== id),
      assignments: get().assignments.filter((a) => a.patternId !== id),
    })
  },

  assignPattern: ({ employees, patternId, effectiveDate, endDate, startDayIndex }) => {
    const pattern = get().patterns.find((p) => p.id === patternId)
    if (!pattern) return

    const { index: autoDayIndex, name: autoDayName } = getDayIndexFromDate(effectiveDate)
    const finalDayIndex = startDayIndex ?? autoDayIndex
    const finalDayName = DAY_NAMES[finalDayIndex - 1] || autoDayName

    const newAssignments: WorkPatternAssignment[] = employees.map((emp) => ({
      id: `asn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      employeeId: emp.id,
      employeeNik: emp.nik,
      employeeName: emp.name,
      department: emp.department,
      project: emp.project,
      patternId: pattern.id,
      patternName: pattern.name,
      effectiveDate,
      endDate: endDate || null,
      startDayIndex: finalDayIndex,
      startDayName: finalDayName,
      status: dayjs(effectiveDate).isAfter(dayjs(), 'day') ? 'Scheduled' : 'Active',
    }))

    // Remove existing assignments for these employees if superseded
    const empIds = new Set(employees.map((e) => e.id))
    const filteredExisting = get().assignments.filter((a) => !empIds.has(a.employeeId))

    const allAssignments = [...newAssignments, ...filteredExisting]

    // Recalculate assigned counts
    const patternCounts: Record<string, number> = {}
    allAssignments.forEach((a) => {
      patternCounts[a.patternId] = (patternCounts[a.patternId] || 0) + 1
    })

    set({
      assignments: allAssignments,
      patterns: get().patterns.map((p) => ({
        ...p,
        assignedCount: patternCounts[p.id] || 0,
      })),
    })
  },

  updateAssignment: (id, data) => {
    set({
      assignments: get().assignments.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })
  },

  deleteAssignment: (id) => {
    const target = get().assignments.find((a) => a.id === id)
    if (!target) return
    const remaining = get().assignments.filter((a) => a.id !== id)

    // Recalculate assigned counts
    const patternCounts: Record<string, number> = {}
    remaining.forEach((a) => {
      patternCounts[a.patternId] = (patternCounts[a.patternId] || 0) + 1
    })

    set({
      assignments: remaining,
      patterns: get().patterns.map((p) => ({
        ...p,
        assignedCount: patternCounts[p.id] || 0,
      })),
    })
  },
}))
