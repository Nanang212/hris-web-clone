import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  CreateEmployeeInformationData,
  CreateEmployeeInformationRequest,
  EmployeeBankVerificationData,
  EmployeeCreationOptionsData,
  EmployeeInformationActionData,
  EmployeeInformationDetailData,
  EmployeeInformationFilterParams,
  EmployeeInformationListData,
  EmployeeInformationOverviewData,
  ImportEmployeeInformationData,
  UpdateEmployeeInformationRequest,
  UpdateEmployeeStatusPayload,
} from '@/features/company/employee-information/types'

/**
 * Endpoint: `/api/v1/company/employee-information/create-options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "departments": [{ "id": "department-hr", "name": "Human Resources" }], "divisions": [{ "id": "division-people", "name": "People Operations" }], "positions": [{ "id": "position-hr-supervisor", "name": "HR Supervisor", "departmentId": "department-hr" }], "grades": [{ "id": "grade-supervisor", "name": "Supervisor" }], "branches": [{ "id": "branch-jakarta", "name": "Jakarta HQ" }], "managers": [{ "id": "employee-10001", "name": "Siti Maharani" }], "banks": [{ "id": "bank-bca", "name": "Bank Central Asia" }], "genders": ["Male", "Female"], "employmentTypes": ["Permanent", "Contract", "Internship", "Freelance"] }, "messages": [] }`
 */
