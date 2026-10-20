export type AttendanceOverviewStatus = 'on_time' | 'late' | 'leave' | 'missing'

export interface AttendanceOverviewCounts {
  total: number
  present: number
  onTime: number
  late: number
  leave: number
  missing: number
  presentRate: number
}

export interface AttendanceOverviewData {
  date: string
  departments: { id: string; name: string }[]
  summary: AttendanceOverviewCounts
  trend: {
    date: string
    onTime: number
    late: number
    leave: number
    missing: number
  }[]
  attention: { incompleteClockOut: number }
  punctuality: {
    rate: number
    changePercentagePoints: number
    averageLateMinutes: number
  }
}

export interface AttendanceOverviewRecord {
  id: string
  employeeId: string
  employeeName: string
  departmentName: string
  shiftStart: string
  shiftEnd: string
  clockInAt: string | null
  clockOutAt: string | null
  status: AttendanceOverviewStatus
  lateMinutes: number
  source: 'web' | 'mobile' | 'device' | null
  incompleteClockOut: boolean
}

export interface AttendanceOverviewRecordsData {
  items: AttendanceOverviewRecord[]
  total: number
  page: number
  pageSize: number
}
