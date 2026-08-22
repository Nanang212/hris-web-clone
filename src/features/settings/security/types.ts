export type SecurityHealthStatus = 'Healthy' | 'Attention' | 'Critical'

export interface SecurityStatusMetric {
  status: SecurityHealthStatus
  criticalAlerts: number
}

export interface LockedAccountMetric {
  count: number
}

export interface RegisteredDeviceMetric {
  count: number
  activeUsers: number
}

export interface AuditEventMetric {
  today: number
  auditedModules: number
}

export interface PasswordPolicySummary {
  configured: boolean
  recoveryMethods: number
}

export interface DeviceSecuritySummary {
  unverifiedDevices: number
  bindingEnabled: boolean
}

export interface SessionManagementSummary {
  activeSessions: number
  timeoutMinutes: number
}

export interface SecurityOverviewData {
  lastUpdated: string
  securityStatus: SecurityStatusMetric
  lockedAccounts: LockedAccountMetric
  registeredDevices: RegisteredDeviceMetric
  auditEvents: AuditEventMetric
  passwordPolicy: PasswordPolicySummary
  deviceSecurity: DeviceSecuritySummary
  sessionManagement: SessionManagementSummary
}

export interface DeviceSecurityCountMetric {
  count: number
}

export interface DeviceBindingPolicyMetric {
  enabled: boolean
  activeBindings: number
}

export interface DeviceSecurityData {
  updatedAt: string
  registeredDevices: RegisteredDeviceMetric
  pendingChanges: DeviceSecurityCountMetric
  blockedDevices: DeviceSecurityCountMetric
  bindingPolicy: DeviceBindingPolicyMetric
}

export type RegisteredDeviceStatus = 'Active' | 'Review' | 'Blocked'

export type RegisteredDeviceTrustLevel = 'High' | 'Medium' | 'Low'

export interface RegisteredDeviceFilterParams {
  search?: string
  status?: RegisteredDeviceStatus
  trustLevel?: RegisteredDeviceTrustLevel
}

export interface RegisteredDevice {
  id: string
  employeeName: string
  employeeNumber: string
  deviceName: string
  deviceId: string
  operatingSystem: string
  registeredAt: string
  lastActiveAt: string
  trustLevel: RegisteredDeviceTrustLevel
  status: RegisteredDeviceStatus
  bindingActive: boolean
  jailbreakDetected: boolean
  registrationSource: string
  approvedBy: string
  officeLocation: string
}

export interface RegisteredDevicesData {
  devices: RegisteredDevice[]
}

export interface RegisteredDeviceActionData {
  deviceId: string
  completedAt: string
}

export type DeviceType = 'Mobile' | 'Tablet' | 'Desktop'

export type DeviceRegistrationMethod =
  'OtpAndDeviceVerification' | 'DeviceVerification' | 'ManualApproval'

export type DeviceBindingStart = 'ImmediatelyAfterVerification' | 'AfterApproval'

export type DeviceVerificationStep =
  'SendOtp' | 'VerifyDeviceIdentifier' | 'RunSecurityChecks' | 'BindDeviceToAccount'

export type DeviceSecurityCheck =
  'RootJailbreakDetection' | 'MockLocationDetection' | 'DeviceIntegrity' | 'ExistingActiveBinding'

export interface DeviceRegistrationEmployeeOption {
  id: string
  name: string
  employeeNumber: string
}

export interface DeviceRegistrationOptionsData {
  employees: DeviceRegistrationEmployeeOption[]
  deviceTypes: DeviceType[]
  registrationMethods: DeviceRegistrationMethod[]
  bindingStarts: DeviceBindingStart[]
  verificationSteps: DeviceVerificationStep[]
  securityChecks: DeviceSecurityCheck[]
}

export interface CreateDeviceRegistrationPayload {
  employeeId: string
  deviceName: string
  deviceType: DeviceType
  operatingSystem: string
  serialNumber?: string
  registrationMethod: DeviceRegistrationMethod
  bindingStart: DeviceBindingStart
  setAsPrimaryDevice: boolean
}

export interface DeviceRegistrationData {
  registrationId: string
  employeeId: string
  status: 'VerificationPending'
  verificationSentAt: string
}

export type DeviceChangeRequestReason =
  'PhoneReplaced' | 'DeviceDamaged' | 'NewCompanyPhone' | 'LostDevice' | 'SecurityIssue'

export type DeviceChangeRequestStatus = 'Pending' | 'Approved' | 'Rejected'

export interface DeviceChangeRequestFilterParams {
  search?: string
  status?: DeviceChangeRequestStatus
  reason?: DeviceChangeRequestReason
}

export interface DeviceChangeRequestDevice {
  name: string
  deviceId: string
  lastActiveAt?: string
  verificationCompleted: boolean
  securityChecksPassed: boolean
}

export interface DeviceChangeRequest {
  id: string
  employeeId: string
  employeeName: string
  currentDevice: DeviceChangeRequestDevice
  requestedDevice: DeviceChangeRequestDevice
  reason: DeviceChangeRequestReason
  reasonNote: string
  requestedAt: string
  status: DeviceChangeRequestStatus
}

export interface DeviceChangeRequestStats {
  pending: number
  approvedToday: number
  rejectedToday: number
  averageReviewMinutes: number
}

export interface DeviceChangeRequestsData {
  stats: DeviceChangeRequestStats
  requests: DeviceChangeRequest[]
}

export interface DeviceChangeRequestActionData {
  requestId: string
  status: 'Approved' | 'Rejected'
  completedAt: string
}

export type PasswordRecoveryOption = 'EmailResetLink' | 'TemporaryPassword'

export interface PasswordPolicyConfiguration {
  minimumLength: number
  passwordExpiryDays: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
  preventPasswordReuse: boolean
  forceChangeAfterHrReset: boolean
  lockoutThreshold: number
  lockoutDurationMinutes: number
}

export interface AccountSecurityData {
  lockedAccounts: number
}

export interface PasswordRecoveryData {
  enabled: boolean
  options: PasswordRecoveryOption[]
}

export interface PasswordPolicyData {
  policy: PasswordPolicyConfiguration
  accountSecurity: AccountSecurityData
  passwordRecovery: PasswordRecoveryData
  updatedAt: string
}

export interface UpdatePasswordPolicyPayload {
  minimumLength: number
  passwordExpiryDays: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
  preventPasswordReuse: boolean
  forceChangeAfterHrReset: boolean
  lockoutThreshold: number
  lockoutDurationMinutes: number
}

export type LockedAccountReason = 'FailedAttempts' | 'SuspiciousActivity' | 'ManualLock'

export interface LockedAccountFilterParams {
  employeeName?: string
  departmentId?: string
  reason?: LockedAccountReason
}

export interface LockedAccountsStats {
  lockedNow: number
  autoUnlockToday: number
  manualReview: number
  unlockedToday: number
}

export interface LockedAccount {
  id: string
  employeeName: string
  employeeNumber: string
  departmentId: string
  departmentName: string
  failedAttempts: number
  lockedSince: string
  lastIpAddress: string
  reason: LockedAccountReason
  lastDevice: string
  location: string
}

export interface LockedAccountsData {
  accounts: LockedAccount[]
}

export interface LockedAccountDepartmentOption {
  id: string
  name: string
}

export interface LockedAccountReasonOption {
  value: LockedAccountReason
  name: string
}

export interface LockedAccountOptionsData {
  departments: LockedAccountDepartmentOption[]
  reasons: LockedAccountReasonOption[]
}

export interface LockedAccountActionData {
  accountId: string
  completedAt: string
}
