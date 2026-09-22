import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type { AttendanceSettingsData, UpdateAttendanceSettingsInput } from './types'

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
