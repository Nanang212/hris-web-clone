export interface AttendanceSettingsWorkModes {
  wfo: boolean
  wfh: boolean
  hybridWfa: boolean
}

export interface AttendanceSettingsCategories {
  regular: boolean
  overtime: boolean
  businessTrip: boolean
}

export interface AttendanceSettingsSession {
  startTime: string
  endTime: string
}

export interface AttendanceSettingsWorkTimeTypes {
  regular: {
    enabled: boolean
    defaultClockIn: string
    defaultClockOut: string
    useAsWorkHoursReference: boolean
  }
  shifting: {
    enabled: boolean
  }
  splitHours: {
    enabled: boolean
    targetDailyHours: number
    sessions: AttendanceSettingsSession[]
  }
}

export interface AttendanceSettingsPolicy {
  lateToleranceMinutes: number
  earlyLeaveToleranceMinutes: number
  clockInWindowMinutes: number
  clockOutWindowMinutes: number
  missingClockReminder: boolean
  allowMultipleClockInOut: boolean
  autoClockOut: boolean
  autoClockOutTime: string
}

export interface AttendanceSettingsValidation {
  faceVerification: boolean
  gpsValidation: boolean
  geofencing: boolean
}

export interface UpdateAttendanceSettingsInput {
  workModes: AttendanceSettingsWorkModes
  attendanceCategories: AttendanceSettingsCategories
  workTimeTypes: AttendanceSettingsWorkTimeTypes
  policy: AttendanceSettingsPolicy
  validation: AttendanceSettingsValidation
}

export interface AttendanceSettingsData extends UpdateAttendanceSettingsInput {
  id: string
  impact: {
    employeeCount: number
    branchCount: number
  }
  updatedAt: string
}

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
