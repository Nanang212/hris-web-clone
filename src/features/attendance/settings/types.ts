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
