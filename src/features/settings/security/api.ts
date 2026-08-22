import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'
import type {
  CreateDeviceRegistrationPayload,
  DeviceChangeRequestActionData,
  DeviceChangeRequestFilterParams,
  DeviceChangeRequestsData,
  DeviceRegistrationData,
  DeviceRegistrationOptionsData,
  DeviceSecurityData,
  LockedAccountActionData,
  LockedAccountFilterParams,
  LockedAccountOptionsData,
  LockedAccountsData,
  LockedAccountsStats,
  PasswordPolicyData,
  RegisteredDeviceActionData,
  RegisteredDeviceFilterParams,
  RegisteredDevicesData,
  SecurityOverviewData,
  UpdatePasswordPolicyPayload,
} from '@/features/settings/security/types'

/**
 * Endpoint: `/api/v1/security/overview`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "lastUpdated": "2026-08-22T10:30:00+07:00", "securityStatus": { "status": "Healthy", "criticalAlerts": 0 }, "lockedAccounts": { "count": 3 }, "registeredDevices": { "count": 3406, "activeUsers": 2841 }, "auditEvents": { "today": 1842, "auditedModules": 12 }, "passwordPolicy": { "configured": true, "recoveryMethods": 2 }, "deviceSecurity": { "unverifiedDevices": 14, "bindingEnabled": true }, "sessionManagement": { "activeSessions": 1287, "timeoutMinutes": 30 } }, "messages": [] }`
 */
