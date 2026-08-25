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

export type SessionState = 'Current' | 'Active' | 'Idle'

export interface SessionManagementFilterParams {
  search?: string
  roleId?: string
  branchId?: string
}

export interface SessionManagementStats {
  activeUsers: number
  activeSessions: number
  idleSessions: number
  maxConcurrentSessions: number
}

export interface ActiveSession {
  id: string
  userName: string
  employeeNumber: string
  roleId: string
  roleName: string
  deviceName: string
  operatingSystem: string
  startedAt: string
  lastActivityAt: string
  branchId: string
  branchName: string
  ipAddress: string
  state: SessionState
}

export interface SessionManagementFilterOption {
  id: string
  name: string
}

export interface SessionManagementFilterOptions {
  roles: SessionManagementFilterOption[]
  branches: SessionManagementFilterOption[]
}

export interface SessionTimeoutSettings {
  idleTimeoutMinutes: number
  timeoutWarningMinutes: number
  absoluteSessionLifetimeHours: number
  maxConcurrentSessions: number
  revokeOnPasswordChange: boolean
}

export interface SessionManagementData {
  stats: SessionManagementStats
  sessions: ActiveSession[]
  filterOptions: SessionManagementFilterOptions
  timeoutSettings: SessionTimeoutSettings
  updatedAt: string
}

export interface UpdateSessionTimeoutSettingsPayload {
  idleTimeoutMinutes: number
  timeoutWarningMinutes: number
  absoluteSessionLifetimeHours: number
  maxConcurrentSessions: number
  revokeOnPasswordChange: boolean
}

export interface TerminateSessionData {
  sessionId: string
  completedAt: string
}

export interface LogoutAllSessionsPayload {
  excludeCurrentSession: boolean
}

export interface LogoutAllSessionsData {
  terminatedSessions: number
  completedAt: string
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

export type AuditTrailDateRange = 'Today' | 'Last7Days' | 'Last30Days'

export type AuditTrailResult = 'Success' | 'Failed'

export type AuditTrailSource = 'Web' | 'Mobile' | 'Api'

export interface AuditTrailFilterParams {
  search?: string
  dateRange?: AuditTrailDateRange
  module?: string
  action?: string
  roleId?: string
  branchId?: string
  entityType?: string
  result?: AuditTrailResult
  source?: AuditTrailSource
  device?: string
  correlationId?: string
}

export interface AuditTrailStats {
  eventsToday: number
  dataChanges: number
  approvals: number
  failedActions: number
}

export interface AuditTrailEvent {
  id: string
  occurredAt: string
  actorId: string
  actorName: string
  actorRole: string
  module: string
  action: string
  entityType: string
  entityName: string
  recordId: string
  result: AuditTrailResult
  source: AuditTrailSource
  ipAddress: string
  device: string
  branchName: string
  correlationId: string
}

export interface AuditTrailFilterOption {
  value: string
  name: string
}

export interface AuditTrailFilterOptions {
  modules: AuditTrailFilterOption[]
  actions: AuditTrailFilterOption[]
  roles: AuditTrailFilterOption[]
  branches: AuditTrailFilterOption[]
  entityTypes: AuditTrailFilterOption[]
  results: AuditTrailFilterOption[]
  sources: AuditTrailFilterOption[]
}

export interface AuditTrailData {
  stats: AuditTrailStats
  events: AuditTrailEvent[]
  filterOptions: AuditTrailFilterOptions
  updatedAt: string
}

export interface AuditTrailDetailSummary {
  eventId: string
  occurredAt: string
  actorName: string
  actorRole: string
  module: string
  action: string
  entityName: string
  recordId: string
  source: AuditTrailSource
  ipAddress: string
  correlationId: string
}

export interface AuditTrailDetailContext {
  companyName: string
  branchName: string
  sessionId: string
  device: string
  result: AuditTrailResult
}

export interface AuditTrailRequestMetadata {
  requestSource: string
  requestPath: string
  reason: string
  permissionUsed: string
  dataClassification: string
  immutable: boolean
}

export interface AuditTrailChangeDetail {
  field: string
  beforeValue: string | null
  afterValue: string | null
}

export interface AuditTrailDetailData {
  summary: AuditTrailDetailSummary
  context: AuditTrailDetailContext
  requestMetadata: AuditTrailRequestMetadata
  changes: AuditTrailChangeDetail[]
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

export type DeviceBindingReverificationMode = 'Required' | 'RiskBased' | 'Disabled'

export interface DeviceBindingPolicyConfiguration {
  maximumActiveDevices: number
  changeCooldownHours: number
  requireDeviceChangeApproval: boolean
  blockRootedDevices: boolean
  blockMockLocationDevices: boolean
  autoExpireInactiveBindings: boolean
  inactiveBindingExpiryDays: number
  reverifyAfterOsReset: DeviceBindingReverificationMode
}

export interface DeviceBindingPolicyImpact {
  usersCovered: number
  auditTrailEnabled: boolean
}

export type DeviceBindingExceptionTargetType = 'User' | 'ServiceAccount' | 'KioskDevice'

export interface DeviceBindingException {
  id: string
  targetId: string
  targetName: string
  targetIdentifier: string
  targetType: DeviceBindingExceptionTargetType
  reason: string
  createdBy: string
  createdAt: string
}

export interface DeviceBindingPolicyData {
  policy: DeviceBindingPolicyConfiguration
  impact: DeviceBindingPolicyImpact
  exceptions: DeviceBindingException[]
  updatedAt: string
}

export interface UpdateDeviceBindingPolicyPayload {
  maximumActiveDevices: number
  changeCooldownHours: number
  requireDeviceChangeApproval: boolean
  blockRootedDevices: boolean
  blockMockLocationDevices: boolean
  autoExpireInactiveBindings: boolean
  inactiveBindingExpiryDays: number
  reverifyAfterOsReset: DeviceBindingReverificationMode
}

export interface DeviceBindingExceptionCandidate {
  id: string
  name: string
  identifier: string
  type: DeviceBindingExceptionTargetType
}

export interface DeviceBindingExceptionOptionsData {
  candidates: DeviceBindingExceptionCandidate[]
}

export interface CreateDeviceBindingExceptionPayload {
  targetId: string
  reason: string
}

export interface DeviceBindingExceptionActionData {
  exceptionId: string
  completedAt: string
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
