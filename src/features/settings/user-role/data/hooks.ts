import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  getRoleStats,
  updateRole,
} from '@/features/settings/user-role/data/api'
import type {
  CreateRolePayload,
  RoleFilterParams,
  UpdateRolePayload,
} from '@/features/settings/user-role/data/types'

export const userRoleQueryKeys = {
  all: ['user-roles'] as const,
  stats: () => [...userRoleQueryKeys.all, 'stats'] as const,
  list: (params?: RoleFilterParams) => [...userRoleQueryKeys.all, 'list', params] as const,
  detail: (id: string) => [...userRoleQueryKeys.all, 'detail', id] as const,
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