export async function getSecurityOverview() {
  const res = await apiClient.get<Envelope<SecurityOverviewData>>('/api/v1/security/overview')
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-security`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "updatedAt": "2026-08-22T13:00:00+07:00", "registeredDevices": { "count": 3406, "activeUsers": 2841 }, "pendingChanges": { "count": 12 }, "blockedDevices": { "count": 7 }, "bindingPolicy": { "enabled": true, "activeBindings": 1 } }, "messages": [] }`
 */
export async function getDeviceSecurity() {
  const res = await apiClient.get<Envelope<DeviceSecurityData>>('/api/v1/security/device-security')
  return res.data
}

/**
 * Endpoint: `/api/v1/security/registered-devices`
 * Method: `GET`
 * Query params: `{ "search": "Rama", "status": "Active", "trustLevel": "High" }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "devices": [{ "id": "device-0018", "employeeName": "Rama Aditya", "employeeNumber": "10024", "deviceName": "iPhone 15 Pro", "deviceId": "DV-0018", "operatingSystem": "iOS 18", "registeredAt": "2026-08-01T09:00:00+07:00", "lastActiveAt": "2026-08-22T00:12:00+07:00", "trustLevel": "High", "status": "Active", "bindingActive": true, "jailbreakDetected": false, "registrationSource": "Employee verification", "approvedBy": "HR", "officeLocation": "Jakarta HQ" }] }, "messages": [] }`
 */
export async function getRegisteredDevices(params?: RegisteredDeviceFilterParams) {
  const res = await apiClient.get<Envelope<RegisteredDevicesData>>(
    '/api/v1/security/registered-devices',
    { params },
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/registered-devices/:id/reset-binding`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "deviceId": "device-0018", "completedAt": "2026-08-22T14:00:00+07:00" }, "messages": ["Device binding reset successfully"] }`
 */
export async function resetRegisteredDeviceBinding(id: string) {
  const res = await apiClient.post<Envelope<RegisteredDeviceActionData>>(
    `/api/v1/security/registered-devices/${id}/reset-binding`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/registered-devices/:id/block`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "deviceId": "device-0018", "completedAt": "2026-08-22T14:05:00+07:00" }, "messages": ["Device blocked successfully"] }`
 */
export async function blockRegisteredDevice(id: string) {
  const res = await apiClient.post<Envelope<RegisteredDeviceActionData>>(
    `/api/v1/security/registered-devices/${id}/block`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-registrations/options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "employees": [{ "id": "employee-10024", "name": "Rama Aditya", "employeeNumber": "10024" }], "deviceTypes": ["Mobile", "Tablet", "Desktop"], "registrationMethods": ["OtpAndDeviceVerification", "DeviceVerification", "ManualApproval"], "bindingStarts": ["ImmediatelyAfterVerification", "AfterApproval"], "verificationSteps": ["SendOtp", "VerifyDeviceIdentifier", "RunSecurityChecks", "BindDeviceToAccount"], "securityChecks": ["RootJailbreakDetection", "MockLocationDetection", "DeviceIntegrity", "ExistingActiveBinding"] }, "messages": [] }`
 */
export async function getDeviceRegistrationOptions() {
  const res = await apiClient.get<Envelope<DeviceRegistrationOptionsData>>(
    '/api/v1/security/device-registrations/options',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-registrations`
 * Method: `POST`
 * Request body: `{ "employeeId": "employee-10024", "deviceName": "iPhone 15 Pro", "deviceType": "Mobile", "operatingSystem": "iOS 18", "serialNumber": "356789102345678", "registrationMethod": "OtpAndDeviceVerification", "bindingStart": "ImmediatelyAfterVerification", "setAsPrimaryDevice": true }`
 * Expected response: `{ "success": true, "code": "CREATED", "data": { "registrationId": "registration-001", "employeeId": "employee-10024", "status": "VerificationPending", "verificationSentAt": "2026-08-22T14:30:00+07:00" }, "messages": ["Device verification sent successfully"] }`
 */
export async function createDeviceRegistration(payload: CreateDeviceRegistrationPayload) {
  const res = await apiClient.post<Envelope<DeviceRegistrationData>>(
    '/api/v1/security/device-registrations',
    payload,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-change-requests`
 * Method: `GET`
 * Query params: `{ "search": "Rama", "status": "Pending", "reason": "PhoneReplaced" }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "stats": { "pending": 12, "approvedToday": 8, "rejectedToday": 1, "averageReviewMinutes": 18 }, "requests": [{ "id": "change-request-001", "employeeId": "employee-10024", "employeeName": "Rama Aditya", "currentDevice": { "name": "iPhone 13", "deviceId": "DV-0007", "lastActiveAt": "2026-08-22T00:03:00+07:00", "verificationCompleted": true, "securityChecksPassed": true }, "requestedDevice": { "name": "iPhone 15 Pro", "deviceId": "DV-NEW-001", "verificationCompleted": true, "securityChecksPassed": true }, "reason": "PhoneReplaced", "reasonNote": "Replaced by company. Old device will be unbound after approval.", "requestedAt": "2026-08-22T13:50:00+07:00", "status": "Pending" }] }, "messages": [] }`
 */
export async function getDeviceChangeRequests(params?: DeviceChangeRequestFilterParams) {
  const res = await apiClient.get<Envelope<DeviceChangeRequestsData>>(
    '/api/v1/security/device-change-requests',
    { params },
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-change-requests/:id/approve`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "requestId": "change-request-001", "status": "Approved", "completedAt": "2026-08-22T14:20:00+07:00" }, "messages": ["Device change request approved successfully"] }`
 */
export async function approveDeviceChangeRequest(id: string) {
  const res = await apiClient.post<Envelope<DeviceChangeRequestActionData>>(
    `/api/v1/security/device-change-requests/${id}/approve`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/device-change-requests/:id/reject`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "requestId": "change-request-001", "status": "Rejected", "completedAt": "2026-08-22T14:22:00+07:00" }, "messages": ["Device change request rejected successfully"] }`
 */
export async function rejectDeviceChangeRequest(id: string) {
  const res = await apiClient.post<Envelope<DeviceChangeRequestActionData>>(
    `/api/v1/security/device-change-requests/${id}/reject`,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/password-policy`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "policy": { "minimumLength": 12, "passwordExpiryDays": 90, "requireUppercase": true, "requireLowercase": true, "requireNumber": true, "requireSymbol": true, "preventPasswordReuse": true, "forceChangeAfterHrReset": true, "lockoutThreshold": 5, "lockoutDurationMinutes": 30 }, "accountSecurity": { "lockedAccounts": 3 }, "passwordRecovery": { "enabled": true, "options": ["EmailResetLink", "TemporaryPassword"] }, "updatedAt": "2026-08-22T10:30:00+07:00" }, "messages": [] }`
 */
export async function getPasswordPolicy() {
  const res = await apiClient.get<Envelope<PasswordPolicyData>>('/api/v1/security/password-policy')
  return res.data
}

/**
 * Endpoint: `/api/v1/security/password-policy`
 * Method: `PUT`
 * Request body: `{ "minimumLength": 12, "passwordExpiryDays": 90, "requireUppercase": true, "requireLowercase": true, "requireNumber": true, "requireSymbol": true, "preventPasswordReuse": true, "forceChangeAfterHrReset": true, "lockoutThreshold": 5, "lockoutDurationMinutes": 30 }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "policy": { "minimumLength": 12, "passwordExpiryDays": 90, "requireUppercase": true, "requireLowercase": true, "requireNumber": true, "requireSymbol": true, "preventPasswordReuse": true, "forceChangeAfterHrReset": true, "lockoutThreshold": 5, "lockoutDurationMinutes": 30 }, "accountSecurity": { "lockedAccounts": 3 }, "passwordRecovery": { "enabled": true, "options": ["EmailResetLink", "TemporaryPassword"] }, "updatedAt": "2026-08-22T11:00:00+07:00" }, "messages": ["Password policy updated successfully"] }`
 */
export async function updatePasswordPolicy(payload: UpdatePasswordPolicyPayload) {
  const res = await apiClient.put<Envelope<PasswordPolicyData>>(
    '/api/v1/security/password-policy',
    payload,
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/locked-accounts/stats`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "lockedNow": 3, "autoUnlockToday": 2, "manualReview": 1, "unlockedToday": 7 }, "messages": [] }`
 */
export async function getLockedAccountsStats() {
  const res = await apiClient.get<Envelope<LockedAccountsStats>>(
    '/api/v1/security/locked-accounts/stats',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/locked-accounts/options`
 * Method: `GET`
 * Expected response: `{ "success": true, "code": "OK", "data": { "departments": [{ "id": "department-hr", "name": "HR" }, { "id": "department-finance", "name": "Finance" }], "reasons": [{ "value": "FailedAttempts", "name": "Failed login attempts" }, { "value": "SuspiciousActivity", "name": "Suspicious activity" }, { "value": "ManualLock", "name": "Manual lock" }] }, "messages": [] }`
 */