export async function getEmployeeCreationOptions() {
  const res = await apiClient.get<Envelope<EmployeeCreationOptionsData>>(
    '/api/v1/company/employee-information/create-options',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information`
 * Method: `POST`
 * Request body: `multipart/form-data` with field `employee` containing the JSON payload and optional field `profilePhoto` containing a JPG, PNG, or WebP file.
 * The `employee` JSON contains `status: "Draft"` for Save Draft or `status: "Active"` for Create Employee. Reaching the review step does not call this endpoint.
 * Expected response: `{ "success": true, "code": "CREATED", "data": { "employeeId": "employee-10242", "employeeNumber": "10042", "status": "Active", "createdAt": "2026-09-01T10:30:00+07:00" }, "messages": ["Employee created successfully"] }`
 */
export async function createEmployeeInformation(request: CreateEmployeeInformationRequest) {
  const body = new FormData()
  body.append('employee', JSON.stringify(request.payload))
  if (request.profilePhoto) body.append('profilePhoto', request.profilePhoto)

  const res = await apiClient.post<Envelope<CreateEmployeeInformationData>>(
    '/api/v1/company/employee-information',
    body,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/{employeeId}`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "employee-10024", "employeeNumber": "EMP-2023-00128", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "address": "Jakarta, Indonesia", "avatarUrl": null, "status": "Active", "positionName": "Product Designer", "departmentName": "Product Design", "divisionName": "Design Division", "branchName": "Jakarta HQ", "gradeName": "MC", "joinDate": "2023-03-12", "employmentType": "Permanent", "personalInformation": { "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "birthDate": "1992-08-14", "gender": "Male", "maritalStatus": "Married", "nationality": "Indonesia", "address": "Jakarta Selatan 12730" }, "employmentInformation": { "employeeNumber": "EMP-2023-00128", "joinDate": "2023-03-12", "employmentType": "Permanent", "departmentId": "department-product", "departmentName": "Product Design", "divisionId": "division-design", "divisionName": "Design", "positionId": "position-product-designer", "positionName": "Product Designer", "gradeId": "grade-mc", "gradeName": "MC", "branchId": "branch-jakarta", "supervisorId": "employee-10034", "workLocation": "Jakarta Office", "supervisorName": "Dewi Kartika" }, "emergencyContact": { "name": "Budi Santoso", "relationship": "Father", "phoneNumber": "+62 813-1111-2222", "address": "Depok, Jawa Barat 16412" }, "financialAndCompliance": { "bankId": "bank-bca", "bankAccountHolder": "Rama Aditya", "bankName": "Bank Central Asia (BCA)", "bankAccountNumber": "123456789012", "bankBranch": "KCU Jakarta Selatan", "bankAccountType": "Savings", "currency": "IDR", "bankEffectiveDate": "2026-08-09", "payrollAccount": true, "bankVerification": { "status": "Verified", "verifiedAt": "2026-08-01", "payrollMappingActive": true }, "npwpNumber": "12.345.678.9-012.000", "npwpStatus": "Active", "npwpRegisteredName": "Rama Aditya", "taxCategory": "TK/0", "npwpEffectiveDate": "2023-03-12", "taxOffice": "KPP Pratama Jakarta", "npwpDocument": { "fileName": "NPWP_Rama_Aditya.pdf", "fileSize": 430080, "url": "/documents/npwp-rama.pdf" }, "bpjsHealthNumber": "0001234567890", "bpjsEmploymentNumber": "190001234567890" }, "medicalCheckup": { "status": "Fit", "dueDate": "2027-07-15", "lastCheckupDate": "2026-07-15", "provider": "Prodia Occupational Health", "examinationType": "AnnualMCU", "followUpRequired": false, "administrativeNote": "Fit for work.", "document": { "fileName": "MCU_Rama_2026.pdf", "fileSize": 524288, "url": "/documents/mcu-rama-2026.pdf" } }, "statusManagement": { "effectiveDate": "2026-08-09", "reason": "StatusCorrection", "lastWorkingDate": null, "notes": "Status corrected." }, "statusHistory": [{ "id": "history-1", "status": "Active", "employmentType": "Permanent", "effectiveDate": "2023-03-12", "reason": null }] }, "messages": [] }`
 */
export async function getEmployeeInformationDetail(employeeId: string) {
  const res = await apiClient.get<Envelope<EmployeeInformationDetailData>>(
    `/api/v1/company/employee-information/${employeeId}`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/{employeeId}`
 * Method: `PATCH`
 * Request body: `multipart/form-data` with field `employee` containing the profile JSON; optional `profilePhoto`, `npwpDocument`, and `medicalCheckupDocument` file fields.
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "employee-10024", "employeeNumber": "EMP-2023-00128", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "address": "Jakarta, Indonesia", "avatarUrl": "/uploads/employees/employee-10024.webp", "status": "Active", "positionName": "Product Designer", "departmentName": "Product Design", "divisionName": "Design Division", "branchName": "Jakarta HQ", "gradeName": "MC", "joinDate": "2023-03-12", "employmentType": "Permanent", "personalInformation": { "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "birthDate": "1992-08-14", "gender": "Male", "maritalStatus": "Married", "nationality": "Indonesia", "address": "Jakarta Selatan 12730" }, "employmentInformation": { "employeeNumber": "EMP-2023-00128", "joinDate": "2023-03-12", "employmentType": "Permanent", "departmentId": "department-product", "departmentName": "Product Design", "divisionId": "division-design", "divisionName": "Design", "positionId": "position-product-designer", "positionName": "Product Designer", "gradeId": "grade-mc", "gradeName": "MC", "branchId": "branch-jakarta", "supervisorId": "employee-10034", "workLocation": "Jakarta Office", "supervisorName": "Dewi Kartika" }, "emergencyContact": { "name": "Budi Santoso", "relationship": "Father", "phoneNumber": "+62 813-1111-2222", "address": "Depok, Jawa Barat 16412" }, "financialAndCompliance": { "bankId": "bank-bca", "bankAccountHolder": "Rama Aditya", "bankName": "Bank Central Asia (BCA)", "bankAccountNumber": "123456789012", "npwpNumber": "12.345.678.9-012.000", "npwpStatus": "Active", "bpjsHealthNumber": "0001234567890", "bpjsEmploymentNumber": "190001234567890" }, "medicalCheckup": { "status": "Fit", "dueDate": "2027-07-15", "lastCheckupDate": "2026-07-15" } }, "messages": ["Employee profile updated successfully"] }`
 */
export async function updateEmployeeInformation(request: UpdateEmployeeInformationRequest) {
  const body = new FormData()
  body.append('employee', JSON.stringify(request.payload))
  if (request.profilePhoto) body.append('profilePhoto', request.profilePhoto)
  if (request.npwpDocument) body.append('npwpDocument', request.npwpDocument)
  if (request.medicalCheckupDocument) {
    body.append('medicalCheckupDocument', request.medicalCheckupDocument)
  }

  const res = await apiClient.patch<Envelope<EmployeeInformationDetailData>>(
    `/api/v1/company/employee-information/${request.employeeId}`,
    body,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/{employeeId}/bank-verification`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "ACCEPTED", "data": { "employeeId": "employee-10024", "status": "Pending", "requestedAt": "2026-09-02T10:30:00+07:00" }, "messages": ["Bank account verification requested"] }`
 */
export async function requestEmployeeBankVerification(employeeId: string) {
  const res = await apiClient.post<Envelope<EmployeeBankVerificationData>>(
    `/api/v1/company/employee-information/${employeeId}/bank-verification`,
  )
  return res.data
}

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
