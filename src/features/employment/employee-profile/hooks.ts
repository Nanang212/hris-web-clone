import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  archiveEmployeeInformation,
  createEmployeeProfile,
  downloadEmployeeProfile,
  exportEmployeeInformation,
  getEmployeeCreationOptions,
  getEmployeeInformation,
  getEmployeeInformationDetail,
  getEmployeeInformationOverview,
  importEmployeeInformation,
  requestEmployeeBankVerification,
  updateEmployeeInformation,
  updateEmployeeInformationStatus,
  rejoinEmployee,
  getEmployeeEmploymentPeriods,
  uploadEmployeeEmploymentDocument,
  createEmployeeEmploymentScreening,
} from '@/features/employment/employee-profile/api'
import type {
  CreateEmployeeProfileInput,
  EmployeeInformationFilterParams,
  UpdateEmployeeInformationRequest,
  UpdateEmployeeStatusPayload,
} from '@/features/employment/employee-profile/types'
import type { EmployeeRejoinInput, UploadEmployeeEmploymentDocumentInput, CreateEmployeeEmploymentScreeningInput } from '@/features/employment/employee-profile/api'

export function useUploadEmployeeEmploymentDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, periodId, input, requestId }: { employeeId: string; periodId: string; input: UploadEmployeeEmploymentDocumentInput; requestId: string }) => uploadEmployeeEmploymentDocument(employeeId, periodId, input, requestId),
    onSuccess: (_response, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.detail(employeeId) }),
  })
}

export function useCreateEmployeeEmploymentScreening() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, periodId, input, requestId }: { employeeId: string; periodId: string; input: CreateEmployeeEmploymentScreeningInput; requestId: string }) => createEmployeeEmploymentScreening(employeeId, periodId, input, requestId),
    onSuccess: (_response, { employeeId }) => queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.detail(employeeId) }),
  })
}

export function useRejoinEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ employeeId, input, requestId }: { employeeId: string; input: EmployeeRejoinInput; requestId: string }) => rejoinEmployee(employeeId, input, requestId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all }),
  })
}

export function useGetEmployeeEmploymentPeriods(employeeId: string) {
  return useQuery({
    queryKey: [...employeeInformationQueryKeys.detail(employeeId), 'employment-periods'],
    queryFn: () => getEmployeeEmploymentPeriods(employeeId),
    select: (response) => response.data,
    enabled: Boolean(employeeId),
  })
}

export const employeeInformationQueryKeys = {
  all: ['company', 'employee-information'] as const,
  overview: () => [...employeeInformationQueryKeys.all, 'overview'] as const,
  createOptions: () => [...employeeInformationQueryKeys.all, 'create-options'] as const,
  detail: (employeeId: string) =>
    [...employeeInformationQueryKeys.all, 'detail', employeeId] as const,
  list: (params?: EmployeeInformationFilterParams) =>
    [...employeeInformationQueryKeys.all, 'list', params] as const,
}

export function useGetEmployeeCreationOptions() {
  return useQuery({
    queryKey: employeeInformationQueryKeys.createOptions(),
    queryFn: getEmployeeCreationOptions,
    select: (response) => ({
      ...response.data,
      departments: response.data.departments ?? [],
      divisions: response.data.divisions ?? [],
      positions: response.data.positions ?? [],
      grades: response.data.grades ?? [],
      branches: response.data.branches ?? [],
      managers: response.data.managers ?? [],
      banks: response.data.banks ?? [],
      genders: response.data.genders ?? [],
      employmentTypes: response.data.employmentTypes ?? [],
    }),
  })
}

export function useCreateEmployeeInformation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateEmployeeProfileInput) => createEmployeeProfile(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
  })
}

export function useGetEmployeeInformationOverview() {
  return useQuery({
    queryKey: employeeInformationQueryKeys.overview(),
    queryFn: getEmployeeInformationOverview,
    select: (response) => response.data,
  })
}

export function useGetEmployeeInformationDetail(employeeId: string) {
  return useQuery({
    queryKey: employeeInformationQueryKeys.detail(employeeId),
    queryFn: () => getEmployeeInformationDetail(employeeId),
    select: (response) => response.data,
    enabled: Boolean(employeeId),
  })
}

export function useUpdateEmployeeInformation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateEmployeeInformationRequest) => updateEmployeeInformation(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
  })
}

export function useRequestEmployeeBankVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestEmployeeBankVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeInformationQueryKeys.all })
    },
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
