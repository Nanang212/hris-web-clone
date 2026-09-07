// src/features/company/employee-information/store/employee-mcu-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type McuStatus = 'Fit' | 'Fit with Notes' | 'Temporary Unfit' | 'Unfit'
export type McuDueStatus = 'Current' | 'Due Soon' | 'Overdue' | 'Follow-up'
export type ExaminationType = 'Annual MCU' | 'Pre-Employment' | 'Periodic' | 'Special'

export interface McuRecord {
  id: string
  employeeId: string
  mcuDate: string
  provider: string
  examinationType: ExaminationType
  status: McuStatus
  nextDueDate: string
  followUpRequired: boolean
  administrativeNote: string
  documentName: string | null
  documentSize: string | null
  createdAt: string
  bloodPressure?: string
  bmi?: number
  fastingBloodSugar?: number
  totalCholesterol?: number
  vision?: string
  audiometry?: string
  xray?: string
  doctorRecommendations?: string
}

export interface McuEmployeeRecord {
  employeeId: string
  employeeName: string
  employeeNumber: string
  positionName: string
  departmentName: string
  branchName: string
  avatarUrl: string | null
  history: McuRecord[]
}

export interface McuReminderPolicy {
  isActive: boolean
  trigger: string
  recipients: string
  channels: string[]
  scheduleDays: number[]
}

export interface McuStore {
  employees: McuEmployeeRecord[]
  reminderPolicy: McuReminderPolicy

  // Getters
  getEmployeeRecord: (employeeId: string) => McuEmployeeRecord | undefined
  getLatestMcu: (employeeId: string) => McuRecord | undefined
  getMcuHistory: (employeeId: string) => McuRecord[]
  getDueStatus: (nextDueDate: string, followUpRequired: boolean) => McuDueStatus
  getAllRecordsWithStatus: () => Array<McuEmployeeRecord & { latestMcu?: McuRecord; dueStatus: McuDueStatus }>
  // Auto-seed for any employee
  getOrSeedLatestMcu: (employeeId: string, employeeName: string) => McuRecord
  getOrSeedHistory: (employeeId: string, employeeName: string) => McuRecord[]

  // Actions
  addMcuRecord: (
    employeeId: string,
    record: Omit<McuRecord, 'id' | 'employeeId' | 'createdAt'>,
    employeeName?: string,
  ) => void
  updateMcuRecord: (employeeId: string, recordId: string, updates: Partial<McuRecord>) => void
  updateReminderPolicy: (policy: Partial<McuReminderPolicy>) => void
}

// ─── Dummy MCU template ────────────────────────────────────────────────────────

