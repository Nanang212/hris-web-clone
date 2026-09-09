import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createUnit,
  deleteUnit,
  getUnit,
  getUnits,
  updateUnit,
  type CreateUnitInput,
  type DeleteUnitInput,
  type GetUnitInput,
  type GetUnitsInput,
  type UpdateUnitInput,
} from '@/features/company/organization/api'

export const unitQueryKeys = {
  all: ['organization-units'] as const,
  lists: () => [...unitQueryKeys.all, 'list'] as const,
  list: (input?: GetUnitsInput) => [...unitQueryKeys.lists(), input] as const,
  details: () => [...unitQueryKeys.all, 'detail'] as const,
  detail: (unitId: string) => [...unitQueryKeys.details(), unitId] as const,
}

export function useGetUnits(input: GetUnitsInput) {
  return useQuery({
    queryKey: unitQueryKeys.list(input),
    queryFn: () => getUnits(input),
    select: (res) => res.data,
  })
}

export function useGetUnit(input: GetUnitInput) {
  return useQuery({
    queryKey: unitQueryKeys.detail(input.unitId),
    queryFn: () => getUnit(input),
    select: (res) => res.data,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUnitInput) => createUnit(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.all })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUnitInput) => updateUnit(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.detail(input.unitId) })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteUnitInput) => deleteUnit(input),
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: unitQueryKeys.all })
      queryClient.removeQueries({ queryKey: unitQueryKeys.detail(input.unitId) })
    },
  })
}
