import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  assignRoleUsers,
  createRole,
  deleteRole,
  getRoleAssignments,
  getRoleById,
  getRoleEligibilityOptions,
  getRolePermissions,
  getRoles,
  getRoleStats,
  removeAllRoleUsers,
  removeRoleUser,
  updateRole,
  updateRolePermissions,
} from '@/features/settings/role-access/api'
import type {
  AssignRoleUsersPayload,
  CreateRolePayload,
  RoleFilterParams,
  UpdateRolePayload,
  UpdateRolePermissionsPayload,
} from '@/features/settings/role-access/types'

export const roleAccessQueryKeys = {
  all: ['role-access'] as const,
  stats: () => [...roleAccessQueryKeys.all, 'stats'] as const,
  list: (params?: RoleFilterParams) => [...roleAccessQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...roleAccessQueryKeys.all, 'detail', id] as const,
  permissions: (id: string) => [...roleAccessQueryKeys.all, 'permissions', id] as const,
  assignments: (id: string) => [...roleAccessQueryKeys.all, 'assignments', id] as const,
  eligibilityOptions: () => [...roleAccessQueryKeys.all, 'eligibility-options'] as const,
}

export function useGetRoleStats() {
  return useQuery({
    queryKey: roleAccessQueryKeys.stats(),
    queryFn: getRoleStats,
    select: (response) => response.data,
  })
}

export function useGetRoles(params?: RoleFilterParams) {
  return useQuery({
    queryKey: roleAccessQueryKeys.list(params),
    queryFn: () => getRoles(params),
    select: (response) => response.data,
  })
}

export function useGetRole(id: string) {
  return useQuery({
    queryKey: roleAccessQueryKeys.detail(id),
    queryFn: () => getRoleById(id),
    select: (response) => response.data,
    enabled: Boolean(id),
  })
}

export function useGetRolePermissions(id: string) {
  return useQuery({
    queryKey: roleAccessQueryKeys.permissions(id),
    queryFn: () => getRolePermissions(id),
    select: (response) => response.data,
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  })
}

export function useGetRoleAssignments(id: string) {
  return useQuery({
    queryKey: roleAccessQueryKeys.assignments(id),
    queryFn: () => getRoleAssignments(id),
    select: (response) => response.data,
    enabled: Boolean(id),
  })
}

export function useGetRoleEligibilityOptions() {
  return useQuery({
    queryKey: roleAccessQueryKeys.eligibilityOptions(),
    queryFn: getRoleEligibilityOptions,
    select: (response) => response.data,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.detail(variables.id) })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePermissionsPayload }) =>
      updateRolePermissions(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.permissions(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}

export function useAssignRoleUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignRoleUsersPayload }) =>
      assignRoleUsers(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.assignments(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}

export function useRemoveRoleUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => removeRoleUser(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.assignments(variables.id) })
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}

export function useRemoveAllRoleUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => removeAllRoleUsers(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.assignments(id) })
      queryClient.invalidateQueries({ queryKey: roleAccessQueryKeys.all })
    },
  })
}
