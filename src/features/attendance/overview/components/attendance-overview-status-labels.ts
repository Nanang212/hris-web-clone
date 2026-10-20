import { m } from '@/i18n/paraglide/messages'

import type { AttendanceOverviewStatus } from '../types'

export function getMissingAttendanceLabel(isToday: boolean) {
  return isToday ? m.attendance_overview_missing_today() : m.attendance_overview_missing_past()
}

export function getAttendanceOverviewStatusLabel(
  status: AttendanceOverviewStatus,
  isToday: boolean,
) {
  switch (status) {
    case 'on_time':
      return m.attendance_overview_status_on_time()
    case 'late':
      return m.attendance_overview_status_late()
    case 'leave':
      return m.attendance_overview_status_leave()
    case 'missing':
      return getMissingAttendanceLabel(isToday)
  }
}
