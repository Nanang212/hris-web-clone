import type {
  EmployeeDashboardData,
  ExecutiveDashboardData,
  HRDashboardData,
  ManagerDashboardData,
} from '@/features/dashboard/types'
import { apiClient } from '@/shared/lib/axios'
import type { Envelope } from '@/shared/types'

export const getEmployeeDashboardData = async () => {
  const res = await apiClient.get<Envelope<EmployeeDashboardData>>('/api/v1/dashboard/employee')
  return res.data
}

export const getHrDashboardData = async () => {
  const res = await apiClient.get<Envelope<HRDashboardData>>('/api/v1/dashboard/hr')
  return res.data
}

export const getManagerDashboardData = async () => {
  const res = await apiClient.get<Envelope<ManagerDashboardData>>('/api/v1/dashboard/manager')
  return res.data
}

export const getExecutiveDashboardData = async () => {
  const res = await apiClient.get<Envelope<ExecutiveDashboardData>>('/api/v1/dashboard/executive')
  return res.data
}
