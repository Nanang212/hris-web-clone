// hooks.ts — React Query hooks for Employment feature

import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployeeDocuments,
  getEmployeeEmploymentInfo,
  getEmployeeLeaveBalance,
  getEmployeePayrollInfo,
  getEmployeePersonalInfo,
  getEmployees,
  getEmployeeStats,
  updateEmployee,
  updateEmployeeEmploymentInfo,
  updateEmployeePersonalInfo,
  getContracts,
  renewContract,
  getMutations,
  createMutation,
  getPromotions,
  createPromotion,
  getResignations,
  createResignation,
} from '@/features/employment/api'
import type {
  CreateEmployeePayload,
  EmployeeFilterParams,
  UpdateEmployeePayload,
  EmployeePersonalInfo,
  EmployeeEmploymentInfo,
  CreateMutationPayload,
  CreatePromotionPayload,
  CreateResignationPayload,
} from '@/features/employment/types'

export const employmentQueryKeys = {
  all: ['employment'] as const,
  stats: () => [...employmentQueryKeys.all, 'stats'] as const,
  list: (params?: EmployeeFilterParams) =>
    [...employmentQueryKeys.all, 'list', params] as const,
  contracts: (search?: string, status?: string) =>
    [...employmentQueryKeys.all, 'contracts', { search, status }] as const,
  detail: (id: string) => [...employmentQueryKeys.all, 'detail', id] as const,
  personal: (id: string) => [...employmentQueryKeys.all, 'personal', id] as const,
  employment: (id: string) => [...employmentQueryKeys.all, 'employment', id] as const,
  documents: (id: string) => [...employmentQueryKeys.all, 'documents', id] as const,
  payroll: (id: string) => [...employmentQueryKeys.all, 'payroll', id] as const,
  leaveBalance: (id: string) => [...employmentQueryKeys.all, 'leaveBalance', id] as const,
}

export function useGetEmployees(params?: EmployeeFilterParams) {
  return useQuery({
    queryKey: employmentQueryKeys.list(params),
    queryFn: () => getEmployees(params),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useGetEmployeeStats() {
  return useQuery({
    queryKey: employmentQueryKeys.stats(),
    queryFn: getEmployeeStats,
    select: ({ data }) => data,
  })
}

export function useGetEmployeeById(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.detail(id),
    queryFn: () => getEmployeeById(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) =>
      updateEmployee(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.list() })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}

export function useGetEmployeePersonalInfo(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.personal(id),
    queryFn: () => getEmployeePersonalInfo(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useUpdateEmployeePersonalInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmployeePersonalInfo> }) =>
      updateEmployeePersonalInfo(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.personal(id) })
    },
  })
}

export function useGetEmployeeEmploymentInfo(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.employment(id),
    queryFn: () => getEmployeeEmploymentInfo(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useUpdateEmployeeEmploymentInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EmployeeEmploymentInfo> }) =>
      updateEmployeeEmploymentInfo(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.employment(id) })
    },
  })
}

export function useGetEmployeeDocuments(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.documents(id),
    queryFn: () => getEmployeeDocuments(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useGetEmployeePayrollInfo(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.payroll(id),
    queryFn: () => getEmployeePayrollInfo(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useGetEmployeeLeaveBalance(id: string) {
  return useQuery({
    queryKey: employmentQueryKeys.leaveBalance(id),
    queryFn: () => getEmployeeLeaveBalance(id),
    select: ({ data }) => data,
    enabled: !!id,
  })
}

export function useGetContracts(search?: string, status?: string) {
  return useQuery({
    queryKey: employmentQueryKeys.contracts(search, status),
    queryFn: () => getContracts(search, status),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useRenewContract() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, startDate, endDate }: { id: string; startDate: string; endDate: string }) =>
      renewContract(id, startDate, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}

export function useGetMutations(search?: string, status?: string) {
  return useQuery({
    queryKey: [...employmentQueryKeys.all, 'mutations', search, status],
    queryFn: () => getMutations(search, status),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useCreateMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMutationPayload) => createMutation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}

export function useGetPromotions(search?: string, status?: string) {
  return useQuery({
    queryKey: [...employmentQueryKeys.all, 'promotions', search, status],
    queryFn: () => getPromotions(search, status),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useCreatePromotion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePromotionPayload) => createPromotion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}

export function useGetResignations(search?: string, status?: string, employeeId?: string) {
  return useQuery({
    queryKey: [...employmentQueryKeys.all, 'resignations', search, status, employeeId],
    queryFn: () => getResignations(search, status, employeeId),
    select: ({ data }) => data,
    placeholderData: keepPreviousData,
  })
}

export function useCreateResignation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateResignationPayload) => createResignation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employmentQueryKeys.all })
    },
  })
}
