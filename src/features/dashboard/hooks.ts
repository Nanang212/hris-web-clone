import { useQuery } from '@tanstack/react-query'

import {
  getEmployeeDashboardData,
  getExecutiveDashboardData,
  getHrDashboardData,
  getManagerDashboardData,
} from '@/features/dashboard/api'

export const useGetEmployeeDashboard = () =>
  useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: getEmployeeDashboardData,
    select: ({ data }) => data,
  })

export const useGetHrDashboard = () =>
  useQuery({
    queryKey: ['hr-dashboard'],
    queryFn: getHrDashboardData,
    select: ({ data }) => data,
  })

export const useGetManagerDashboard = () =>
  useQuery({
    queryKey: ['manager-dashboard'],
    queryFn: getManagerDashboardData,
    select: ({ data }) => data,
  })

export const useGetExecutiveDashboard = () =>
  useQuery({
    queryKey: ['executive-dashboard'],
    queryFn: getExecutiveDashboardData,
    select: ({ data }) => data,
  })
