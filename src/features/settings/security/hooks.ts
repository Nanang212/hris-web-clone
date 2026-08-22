import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveDeviceChangeRequest,
  blockRegisteredDevice,
  createDeviceRegistration,
  getDeviceChangeRequests,
  getDeviceRegistrationOptions,
  getDeviceSecurity,
  getLockedAccountOptions,
  getLockedAccounts,
  getLockedAccountsStats,
  getPasswordPolicy,
  getRegisteredDevices,
  getSecurityOverview,
  rejectDeviceChangeRequest,
  resetRegisteredDeviceBinding,
  unlockLockedAccount,
  updatePasswordPolicy,
} from '@/features/settings/security/api'
import type {
  CreateDeviceRegistrationPayload,
  DeviceChangeRequestFilterParams,
  LockedAccountFilterParams,
  RegisteredDeviceFilterParams,
  UpdatePasswordPolicyPayload,
} from '@/features/settings/security/types'

export const securityQueryKeys = {
  all: ['security'] as const,
  overview: () => [...securityQueryKeys.all, 'overview'] as const,
  deviceSecurity: () => [...securityQueryKeys.all, 'device-security'] as const,
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

export function useGetDeviceSecurity() {
  return useQuery({
    queryKey: securityQueryKeys.deviceSecurity(),
    queryFn: getDeviceSecurity,
    select: (response) => response.data,
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
