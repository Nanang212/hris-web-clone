import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  AttendanceOverviewData,
  AttendanceOverviewRecordsData,
  AttendanceOverviewStatus,
  AttendanceSettingsData,
  UpdateAttendanceSettingsInput,
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
export async function getAttendanceOverview(input: GetAttendanceOverviewInput, signal?: AbortSignal) {
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

/**
 * Endpoint: GET /api/v1/time-management/attendance/settings
 * Method: GET
 * Expected response:
 * ```json
 * {
 *   "success": true,
 *   "code": "ATTENDANCE_SETTINGS_RETRIEVED",
 *   "data": {
 *     "id": "attendance-settings-default",
 *     "work_modes": { "wfo": true, "wfh": true, "hybrid_wfa": false },
 *     "attendance_categories": {
 *       "regular": true,
 *       "overtime": true,
 *       "business_trip": true
 *     },
 *     "work_time_types": {
 *       "regular": {
 *         "enabled": true,
 *         "default_clock_in": "08:00",
 *         "default_clock_out": "17:00",
 *         "use_as_work_hours_reference": true
 *       },
 *       "shifting": { "enabled": true },
 *       "split_hours": {
 *         "enabled": true,
 *         "target_daily_hours": 8,
 *         "sessions": [
 *           { "start_time": "08:00", "end_time": "12:00" },
 *           { "start_time": "13:00", "end_time": "17:00" }
 *         ]
 *       }
 *     },
 *     "policy": {
 *       "late_tolerance_minutes": 15,
 *       "early_leave_tolerance_minutes": 15,
 *       "clock_in_window_minutes": 60,
 *       "clock_out_window_minutes": 240,
 *       "missing_clock_reminder": true,
 *       "allow_multiple_clock_in_out": true,
 *       "auto_clock_out": true,
 *       "auto_clock_out_time": "18:30"
 *     },
 *     "validation": {
 *       "face_verification": true,
 *       "gps_validation": true,
 *       "geofencing": true
 *     },
 *     "impact": { "employee_count": 1248, "branch_count": 4 },
 *     "updated_at": "2026-09-22T09:30:00+07:00"
 *   },
 *   "messages": []
 * }
 * ```
 */
export async function getAttendanceSettings() {
  const response = await apiClient.get<Envelope<AttendanceSettingsData>>(
    '/api/v1/time-management/attendance/settings',
  )
  return response.data
}

/**
 * Endpoint: PATCH /api/v1/time-management/attendance/settings
 * Method: PATCH
 * Request body follows `UpdateAttendanceSettingsInput` and is converted to snake_case by apiClient.
 * Expected response:
 * ```json
 * {
 *   "success": true,
 *   "code": "ATTENDANCE_SETTINGS_UPDATED",
 *   "data": {
 *     "id": "attendance-settings-default",
 *     "work_modes": { "wfo": true, "wfh": true, "hybrid_wfa": true },
 *     "attendance_categories": {
 *       "regular": true,
 *       "overtime": true,
 *       "business_trip": true
 *     },
 *     "work_time_types": {
 *       "regular": {
 *         "enabled": true,
 *         "default_clock_in": "08:00",
 *         "default_clock_out": "17:00",
 *         "use_as_work_hours_reference": true
 *       },
 *       "shifting": { "enabled": true },
 *       "split_hours": {
 *         "enabled": true,
 *         "target_daily_hours": 8,
 *         "sessions": [
 *           { "start_time": "08:00", "end_time": "12:00" },
 *           { "start_time": "13:00", "end_time": "17:00" }
 *         ]
 *       }
 *     },
 *     "policy": {
 *       "late_tolerance_minutes": 15,
 *       "early_leave_tolerance_minutes": 15,
 *       "clock_in_window_minutes": 60,
 *       "clock_out_window_minutes": 240,
 *       "missing_clock_reminder": true,
 *       "allow_multiple_clock_in_out": true,
 *       "auto_clock_out": true,
 *       "auto_clock_out_time": "18:30"
 *     },
 *     "validation": {
 *       "face_verification": true,
 *       "gps_validation": true,
 *       "geofencing": true
 *     },
 *     "impact": { "employee_count": 1248, "branch_count": 4 },
 *     "updated_at": "2026-09-22T09:35:00+07:00"
 *   },
 *   "messages": ["Attendance settings updated successfully."]
 * }
 * ```
 */
export async function updateAttendanceSettings(input: UpdateAttendanceSettingsInput) {
  const response = await apiClient.put<Envelope<AttendanceSettingsData>>(
    '/api/v1/time-management/attendance/settings',
    input,
  )
  return response.data
}