function makeDummyHistory(employeeId: string, employeeName: string): McuRecord[] {
  const year = new Date().getFullYear()
  return [
    {
      id: `dummy-${employeeId}-1`,
      employeeId,
      mcuDate: `${year}-07-15`,
      provider: 'Prodia Occupational Health',
      examinationType: 'Annual MCU',
      status: 'Fit',
      nextDueDate: `${year + 1}-07-15`,
      followUpRequired: false,
      administrativeNote: 'Fit for work. No follow-up required.',
      documentName: `MCU_${employeeName.replace(/\s+/g, '_')}_${year}.pdf`,
      documentSize: '840 KB',
      createdAt: `${year}-07-15T09:00:00Z`,
    },
    {
      id: `dummy-${employeeId}-2`,
      employeeId,
      mcuDate: `${year - 1}-07-12`,
      provider: 'Prodia Occupational Health',
      examinationType: 'Annual MCU',
      status: 'Fit with Notes',
      nextDueDate: `${year}-07-12`,
      followUpRequired: true,
      administrativeNote: 'Minor BP elevation. Monitor in 3 months.',
      documentName: `MCU_${employeeName.replace(/\s+/g, '_')}_${year - 1}.pdf`,
      documentSize: '760 KB',
      createdAt: `${year - 1}-07-12T09:00:00Z`,
    },
    {
      id: `dummy-${employeeId}-3`,
      employeeId,
      mcuDate: `${year - 2}-07-10`,
      provider: 'Prodia Occupational Health',
      examinationType: 'Annual MCU',
      status: 'Fit',
      nextDueDate: `${year - 1}-07-10`,
      followUpRequired: false,
      administrativeNote: 'All results within normal range.',
      documentName: `MCU_${employeeName.replace(/\s+/g, '_')}_${year - 2}.pdf`,
      documentSize: '820 KB',
      createdAt: `${year - 2}-07-10T09:00:00Z`,
    },
  ]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function getDaysUntilDue(nextDueDate: string): number {
  const now = new Date()
  const due = new Date(nextDueDate)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_EMPLOYEES: McuEmployeeRecord[] = [
  {
    employeeId: 'employee-10001',
    employeeName: 'Rama Aditya',
    employeeNumber: 'EMP-2023-00128',
    positionName: 'Product Designer',
    departmentName: 'Product',
    branchName: 'Jakarta HQ',
    avatarUrl: null,
    history: [
      {
        id: 'mcu-001-1',
        employeeId: 'employee-10001',
        mcuDate: '2026-07-15',
        provider: 'Prodia Occupational Health',
        examinationType: 'Annual MCU',
        status: 'Fit',
        nextDueDate: '2027-07-15',
        followUpRequired: false,
        administrativeNote: 'Fit for work. No follow-up required.',
        documentName: 'MCU_Rama_Aditya_2026.pdf',
        documentSize: '840 KB',
        createdAt: '2026-07-15T09:00:00Z',
      },
      {
        id: 'mcu-001-2',
        employeeId: 'employee-10001',
        mcuDate: '2025-07-12',
        provider: 'Prodia Occupational Health',
        examinationType: 'Annual MCU',
        status: 'Fit with Notes',
        nextDueDate: '2026-07-12',
        followUpRequired: true,
        administrativeNote: 'Minor BP elevation. Monitor in 3 months.',
        documentName: 'MCU_Rama_Aditya_2025.pdf',
        documentSize: '760 KB',
        createdAt: '2025-07-12T09:00:00Z',
      },
      {
        id: 'mcu-001-3',
        employeeId: 'employee-10001',
        mcuDate: '2024-07-10',
        provider: 'Prodia Occupational Health',
        examinationType: 'Annual MCU',
        status: 'Fit',
        nextDueDate: '2025-07-10',
        followUpRequired: false,
        administrativeNote: 'All results within normal range.',
        documentName: 'MCU_Rama_Aditya_2024.pdf',
        documentSize: '820 KB',
        createdAt: '2024-07-10T09:00:00Z',
      },
    ],
  },
  {
    employeeId: 'employee-10002',
    employeeName: 'Budi Setiawan',
    employeeNumber: 'EMP-2022-00421',
    positionName: 'Software Engineer',
    departmentName: 'Engineering',
    branchName: 'Jakarta HQ',
    avatarUrl: null,
    history: [
      {
        id: 'mcu-002-1',
        employeeId: 'employee-10002',
        mcuDate: '2025-08-31',
        provider: 'Klinik Medika Prima',
        examinationType: 'Annual MCU',
        status: 'Fit',
        nextDueDate: '2026-08-31',
        followUpRequired: false,
        administrativeNote: 'Normal. Cleared for all duties.',
        documentName: 'MCU_Budi_Setiawan_2025.pdf',
        documentSize: '910 KB',
        createdAt: '2025-08-31T09:00:00Z',
      },
    ],
  },
  {
    employeeId: 'employee-10003',
    employeeName: 'Sinta Maharani',
    employeeNumber: 'EMP-2021-00087',
    positionName: 'HR Specialist',
    departmentName: 'Human Resources',
    branchName: 'Jakarta HQ',
    avatarUrl: null,
    history: [
      {
        id: 'mcu-003-1',
        employeeId: 'employee-10003',
        mcuDate: '2025-07-20',
        provider: 'RS Siloam',
        examinationType: 'Annual MCU',
        status: 'Fit with Notes',
        nextDueDate: '2026-07-20',
        followUpRequired: true,
        administrativeNote: 'Mild anemia detected. Dietary consultation recommended.',
        documentName: 'MCU_Sinta_Maharani_2025.pdf',
        documentSize: '1.1 MB',
        createdAt: '2025-07-20T09:00:00Z',
      },
      {
        id: 'mcu-003-2',
        employeeId: 'employee-10003',
        mcuDate: '2024-07-18',
        provider: 'RS Siloam',
        examinationType: 'Annual MCU',
        status: 'Fit',
        nextDueDate: '2025-07-18',
        followUpRequired: false,
        administrativeNote: 'All normal.',
        documentName: 'MCU_Sinta_Maharani_2024.pdf',
        documentSize: '890 KB',
        createdAt: '2024-07-18T09:00:00Z',
      },
    ],
  },
  {
    employeeId: 'employee-10004',
    employeeName: 'Dewi Kartika',
    employeeNumber: 'EMP-2020-00310',
    positionName: 'Finance Analyst',
    departmentName: 'Finance',
    branchName: 'Jakarta HQ',
    avatarUrl: null,
    history: [
      {
        id: 'mcu-004-1',
        employeeId: 'employee-10004',
        mcuDate: '2025-09-02',
        provider: 'Prodia Occupational Health',
        examinationType: 'Annual MCU',
        status: 'Fit with Notes',
        nextDueDate: '2026-09-02',
        followUpRequired: true,
        administrativeNote: 'Follow-up echo required within 30 days.',
        documentName: 'MCU_Dewi_Kartika_2025.pdf',
        documentSize: '950 KB',
        createdAt: '2025-09-02T09:00:00Z',
      },
    ],
  },
  {
    employeeId: 'employee-10005',
    employeeName: 'Andi Pratama',
    employeeNumber: 'EMP-2024-00156',
    positionName: 'Marketing Executive',
    departmentName: 'Marketing',
    branchName: 'Jakarta HQ',
    avatarUrl: null,
    history: [
      {
        id: 'mcu-005-1',
        employeeId: 'employee-10005',
        mcuDate: '2026-01-18',
        provider: 'Klinik Medika Prima',
        examinationType: 'Pre-Employment',
        status: 'Fit',
        nextDueDate: '2027-01-18',
        followUpRequired: false,
        administrativeNote: 'Pre-employment check passed.',
        documentName: 'MCU_Andi_Pratama_2026.pdf',
        documentSize: '730 KB',
        createdAt: '2026-01-18T09:00:00Z',
      },
    ],
  },
]

const DEFAULT_REMINDER_POLICY: McuReminderPolicy = {
  isActive: true,
  trigger: 'Next MCU Due date',
  recipients: 'Employee + HR',
  channels: ['Email', 'Push', 'WhatsApp'],
  scheduleDays: [30, 14, 7, 0],
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEmployeeMcuStore = create<McuStore>()(
  persist(
    (set, get) => ({
      employees: SEED_EMPLOYEES,
      reminderPolicy: DEFAULT_REMINDER_POLICY,

      getEmployeeRecord: (employeeId) => {
        return get().employees.find((e) => e.employeeId === employeeId)
      },

      getLatestMcu: (employeeId) => {
        const emp = get().employees.find((e) => e.employeeId === employeeId)
        if (!emp || emp.history.length === 0) return undefined
        return emp.history.sort((a, b) => new Date(b.mcuDate).getTime() - new Date(a.mcuDate).getTime())[0]
      },

      getMcuHistory: (employeeId) => {
        const emp = get().employees.find((e) => e.employeeId === employeeId)
        if (!emp) return []
        return [...emp.history].sort((a, b) => new Date(b.mcuDate).getTime() - new Date(a.mcuDate).getTime())
      },

      getDueStatus: (nextDueDate, followUpRequired) => {
        if (followUpRequired) return 'Follow-up'
        const days = getDaysUntilDue(nextDueDate)
        if (days < 0) return 'Overdue'
        if (days <= 30) return 'Due Soon'
        return 'Current'
      },

      getAllRecordsWithStatus: () => {
        const { employees, getDueStatus, getLatestMcu } = get()
        return employees.map((emp) => {
          const latest = getLatestMcu(emp.employeeId)
          const dueStatus: McuDueStatus = latest
            ? getDueStatus(latest.nextDueDate, latest.followUpRequired)
            : 'Overdue'
          return { ...emp, latestMcu: latest, dueStatus }
        })
      },

      getOrSeedLatestMcu: (employeeId, employeeName) => {
        const emp = get().employees.find((e) => e.employeeId === employeeId)
        if (emp && emp.history.length > 0) {
          return [...emp.history].sort((a, b) => new Date(b.mcuDate).getTime() - new Date(a.mcuDate).getTime())[0]!
        }
        // Auto-seed dummy record into the store
        const dummyHistory = makeDummyHistory(employeeId, employeeName)
        set((state) => ({
          employees: [
            ...state.employees.filter((e) => e.employeeId !== employeeId),
            {
              employeeId,
              employeeName,
              employeeNumber: '',
              positionName: '',
              departmentName: '',
              branchName: '',
              avatarUrl: null,
              history: dummyHistory,
            },
          ],
        }))
        return dummyHistory[0]!
      },

      getOrSeedHistory: (employeeId, employeeName) => {
        const emp = get().employees.find((e) => e.employeeId === employeeId)
        if (emp && emp.history.length > 0) {
          return [...emp.history].sort((a, b) => new Date(b.mcuDate).getTime() - new Date(a.mcuDate).getTime())
        }
        const dummyHistory = makeDummyHistory(employeeId, employeeName)
        set((state) => ({
          employees: [
            ...state.employees.filter((e) => e.employeeId !== employeeId),
            {
              employeeId,
              employeeName,
              employeeNumber: '',
              positionName: '',
              departmentName: '',
              branchName: '',
              avatarUrl: null,
              history: dummyHistory,
            },
          ],
        }))
        return dummyHistory
      },

      addMcuRecord: (employeeId, record, employeeName) => {
        set((state) => {
          const exists = state.employees.some((e) => e.employeeId === employeeId)
          const newRecord: McuRecord = {
            ...record,
            id: randomId(),
            employeeId,
            createdAt: new Date().toISOString(),
          }
          if (exists) {
            return {
              employees: state.employees.map((emp) => {
                if (emp.employeeId !== employeeId) return emp
                return { ...emp, history: [newRecord, ...emp.history] }
              }),
            }
          }
          return {
            employees: [
              ...state.employees,
              {
                employeeId,
                employeeName: employeeName || 'Employee',
                employeeNumber: '',
                positionName: '',
                departmentName: '',
                branchName: '',
                avatarUrl: null,
                history: [newRecord],
              },
            ],
          }
        })
      },

      updateMcuRecord: (employeeId, recordId, updates) => {
        set((state) => ({
          employees: state.employees.map((emp) => {
            if (emp.employeeId !== employeeId) return emp
            return {
              ...emp,
              history: emp.history.map((rec) =>
                rec.id === recordId ? { ...rec, ...updates } : rec,
              ),
            }
          }),
        }))
      },

      updateReminderPolicy: (policy) => {
        set((state) => ({
          reminderPolicy: { ...state.reminderPolicy, ...policy },
        }))
      },
    }),
    { name: 'employee-mcu-store' },
  ),
)
