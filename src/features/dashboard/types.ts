export interface EmployeeDashboardData {
  attendanceStatus: string
  checkInTime: string
  workEndTime: string
  leaveBalance: number
  nextPayrollDate: string
  pendingRequests: number
  attendanceStats: {
    presentDays: number
    leaveDays: number
    lateDays: number
    wfhDays: number
    attendanceRate: number
  }
  requests: { id: string; category: string; detail: string; status: string; dateRange: string }[]
  documents: { id: string; label: string; value: string; statusColor?: string; color?: string }[]
  payrollTax: { id: string; label: string; value: string; statusColor?: string; color?: string }[]
  upcomingEvents: {
    id: string
    label: string
    value: string
    statusColor?: string
    color?: string
  }[]
  announcement?: { tag: string; title: string; summary: string; readTime: string }
}

export interface ExecutiveDashboardData {
  headcount: number
  headcountGrowth: number
  attendanceRate: number
  attendanceRateChange: number
  payrollCost: string
  payrollCostChange: number
  turnover: number
  turnoverChange: number
  attention: {
    id: string
    label: string
    subLabel: string
    count: number
    variant: 'info' | 'warning' | 'danger' | 'success'
  }[]
  workforceMovement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  distribution: { key: string; label: string; percentage: number; color: string }[]
  risk: { id: string; label: string; count: string | number; color?: string; countColor?: string }[]
  highlight?: string
}

export interface HRDashboardData {
  totalEmployees: number
  presentToday: number
  presentPercentage: number
  pendingApprovals: number
  overdueApprovals: number
  employmentAlerts: number
  compliance: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  movement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  events: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
}

export interface ManagerDashboardData {
  teamMembers: number
  activeMembers: number
  probationMembers: number
  teamAttendance: number
  pendingApprovals: number
  overdueApprovals: number
  onLeaveToday: number
  leavePlanned: number
  leaveSick: number
  approvalQueue: {
    id: string
    label: string
    subLabel: string
    count: number
    variant: 'info' | 'warning' | 'danger' | 'success'
  }[]
  contractProbation: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  teamMovement: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  teamEvents: {
    id: string
    label: string
    count: string | number
    color?: string
    countColor?: string
  }[]
  healthInsight?: string
}

export type WidgetCategory = 'all' | 'people' | 'time' | 'payroll'

export interface CatalogWidget {
  id: string
  abbr: string
  abbrColor: string
  name: () => string
  desc: () => string
  category: WidgetCategory[]
  active: boolean
}

export interface CanvasWidget {
  id: string
  name: string
  size: 'S' | 'M' | 'L'
  dateRange: string
  active: boolean
  colSpan?: 1 | 2
}

export interface SelectedWidget {
  id: string
  name: string
  previewLabel?: string
  previewValue?: string
  previewSub?: string
  previewBadge?: string
  previewBadgeColor?: string
}

export interface WidgetConfig {
  widgetId: string
  dateRange: string
  visualization: string
  size: 'S' | 'M' | 'L'
  displayComparison: boolean
}

export interface WidgetConfigModalResult {
  widgetId: string
  dateRange: string
  compareWith: string
  visualization: string
  refreshFrequency: string
  size: 'S' | 'M' | 'L'
  showComparison: boolean
}
