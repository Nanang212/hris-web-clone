import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type { EmployeeInformationDocumentDetail } from '@/features/employment/employee-profile/types'
import type {
  CreateEmployeeProfileInput,
  CreateEmployeeProfileOutput,
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
} from '@/features/employment/employee-profile/types'

export interface EmployeeRejoinInput {
  joinDate: string
  contract: { startDate: string; endDate?: string; reference: string }
  notes: string
}

export interface EmployeeRejoinOutput {
  employeeId: string
  accountId: string
  employmentPeriodId: string
  status: 'Active'
  joinDate: string
}

export interface EmployeeEmploymentPeriodRecord {
  id: string
  startDate: string
  endDate: string | null
  reason: string | null
  contractReference: string | null
  documents: (EmployeeInformationDocumentDetail & Partial<EmployeeEmploymentDocumentRecord>)[]
  payslips: { id: string; period: string; downloadUrl: string | null }[]
  screenings?: EmployeeEmploymentScreeningRecord[]
}

export interface EmployeeEmploymentScreeningRecord {
  id: string
  screeningDate: string
  result: 'passed' | 'follow_up' | 'not_recommended'
  notes: string
  reviewerName: string
  createdAt: string
}

export interface CreateEmployeeEmploymentScreeningInput {
  screeningDate: string
  result: EmployeeEmploymentScreeningRecord['result']
  notes: string
}

export interface UploadEmployeeEmploymentDocumentInput {
  title: string
  category: 'contract' | 'employment_certificate' | 'screening' | 'other'
  notes: string
  file: File
}

export interface EmployeeEmploymentDocumentRecord extends EmployeeInformationDocumentDetail {
  id: string
  title: string
  category: UploadEmployeeEmploymentDocumentInput['category']
  notes: string
  createdAt: string
}

export interface EmployeeEmploymentPeriodsOutput {
  employeeId: string
  items: EmployeeEmploymentPeriodRecord[]
}

/**
 * POST /api/v1/company/employees/{employeeId}/rejoin
 * Header: Idempotency-Key: a unique key retained when retrying the same request.
 * Input: { "joinDate": "2026-08-01", "contract": { "startDate": "2026-08-01", "endDate": "2027-07-31", "reference": "PKWT/BFP/2026/008" }, "notes": "Re-join approved by HR" }
 * Expected response:
 * { "success": true, "code": "OK", "data": { "employeeId": "employee-10024", "accountId": "user-10024", "employmentPeriodId": "employment-period-2", "status": "Active", "joinDate": "2026-08-01" }, "messages": [] }
 * Backend contract: preserve the existing employee/account and historical records;
 * reject active employees, overlapping employment periods, or unauthorized requests.
 * Reusing the key must not create an additional period. Re-join must not restore revoked roles automatically.
 */
export async function rejoinEmployee(employeeId: string, input: EmployeeRejoinInput, requestId: string) {
  const response = await apiClient.post<Envelope<EmployeeRejoinOutput>>(
    `/api/v1/company/employees/${encodeURIComponent(employeeId)}/rejoin`, input,
    { headers: { 'Idempotency-Key': requestId } },
  )
  return response.data
}

/**
 * GET /api/v1/company/employees/{employeeId}/employment-periods
 * Expected response:
 * { "success": true, "code": "OK", "data": { "employeeId": "employee-10024", "items": [{ "id": "employment-period-1", "startDate": "2025-01-01", "endDate": "2026-03-31", "reason": "Resigned", "contractReference": "PKWT/BFP/2025/001", "documents": [{ "fileName": "contract-2025.pdf", "fileSize": 420000, "url": "https://files.example.com/authorized-contract" }], "payslips": [{ "id": "slip-202603", "period": "2026-03", "downloadUrl": "https://files.example.com/authorized-slip" }] }, { "id": "employment-period-2", "startDate": "2026-08-01", "endDate": null, "reason": null, "contractReference": "PKWT/BFP/2026/008", "documents": [], "payslips": [] }] }, "messages": [] }
 * Document/slip access must be authorized by the backend; URLs must not grant access to other employees.
 */
export async function getEmployeeEmploymentPeriods(employeeId: string) {
  const response = await apiClient.get<Envelope<EmployeeEmploymentPeriodsOutput>>(
    `/api/v1/company/employees/${encodeURIComponent(employeeId)}/employment-periods`,
  )
  return response.data
}

