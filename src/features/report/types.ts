export type ReportCategoryKey =
  | 'hub'
  | 'attendance'
  | 'payroll'
  | 'leave'
  | 'employee'
  | 'overtime'
  | 'travel_expense'

export interface ReportFilterCriteria {
  datePreset: 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom'
  startDate?: string
  endDate?: string
  department: string
  branch?: string
  employmentStatus?: string
  searchQuery: string
}

export interface MetricCardData {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  iconBgColor?: string
  iconTextColor?: string
}

export type TimesheetStatus =
  | 'DRAFT'
  | 'PENDING_DEPT_HEAD'
  | 'PENDING_DIV_HEAD'
  | 'APPROVED'
  | 'REJECTED'

export interface AttendanceReportRow {
  id: string
  date: string // YYYY-MM-DD or readable
  employeeName: string
  employeeCode?: string
  department: string
  position?: string
  location?: string
  project?: string
  overtimeReason?: string
  workDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  leaveDays: number
  attendanceRate: number // e.g. 96.5%
  overtimeHours: number
  timesheetStatus?: TimesheetStatus
}

export interface EmployeeDailyAttendance {
  dayNumber: number
  dayName: string
  isSunday: boolean
  workStart: string
  workEnd: string
  overtimeStart: string
  overtimeEnd: string
  overtimeHoursText: string
  taskDescription: string // Didapat dari alasan kenapa dia lembur
  hasEmployeeSignature: boolean
  hasSupervisorSignature: boolean
}

export interface OvertimeWorkOrder {
  id: string
  orderNumber: string
  employeeName?: string
  employeeId?: string
  nip?: string
  position?: string
  department?: string
  location?: string
  periodLabel?: string
  date: string
  eventDescription: string // Keterangan misal: HUT Republik Indonesia / Maulid Nabi Muhammad SAW / Operasional Tambahan
  taskDescription: string // Uraian tugas kerja lembur: Pengamanan shift malam / Patroli dsb
  isHoliday: boolean
  startTime: string
  endTime: string
  actualStartTime?: string
  actualEndTime?: string
  totalHours: number
  approvedBy: string
  approverTitle: string
  approvedAt: string
}

export interface SickLeaveRecord {
  id: string
  leaveNumber: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  diagnosis: string
  clinicOrHospital: string
  doctorName: string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  approvedBy: string
  approverTitle: string
  approvedAt: string
}

// ── Payroll Report ────────────────────────────────────────────────
export interface PayrollReportRow {
  id: string
  period: string
  payDate: string // YYYY-MM-DD
  department: string
  totalEmployees: number
  basicSalaryTotal: number
  allowancesTotal: number
  overtimeTotal: number
  deductionsTotal: number
  taxTotal: number
  netPayTotal: number
  status: 'draft' | 'approved' | 'paid'
}

// ── Leave Report ──────────────────────────────────────────────────
export interface LeaveReportRow {
  id: string
  dateRange: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  employeeName: string
  department: string
  position: string
  annualLeaveUsed: number
  sickLeaveUsed: number
  specialLeaveUsed: number
  unpaidLeaveUsed: number
  totalDaysUsed: number
  remainingBalance: number
  approvalRate: number
}

// ── Employee Demographics Report ──────────────────────────────────
export interface EmployeeReportRow {
  id: string
  periodDate: string // YYYY-MM-DD
  department: string
  totalHeadcount: number
  permanentCount: number
  contractCount: number
  probationCount: number
  maleCount: number
  femaleCount: number
  avgTenureYears: number
  turnoverRate: number
}

// ── Overtime Report ───────────────────────────────────────────────
export interface OvertimeReportRow {
  id: string
  date: string // YYYY-MM-DD
  employeeName: string
  department: string
  position: string
  weekdayHours: number
  weekendHours: number
  totalHours: number
  ratePerHour: number
  compensationAmount: number
  approvedRequestsCount: number
}

// ── Travel & Expense Report ───────────────────────────────────────
export interface TravelExpenseReportRow {
  id: string
  periodDate: string // YYYY-MM-DD
  department: string
  costCenter: string
  totalClaimsCount: number
  claimsAmount: number
  totalTripsCount: number
  tripsBudget: number
  tripsRealized: number
  totalCost: number
}