export async function getLockedAccountOptions() {
  const res = await apiClient.get<Envelope<LockedAccountOptionsData>>(
    '/api/v1/security/locked-accounts/options',
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/locked-accounts`
 * Method: `GET`
 * Query params: `{ "employeeName": "Dewi", "departmentId": "department-finance", "reason": "FailedAttempts" }`
 * Expected response: `{ "success": true, "code": "OK", "data": { "accounts": [{ "id": "user-10034", "employeeName": "Dewi Kartika", "employeeNumber": "10034", "departmentId": "department-finance", "departmentName": "Finance", "failedAttempts": 7, "lockedSince": "2026-08-21T23:54:00+07:00", "lastIpAddress": "10.10.18.4", "reason": "FailedAttempts", "lastDevice": "Chrome / Windows", "location": "Jakarta HQ" }] }, "messages": [] }`
 */
export async function getLockedAccounts(params?: LockedAccountFilterParams) {
  const res = await apiClient.get<Envelope<LockedAccountsData>>(
    '/api/v1/security/locked-accounts',
    {
      params,
    },
  )
  return res.data
}

/**
 * Endpoint: `/api/v1/security/locked-accounts/:id/unlock`
 * Method: `POST`
 * Expected response: `{ "success": true, "code": "OK", "data": { "accountId": "user-10034", "completedAt": "2026-08-22T12:00:00+07:00" }, "messages": ["Account unlocked successfully"] }`
 */
export async function unlockLockedAccount(id: string) {
  const res = await apiClient.post<Envelope<LockedAccountActionData>>(
    `/api/v1/security/locked-accounts/${id}/unlock`,
  )
  return res.data
}