/**
 * POST /api/v1/company/employees/{employeeId}/employment-periods/{periodId}/documents
 * Content-Type: multipart/form-data (browser boundary). Fields: title, category, notes, file.
 * Header: Idempotency-Key retained when retrying the same submission.
 * Expected response:
 * { "success": true, "code": "CREATED", "data": { "id": "employment-doc-1", "title": "Kontrak 2026", "category": "contract", "notes": "Kontrak ditandatangani", "fileName": "contract-2026.pdf", "fileSize": 420000, "url": "https://files.example.com/authorized-contract", "createdAt": "2026-10-27T09:00:00Z" }, "messages": ["Document uploaded"] }
 * GET employment-periods must include this document in the matching period's documents array.
 * Backend must authorize HR access and period ownership, enforce PDF/JPEG/PNG <= 10 MB,
 * inspect actual file content, scan uploads, use private storage and authorized download URLs,
 * and audit the uploader. Client validation does not replace these controls.
 */
export async function uploadEmployeeEmploymentDocument(employeeId: string, periodId: string, input: UploadEmployeeEmploymentDocumentInput, requestId: string) {
  const body = new FormData()
  body.append('title', input.title)
  body.append('category', input.category)
  body.append('notes', input.notes)
  body.append('file', input.file)
  const response = await apiClient.post<Envelope<EmployeeEmploymentDocumentRecord>>(
    `/api/v1/company/employees/${encodeURIComponent(employeeId)}/employment-periods/${encodeURIComponent(periodId)}/documents`,
    body,
    { headers: { 'Content-Type': undefined, 'Idempotency-Key': requestId } },
  )
  return response.data
}

/**
 * POST /api/v1/company/employees/{employeeId}/employment-periods/{periodId}/screenings
 * Header: Idempotency-Key retained when retrying the same submission.
 * Request: { "screeningDate": "2026-10-27", "result": "follow_up", "notes": "Perlu verifikasi referensi kerja." }
 * Expected response:
 * { "success": true, "code": "CREATED", "data": { "id": "screening-1", "screeningDate": "2026-10-27", "result": "follow_up", "notes": "Perlu verifikasi referensi kerja.", "reviewerName": "Siti Maharani", "createdAt": "2026-10-27T09:00:00Z" }, "messages": ["Screening recorded"] }
 * GET employment-periods returns screenings: [{ id, screeningDate, result, notes, reviewerName, createdAt }]
 * on the corresponding period; old payloads without screenings remain supported.
 * Backend authorizes HR access/period ownership, validates dates and content, derives reviewer
 * from the authenticated user and audits the action. A screening does not automatically change
 * employee status, payroll, or re-join eligibility.
 */
