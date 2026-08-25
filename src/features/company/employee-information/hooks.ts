import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  archiveEmployeeInformation,
  downloadEmployeeProfile,
  exportEmployeeInformation,
  getEmployeeInformation,
  getEmployeeInformationOverview,
  importEmployeeInformation,
  updateEmployeeInformationStatus,
} from '@/features/company/employee-information/api'
import type {
  EmployeeInformationFilterParams,
  UpdateEmployeeStatusPayload,
} from '@/features/company/employee-information/types'

export const employeeInformationQueryKeys = {
  all: ['company', 'employee-information'] as const,
  overview: () => [...employeeInformationQueryKeys.all, 'overview'] as const,
  list: (params?: EmployeeInformationFilterParams) =>
    [...employeeInformationQueryKeys.all, 'list', params] as const,
}

export function useGetEmployeeInformationOverview() {
  return useQuery({
    queryKey: employeeInformationQueryKeys.overview(),
    queryFn: getEmployeeInformationOverview,
    select: (response) => response.data,
  })
}

export function useGetEmployeeInformation(params?: EmployeeInformationFilterParams) {
  return useQuery({
    queryKey: employeeInformationQueryKeys.list(params),
    queryFn: () => getEmployeeInformation(params),
    select: (response) => response.data,
    placeholderData: keepPreviousData,
  })
}

export function useImportEmployeeInformation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: importEmployeeInformation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
  })
}

export function useExportEmployeeInformation() {
  return useMutation({ mutationFn: exportEmployeeInformation })
}

export function useUpdateEmployeeInformationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeeStatusPayload }) =>
      updateEmployeeInformationStatus(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
  })
}

export function useDownloadEmployeeProfile() {
  return useMutation({ mutationFn: downloadEmployeeProfile })
}

export function useArchiveEmployeeInformation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveEmployeeInformation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
  })
}
