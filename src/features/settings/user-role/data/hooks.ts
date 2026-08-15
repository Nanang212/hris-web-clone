import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

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
} from '@/features/settings/user-role/data/api'
import type {
  AssignRoleUsersPayload,
  CreateRolePayload,
  RoleFilterParams,
  UpdateRolePayload,
  UpdateRolePermissionsPayload,
} from '@/features/settings/user-role/data/types'

export const userRoleQueryKeys = {
  all: ['user-roles'] as const,
  stats: () => [...userRoleQueryKeys.all, 'stats'] as const,
  list: (params?: RoleFilterParams) => [...userRoleQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...userRoleQueryKeys.all, 'detail', id] as const,
  permissions: (id: string) => [...userRoleQueryKeys.all, 'permissions', id] as const,
  assignments: (id: string) => [...userRoleQueryKeys.all, 'assignments', id] as const,
  eligibilityOptions: () => [...userRoleQueryKeys.all, 'eligibility-options'] as const,
}

export function useRoleStats() {
  return useQuery({
    queryKey: userRoleQueryKeys.stats(),
    queryFn: getRoleStats,
  })
}

export function useRoles(params?: RoleFilterParams) {
  return useQuery({
    queryKey: userRoleQueryKeys.list(params),
    queryFn: () => getRoles(params),
  })
}

export function useRole(id: string) {
  return useQuery({
    queryKey: userRoleQueryKeys.detail(id),
    queryFn: () => getRoleById(id),
    enabled: Boolean(id),
  })
}

export function useRolePermissions(id: string) {
  return useQuery({
    queryKey: userRoleQueryKeys.permissions(id),
    queryFn: () => getRolePermissions(id),
    enabled: Boolean(id),
  })
}

export function useRoleAssignments(id: string) {
  return useQuery({
    queryKey: userRoleQueryKeys.assignments(id),
    queryFn: () => getRoleAssignments(id),
    enabled: Boolean(id),
  })
}

export function useRoleEligibilityOptions() {
  return useQuery({
    queryKey: userRoleQueryKeys.eligibilityOptions(),
    queryFn: getRoleEligibilityOptions,
  })
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      updateRole(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.detail(variables.id) })
    },
  })
}

export function useDeleteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePermissionsPayload }) =>
      updateRolePermissions(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.permissions(variables.id) })
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}

export function useAssignRoleUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignRoleUsersPayload }) =>
      assignRoleUsers(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.assignments(variables.id) })
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}

export function useRemoveRoleUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => removeRoleUser(id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.assignments(variables.id) })
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}

export function useRemoveAllRoleUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => removeAllRoleUsers(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.assignments(id) })
      queryClient.invalidateQueries({ queryKey: userRoleQueryKeys.all })
    },
  })
}