export async function createEmployeeEmploymentScreening(employeeId: string, periodId: string, input: CreateEmployeeEmploymentScreeningInput, requestId: string) {
  const response = await apiClient.post<Envelope<EmployeeEmploymentScreeningRecord>>(
    `/api/v1/company/employees/${encodeURIComponent(employeeId)}/employment-periods/${encodeURIComponent(periodId)}/screenings`,
    input,
    { headers: { 'Idempotency-Key': requestId } },
  )
  return response.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/create-options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "departments": [{ "id": "department-hr", "name": "Human Resources" }], "divisions": [{ "id": "division-people", "name": "People Operations" }], "positions": [{ "id": "position-hr-supervisor", "name": "HR Supervisor", "departmentId": "department-hr" }], "grades": [{ "id": "grade-supervisor", "name": "Supervisor" }], "branches": [{ "id": "branch-jakarta", "name": "Jakarta HQ" }], "managers": [{ "id": "employee-10001", "name": "Siti Maharani" }], "banks": [{ "id": "bank-bca", "name": "Bank Central Asia" }], "genders": ["Male", "Female"], "companyTypes": ["Permanent", "Contract", "Internship", "Freelance"] }, "messages": [] }`
 */
export async function getEmployeeCreationOptions() {
  const res = await apiClient.get<Envelope<EmployeeCreationOptionsData>>(
    '/api/v1/company/employee-information/create-options',
  )
  return res.data
}

/**
 * Endpoint: `/v1/employee-profiles`
 * Method: `POST`
 * Request example: `{ "employee": { "employeeNumber": "EMP-2026-0104", "fullName": "Nadia Putri", "ktpNumber": "3171012345670001", "motherMaidenName": "Siti Aminah", "religion": "ISLAM", "trainings": ["Induction", "Workplace Safety"] }, "assignments": [{ "divisionUnitId": "division-product", "positionId": "position-product-designer", "effectiveStartDate": "2026-10-03", "employmentType": "PERMANENT", "baseSalary": "12000000.00", "workTimeType": "Regular" }], "taxProfile": { "ptkpStatus": "TK/0" } }`
 * Expected response: `{ "success": true, "code": "CREATED", "data": { "id": "employee-10104", "assignments": ["assignment-10104"], "contacts": [], "contracts": [], "documents": [], "educations": [], "payrollComponentAssignments": [], "projects": [], "taxProfileId": "tax-profile-10104" }, "messages": ["Employee profile created successfully"] }`
 */
export async function createEmployeeProfile(input: CreateEmployeeProfileInput) {
  const {
    assignments,
    bankAccounts,
    bpjs,
    contacts,
    contracts,
    educations,
    employee,
    payrollComponents,
    projects,
    taxProfile,
  } = input
  const out = await apiClient.post<Envelope<CreateEmployeeProfileOutput>>('/v1/employee-profiles', {
    assignments,
    bankAccounts,
    bpjs,
    contacts,
    contracts,
    educations,
    employee,
    payrollComponents,
    projects,
    taxProfile,
  })
  return out.data
}

/**
 * Endpoint: `/api/v1/company/employee-information/{employeeId}`
 * Method: `GET`
 * The response includes NIK at `data.personalInformation.ktpNumber`, for example `{ "ktpNumber": "3171012345670001" }`.
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "employee-10024", "employeeNumber": "EMP-2023-00128", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "address": "Jakarta, Indonesia", "avatarUrl": null, "status": "Active", "positionName": "Product Designer", "departmentName": "Product Design", "divisionName": "Design Division", "branchName": "Jakarta HQ", "gradeName": "MC", "joinDate": "2023-03-12", "employmentType": "Permanent", "personalInformation": { "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "birthDate": "1992-08-14", "gender": "Male", "maritalStatus": "Married", "nationality": "Indonesia", "address": "Jakarta Selatan 12730", "motherMaidenName": "Sri Wahyuni", "religion": "Islam", "taxStatus": "TK/0", "trainings": ["Design Thinking", "Workplace Safety"] }, "employmentInformation": { "employeeNumber": "EMP-2023-00128", "joinDate": "2023-03-12", "employmentType": "Permanent", "departmentId": "department-product", "departmentName": "Product Design", "divisionId": "division-design", "divisionName": "Design", "positionId": "position-product-designer", "positionName": "Product Designer", "gradeId": "grade-mc", "gradeName": "MC", "branchId": "branch-jakarta", "supervisorId": "employee-10034", "workLocation": "Jakarta Office", "supervisorName": "Dewi Kartika", "baseSalary": "18000000.00", "workTimeType": "Regular" }, "emergencyContact": { "name": "Budi Santoso", "relationship": "Father", "phoneNumber": "+62 813-1111-2222", "address": "Depok, Jawa Barat 16412" }, "financialAndCompliance": { "bankId": "bank-bca", "bankAccountHolder": "Rama Aditya", "bankName": "Bank Central Asia (BCA)", "bankAccountNumber": "123456789012", "bankBranch": "KCU Jakarta Selatan", "bankAccountType": "Savings", "currency": "IDR", "bankEffectiveDate": "2026-08-09", "payrollAccount": true, "bankVerification": { "status": "Verified", "verifiedAt": "2026-08-01", "payrollMappingActive": true }, "npwpNumber": "12.345.678.9-012.000", "npwpStatus": "Active", "npwpRegisteredName": "Rama Aditya", "taxCategory": "TK/0", "npwpEffectiveDate": "2023-03-12", "taxOffice": "KPP Pratama Jakarta", "npwpDocument": { "fileName": "NPWP_Rama_Aditya.pdf", "fileSize": 430080, "url": "/documents/npwp-rama.pdf" }, "bpjsHealthNumber": "0001234567890", "bpjsEmploymentNumber": "190001234567890" }, "medicalCheckup": { "status": "Fit", "dueDate": "2027-07-15", "lastCheckupDate": "2026-07-15", "provider": "Prodia Occupational Health", "examinationType": "AnnualMCU", "followUpRequired": false, "administrativeNote": "Fit for work.", "document": { "fileName": "MCU_Rama_2026.pdf", "fileSize": 524288, "url": "/documents/mcu-rama-2026.pdf" } }, "statusManagement": { "effectiveDate": "2026-08-09", "reason": "StatusCorrection", "lastWorkingDate": null, "notes": "Status corrected." }, "statusHistory": [{ "id": "history-1", "status": "Active", "employmentType": "Permanent", "effectiveDate": "2023-03-12", "reason": null }] }, "messages": [] }`
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
 * Required NIK inside `employee` JSON: `{ "personalInformation": { "ktpNumber": "3171012345670001" } }`.
 * The response includes the updated value at `data.personalInformation.ktpNumber`.
 * Expected response: `{ "success": true, "code": "OK", "data": { "id": "employee-10024", "employeeNumber": "EMP-2023-00128", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "address": "Jakarta, Indonesia", "avatarUrl": "/uploads/employees/employee-10024.webp", "status": "Active", "positionName": "Product Designer", "departmentName": "Product Design", "divisionName": "Design Division", "branchName": "Jakarta HQ", "gradeName": "MC", "joinDate": "2023-03-12", "employmentType": "Permanent", "personalInformation": { "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "phoneNumber": "+62 812-3456-7890", "birthDate": "1992-08-14", "gender": "Male", "maritalStatus": "Married", "nationality": "Indonesia", "address": "Jakarta Selatan 12730", "motherMaidenName": "Sri Wahyuni", "religion": "Islam", "taxStatus": "TK/0", "trainings": ["Design Thinking", "Workplace Safety"] }, "employmentInformation": { "employeeNumber": "EMP-2023-00128", "joinDate": "2023-03-12", "employmentType": "Permanent", "departmentId": "department-product", "departmentName": "Product Design", "divisionId": "division-design", "divisionName": "Design", "positionId": "position-product-designer", "positionName": "Product Designer", "gradeId": "grade-mc", "gradeName": "MC", "branchId": "branch-jakarta", "supervisorId": "employee-10034", "workLocation": "Jakarta Office", "supervisorName": "Dewi Kartika", "baseSalary": "18000000.00", "workTimeType": "JamPenggal" }, "emergencyContact": { "name": "Budi Santoso", "relationship": "Father", "phoneNumber": "+62 813-1111-2222", "address": "Depok, Jawa Barat 16412" }, "financialAndCompliance": { "bankId": "bank-bca", "bankAccountHolder": "Rama Aditya", "bankName": "Bank Central Asia (BCA)", "bankAccountNumber": "123456789012", "npwpNumber": "12.345.678.9-012.000", "npwpStatus": "Active", "bpjsHealthNumber": "0001234567890", "bpjsEmploymentNumber": "190001234567890" }, "medicalCheckup": { "status": "Fit", "dueDate": "2027-07-15", "lastCheckupDate": "2026-07-15" } }, "messages": ["Employee profile updated successfully"] }`
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
 * Expected response: `{ "success": true, "code": "OK", "data": { "stats": { "totalEmployees": 1248, "totalChangePercent": 5.2, "activeEmployees": 1132, "activeChangePercent": 4.6, "onLeaveEmployees": 45, "onLeaveChangePercent": 2.1, "resignedThisMonth": 20, "resignedChangePercent": -11.1 }, "projectDistribution": [{ "projectId": "project-hris", "projectName": "HRIS Implementation", "employeeCount": 312, "percentage": 60, "color": "#2563eb" }, { "projectId": "project-erp", "projectName": "ERP Migration", "employeeCount": 208, "percentage": 40, "color": "#16a34a" }], "filterOptions": { "projects": [{ "value": "project-hris", "label": "HRIS Implementation" }, { "value": "project-erp", "label": "ERP Migration" }], "statuses": ["Active", "OnLeave", "Probation", "Resigned", "Inactive"], "employmentTypes": ["Permanent", "Contract", "Internship", "Freelance"] }, "updatedAt": "2026-10-20T10:00:00+07:00" }, "messages": [] }`
 * Project counts include every current project assignment; an employee assigned to two projects is counted once in each. Percentages use the sum of project counts, not total unique employees.
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
 * Query params: `{ "search": "", "projectId": "project-hris", "status": "Active", "employmentType": "Permanent", "page": 1, "limit": 10 }`. The backend filters by current project membership (including non-primary assignments) and paginates the matching employees; omit `projectId` for all projects.
 * Expected response: `{ "success": true, "code": "OK", "data": { "items": [{ "id": "employee-10024", "employeeNumber": "EMP-2023-0012", "fullName": "Rama Aditya", "email": "rama.aditya@jakarta-hq.com", "avatarUrl": null, "departmentId": "department-product", "departmentName": "Product Design", "positionName": "Product Designer", "status": "Active", "employmentType": "Permanent", "joinDate": "2023-01-14" }], "pagination": { "page": 1, "limit": 10, "totalItems": 312, "totalPages": 32 } }, "messages": [] }`
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
