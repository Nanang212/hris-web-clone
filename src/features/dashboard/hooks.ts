import { useQuery } from '@tanstack/react-query'

import {
  getEmployeeDashboardData,
  getExecutiveDashboardData,
  getHrDashboardData,
  getManagerDashboardData,
} from '@/features/dashboard/api'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  employee: () => [...dashboardQueryKeys.all, 'employee'] as const,
  hr: () => [...dashboardQueryKeys.all, 'hr'] as const,
  manager: () => [...dashboardQueryKeys.all, 'manager'] as const,
  executive: () => [...dashboardQueryKeys.all, 'executive'] as const,
}

export function useGetEmployeeDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.employee(),
    queryFn: getEmployeeDashboardData,
    select: ({ data }) => data,
  })
}

export function useGetHrDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.hr(),
    queryFn: getHrDashboardData,
    select: ({ data }) => data,
  })
}

export function useGetManagerDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.manager(),
    queryFn: getManagerDashboardData,
    select: ({ data }) => data,
  })
}

export function useGetExecutiveDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.executive(),
    queryFn: getExecutiveDashboardData,
    select: ({ data }) => data,
  })
}
