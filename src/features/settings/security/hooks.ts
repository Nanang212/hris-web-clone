import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveDeviceChangeRequest,
  blockRegisteredDevice,
  createDeviceBindingException,
  createDeviceRegistration,
  deleteDeviceBindingException,
  exportAuditTrail,
  getAuditTrail,
  getAuditTrailDetail,
  getDeviceBindingExceptionOptions,
  getDeviceBindingPolicy,
  getDeviceChangeRequests,
  getDeviceRegistrationOptions,
  getDeviceSecurity,
  getLockedAccountOptions,
  getLockedAccounts,
  getLockedAccountsStats,
  getPasswordPolicy,
  getRegisteredDevices,
  getSecurityOverview,
  getSessionManagement,
  logoutAllSessions,
  rejectDeviceChangeRequest,
  resetRegisteredDeviceBinding,
  terminateSession,
  unlockLockedAccount,
  updateDeviceBindingPolicy,
  updatePasswordPolicy,
  updateSessionTimeoutSettings,
} from '@/features/settings/security/api'
import type {
  AuditTrailFilterParams,
  CreateDeviceBindingExceptionPayload,
  CreateDeviceRegistrationPayload,
  DeviceChangeRequestFilterParams,
  LockedAccountFilterParams,
  LogoutAllSessionsPayload,
  RegisteredDeviceFilterParams,
  SessionManagementFilterParams,
  UpdateDeviceBindingPolicyPayload,
  UpdatePasswordPolicyPayload,
  UpdateSessionTimeoutSettingsPayload,
} from '@/features/settings/security/types'

export const securityQueryKeys = {
  all: ['security'] as const,
  overview: () => [...securityQueryKeys.all, 'overview'] as const,
  auditTrail: (params?: AuditTrailFilterParams) =>
    [...securityQueryKeys.all, 'audit-trail', params] as const,
  auditTrailDetail: (id?: string) =>
    [...securityQueryKeys.all, 'audit-trail', 'detail', id] as const,
  sessionManagement: (params?: SessionManagementFilterParams) =>
    [...securityQueryKeys.all, 'sessions', params] as const,
  deviceSecurity: () => [...securityQueryKeys.all, 'device-security'] as const,
  deviceBindingPolicy: () => [...securityQueryKeys.all, 'device-binding-policy'] as const,
  deviceBindingExceptionOptions: () =>
    [...securityQueryKeys.all, 'device-binding-policy', 'exception-options'] as const,
  deviceRegistrationOptions: () =>
    [...securityQueryKeys.all, 'device-registrations', 'options'] as const,
  deviceChangeRequests: (params?: DeviceChangeRequestFilterParams) =>
    [...securityQueryKeys.all, 'device-change-requests', params] as const,
  registeredDevices: (params?: RegisteredDeviceFilterParams) =>
    [...securityQueryKeys.all, 'registered-devices', params] as const,
  passwordPolicy: () => [...securityQueryKeys.all, 'password-policy'] as const,
  lockedAccountStats: () => [...securityQueryKeys.all, 'locked-accounts', 'stats'] as const,
  lockedAccountOptions: () => [...securityQueryKeys.all, 'locked-accounts', 'options'] as const,
  lockedAccounts: (params?: LockedAccountFilterParams) =>
    [...securityQueryKeys.all, 'locked-accounts', 'list', params] as const,
}

export function useGetSecurityOverview() {
  return useQuery({
    queryKey: securityQueryKeys.overview(),
    queryFn: getSecurityOverview,
    select: (response) => response.data,
  })
}

export function useGetAuditTrail(params?: AuditTrailFilterParams) {
  return useQuery({
    queryKey: securityQueryKeys.auditTrail(params),
    queryFn: () => getAuditTrail(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useGetAuditTrailDetail(id?: string) {
  return useQuery({
    queryKey: securityQueryKeys.auditTrailDetail(id),
    queryFn: () => getAuditTrailDetail(id ?? ''),
    select: (response) => response.data,
    enabled: Boolean(id),
  })
}

export function useExportAuditTrail() {
  return useMutation({
    mutationFn: (params?: AuditTrailFilterParams) => exportAuditTrail(params),
  })
}

export function useGetSessionManagement(params?: SessionManagementFilterParams) {
  return useQuery({
    queryKey: securityQueryKeys.sessionManagement(params),
    queryFn: () => getSessionManagement(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useTerminateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => terminateSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LogoutAllSessionsPayload) => logoutAllSessions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useUpdateSessionTimeoutSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSessionTimeoutSettingsPayload) =>
      updateSessionTimeoutSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetDeviceSecurity() {
  return useQuery({
    queryKey: securityQueryKeys.deviceSecurity(),
    queryFn: getDeviceSecurity,
    select: (response) => response.data,
  })
}

export function useGetDeviceBindingPolicy() {
  return useQuery({
    queryKey: securityQueryKeys.deviceBindingPolicy(),
    queryFn: getDeviceBindingPolicy,
    select: (response) => response.data,
  })
}

export function useUpdateDeviceBindingPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateDeviceBindingPolicyPayload) => updateDeviceBindingPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetDeviceBindingExceptionOptions(enabled = true) {
  return useQuery({
    queryKey: securityQueryKeys.deviceBindingExceptionOptions(),
    queryFn: getDeviceBindingExceptionOptions,
    select: (response) => response.data,
    enabled,
  })
}

export function useCreateDeviceBindingException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDeviceBindingExceptionPayload) =>
      createDeviceBindingException(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useDeleteDeviceBindingException() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDeviceBindingException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetDeviceRegistrationOptions() {
  return useQuery({
    queryKey: securityQueryKeys.deviceRegistrationOptions(),
    queryFn: getDeviceRegistrationOptions,
    select: (response) => response.data,
  })
}

export function useCreateDeviceRegistration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDeviceRegistrationPayload) => createDeviceRegistration(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetDeviceChangeRequests(params?: DeviceChangeRequestFilterParams) {
  return useQuery({
    queryKey: securityQueryKeys.deviceChangeRequests(params),
    queryFn: () => getDeviceChangeRequests(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useApproveDeviceChangeRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveDeviceChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useRejectDeviceChangeRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => rejectDeviceChangeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetRegisteredDevices(params?: RegisteredDeviceFilterParams) {
  return useQuery({
    queryKey: securityQueryKeys.registeredDevices(params),
    queryFn: () => getRegisteredDevices(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useResetRegisteredDeviceBinding() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resetRegisteredDeviceBinding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useBlockRegisteredDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => blockRegisteredDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetPasswordPolicy() {
  return useQuery({
    queryKey: securityQueryKeys.passwordPolicy(),
    queryFn: getPasswordPolicy,
    select: (response) => response.data,
  })
}

export function useUpdatePasswordPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdatePasswordPolicyPayload) => updatePasswordPolicy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}

export function useGetLockedAccountsStats() {
  return useQuery({
    queryKey: securityQueryKeys.lockedAccountStats(),
    queryFn: getLockedAccountsStats,
    select: (response) => response.data,
  })
}

export function useGetLockedAccountOptions() {
  return useQuery({
    queryKey: securityQueryKeys.lockedAccountOptions(),
    queryFn: getLockedAccountOptions,
    select: (response) => response.data,
  })
}

export function useGetLockedAccounts(params?: LockedAccountFilterParams) {
  return useQuery({
    queryKey: securityQueryKeys.lockedAccounts(params),
    queryFn: () => getLockedAccounts(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useUnlockLockedAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unlockLockedAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityQueryKeys.all })
    },
  })
}
