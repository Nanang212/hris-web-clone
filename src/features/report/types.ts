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

// ── Attendance Report ──────────────────────────────────────────────
export interface AttendanceReportRow {
  id: string
  date: string // YYYY-MM-DD or readable
  employeeName: string
  department: string
  workDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  leaveDays: number
  attendanceRate: number // e.g. 96.5%
  overtimeHours: number
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
