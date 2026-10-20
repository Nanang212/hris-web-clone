import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

import type {
  AttendanceOverviewData,
  AttendanceOverviewRecordsData,
  AttendanceOverviewStatus,
} from './types'

export interface GetAttendanceOverviewInput {
  date: string
  departmentId?: string
}

export interface GetAttendanceOverviewRecordsInput extends GetAttendanceOverviewInput {
  search?: string
  status?: AttendanceOverviewStatus
  page: number
  pageSize: number
}

/**
 * Endpoint: GET /api/v1/time-management/attendance/overview?date=2026-10-20&department_id=eng
 * Method: GET. Omit department_id for all departments. The department options remain unfiltered.
 * Expected response (apiClient converts snake_case fields to camelCase):
 * ```json
 * {
 *   "success": true,
 *   "code": "ATTENDANCE_OVERVIEW_RETRIEVED",
 *   "data": {
 *     "date": "2026-10-20",
 *     "departments": [{ "id": "eng", "name": "Engineering" }, { "id": "hr", "name": "Human Resources" }],
 *     "summary": { "total": 100, "present": 86, "on_time": 78, "late": 8, "leave": 5, "missing": 9, "present_rate": 86 },
 *     "trend": [
 *       { "date": "2026-10-14", "on_time": 76, "late": 9, "leave": 6, "missing": 9 },
 *       { "date": "2026-10-15", "on_time": 80, "late": 6, "leave": 5, "missing": 9 },
 *       { "date": "2026-10-16", "on_time": 78, "late": 8, "leave": 6, "missing": 8 },
 *       { "date": "2026-10-17", "on_time": 82, "late": 5, "leave": 5, "missing": 8 },
 *       { "date": "2026-10-18", "on_time": 75, "late": 10, "leave": 6, "missing": 9 },
 *       { "date": "2026-10-19", "on_time": 77, "late": 9, "leave": 5, "missing": 9 },
 *       { "date": "2026-10-20", "on_time": 78, "late": 8, "leave": 5, "missing": 9 }
 *     ],
 *     "attention": { "incomplete_clock_out": 3 },
 *     "punctuality": { "rate": 90.7, "change_percentage_points": 1.2, "average_late_minutes": 17 }
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getAttendanceOverview(
  input: GetAttendanceOverviewInput,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<Envelope<AttendanceOverviewData>>(
    '/api/v1/time-management/attendance/overview',
    { params: input, signal },
  )
  return response.data
}

/**
 * Endpoint: GET /api/v1/time-management/attendance/overview/records?date=2026-10-20&department_id=eng&search=aditya&status=late&page=1&page_size=10
 * Method: GET. Omit optional filters when not selected. `total` is the filtered count, before pagination.
 * Expected response (apiClient converts snake_case fields to camelCase):
 * ```json
 * {
 *   "success": true,
 *   "code": "ATTENDANCE_OVERVIEW_RECORDS_RETRIEVED",
 *   "data": {
 *     "items": [{
 *       "id": "att-20261020-001",
 *       "employee_id": "EMP-001",
 *       "employee_name": "Aditya Pratama",
 *       "department_name": "Engineering",
 *       "shift_start": "08:00",
 *       "shift_end": "17:00",
 *       "clock_in_at": "2026-10-20T08:12:00+07:00",
 *       "clock_out_at": null,
 *       "status": "late",
 *       "late_minutes": 12,
 *       "source": "mobile",
 *       "incomplete_clock_out": false
 *     }],
 *     "total": 1,
 *     "page": 1,
 *     "page_size": 10
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getAttendanceOverviewRecords(
  input: GetAttendanceOverviewRecordsInput,
  signal?: AbortSignal,
) {
  const response = await apiClient.get<Envelope<AttendanceOverviewRecordsData>>(
    '/api/v1/time-management/attendance/overview/records',
    { params: input, signal },
  )
  return response.data
}
