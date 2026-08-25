import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  EmployeeInformationActionData,
  EmployeeInformationFilterParams,
  EmployeeInformationListData,
  EmployeeInformationOverviewData,
  ImportEmployeeInformationData,
  UpdateEmployeeStatusPayload,
} from '@/features/company/employee-information/types'

/**
 * Endpoint: `/api/v1/company/employee-information/overview`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "stats": { "totalEmployees": 1248, "totalChangePercent": 5.2, "activeEmployees": 1132, "activeChangePercent": 4.6, "onLeaveEmployees": 45, "onLeaveChangePercent": 2.1, "resignedThisMonth": 20, "resignedChangePercent": -11.1 }, "departmentDistribution": [{ "departmentId": "department-engineering", "departmentName": "Engineering", "employeeCount": 312, "percentage": 25, "color": "#2563eb" }], "filterOptions": { "departments": [{ "value": "department-engineering", "label": "Engineering" }], "statuses": ["Active", "OnLeave", "Probation", "Resigned", "Inactive"], "employmentTypes": ["Permanent", "Contract", "Internship", "Freelance"] }, "updatedAt": "2026-08-25T10:00:00+07:00" }, "messages": [] }`
 */
export async function getEmployeeInformationOverview() {
  const res = await apiClient.get<Envelope<EmployeeInformationOverviewData>>(
    '/api/v1/company/employee-information/overview',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information`
 * Method: `GET`
 * Query params: `{ "search": "Rama", "departmentId": "department-product", "status": "Active", "employmentType": "Permanent", "page": 1, "limit": 10 }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "items": [{ "id": "employee-10024", "employeeNumber": "EMP-2023-0012", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "avatarUrl": null, "departmentId": "department-product", "departmentName": "Product Design", "positionName": "Product Designer", "status": "Active", "employmentType": "Permanent", "joinDate": "2023-01-14" }], "pagination": { "page": 1, "limit": 10, "totalItems": 1248, "totalPages": 125 } }, "messages": [] }`
 */
export async function getEmployeeInformation(params?: EmployeeInformationFilterParams) {
  const res = await apiClient.get<Envelope<EmployeeInformationListData>>(
    '/api/v1/company/employee-information',
    { params },
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/import`
 * Method: `POST`
 * Request body: `multipart/form-data` with field `file` containing a CSV or XLSX file.
 * Expected response: `{ "success": true, "code": "OK", "data": { "imported": 48, "skipped": 2, "failed": 0, "completedAt": "2026-08-25T10:15:00+07:00" }, "messages": ["Employee data imported successfully"] }`
 */
export async function importEmployeeInformation(file: File) {
  const body = new FormData()
  body.append('file', file)
  const res = await apiClient.post<Envelope<ImportEmployeeInformationData>>(
    '/api/v1/company/employee-information/import',
    body,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/export`
 * Method: `GET`
 * Query params: same active filters as `GET /api/v1/company/employee-information`; optional `employeeIds` exports only the selected employees.
 * Expected response: XLSX file (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) containing the filtered employee directory.
 */
export async function exportEmployeeInformation(params?: EmployeeInformationFilterParams) {
  const res = await apiClient.get<Blob>('/api/v1/company/employee-information/export', {
    params,
    responseType: 'blob',
  })
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/:id/status`
 * Method: `PATCH`
 * Request body: `{ "status": "OnLeave" }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "employeeId": "employee-10024", "completedAt": "2026-08-25T10:20:00+07:00" }, "messages": ["Employee status updated successfully"] }`
 */
export async function updateEmployeeInformationStatus(
  id: string,
  payload: UpdateEmployeeStatusPayload,
) {
  const res = await apiClient.patch<Envelope<EmployeeInformationActionData>>(
    `/api/v1/company/employee-information/${id}/status`,
    payload,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/:id/profile`
 * Method: `GET`
 * Expected response: printable employee profile as a PDF file (`application/pdf`).
 */
export async function downloadEmployeeProfile(id: string) {
  const res = await apiClient.get<Blob>(`/api/v1/company/employee-information/${id}/profile`, {
    responseType: 'blob',
  })
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/:id/archive`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "employeeId": "employee-10024", "completedAt": "2026-08-25T10:25:00+07:00" }, "messages": ["Employee archived successfully"] }`
 */
export async function archiveEmployeeInformation(id: string) {
  const res = await apiClient.post<Envelope<EmployeeInformationActionData>>(
    `/api/v1/company/employee-information/${id}/archive`,
  )
  return res.data
}
