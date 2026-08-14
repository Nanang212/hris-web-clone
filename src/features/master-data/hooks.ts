// hooks.ts — React Query hooks for Master Data
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as api from './api'
import type {
  Department,
  Division,
  Position,
  Grade,
  Shift,
  Holiday,
  LeaveType,
  PayrollComponent,
} from './types'

export const masterDataQueryKeys = {
  all: ['masterData'] as const,
  stats: () => [...masterDataQueryKeys.all, 'stats'] as const,
  departments: () => [...masterDataQueryKeys.all, 'departments'] as const,
  divisions: () => [...masterDataQueryKeys.all, 'divisions'] as const,
  positions: () => [...masterDataQueryKeys.all, 'positions'] as const,
  grades: () => [...masterDataQueryKeys.all, 'grades'] as const,
  shifts: () => [...masterDataQueryKeys.all, 'shifts'] as const,
  holidays: () => [...masterDataQueryKeys.all, 'holidays'] as const,
  leaveTypes: () => [...masterDataQueryKeys.all, 'leaveTypes'] as const,
  payrollComponents: () => [...masterDataQueryKeys.all, 'payrollComponents'] as const,
}

// Stats Hook
export function useMasterDataStats() {
  return useQuery({
    queryKey: masterDataQueryKeys.stats(),
    queryFn: api.fetchMasterDataStats,
  })
}

// 1. Departments Hooks
export function useDepartments() {
  return useQuery({
    queryKey: masterDataQueryKeys.departments(),
    queryFn: api.fetchDepartments,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Department, 'id'>) => api.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.departments() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Department> }) =>
      api.updateDepartment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.departments() })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.departments() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 2. Divisions Hooks
export function useDivisions() {
  return useQuery({
    queryKey: masterDataQueryKeys.divisions(),
    queryFn: api.fetchDivisions,
  })
}

export function useCreateDivision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Division, 'id'>) => api.createDivision(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.divisions() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateDivision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Division> }) =>
      api.updateDivision(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.divisions() })
    },
  })
}

export function useDeleteDivision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteDivision(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.divisions() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 3. Positions Hooks
export function usePositions() {
  return useQuery({
    queryKey: masterDataQueryKeys.positions(),
    queryFn: api.fetchPositions,
  })
}

export function useCreatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Position, 'id'>) => api.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.positions() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Position> }) =>
      api.updatePosition(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.positions() })
    },
  })
}

export function useDeletePosition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.positions() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 4. Grades Hooks
export function useGrades() {
  return useQuery({
    queryKey: masterDataQueryKeys.grades(),
    queryFn: api.fetchGrades,
  })
}

export function useCreateGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Grade, 'id'>) => api.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.grades() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Grade> }) =>
      api.updateGrade(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.grades() })
    },
  })
}

export function useDeleteGrade() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.grades() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 5. Shifts Hooks
export function useShifts() {
  return useQuery({
    queryKey: masterDataQueryKeys.shifts(),
    queryFn: api.fetchShifts,
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Shift, 'id'>) => api.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.shifts() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Shift> }) =>
      api.updateShift(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.shifts() })
    },
  })
}

export function useDeleteShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.shifts() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 6. Holidays Hooks
export function useHolidays() {
  return useQuery({
    queryKey: masterDataQueryKeys.holidays(),
    queryFn: api.fetchHolidays,
  })
}

export function useCreateHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Holiday, 'id'>) => api.createHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.holidays() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Holiday> }) =>
      api.updateHoliday(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.holidays() })
    },
  })
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteHoliday(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.holidays() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 7. Leave Types Hooks
export function useLeaveTypes() {
  return useQuery({
    queryKey: masterDataQueryKeys.leaveTypes(),
    queryFn: api.fetchLeaveTypes,
  })
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<LeaveType, 'id'>) => api.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.leaveTypes() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<LeaveType> }) =>
      api.updateLeaveType(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.leaveTypes() })
    },
  })
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.leaveTypes() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

// 8. Payroll Components Hooks
export function usePayrollComponents() {
  return useQuery({
    queryKey: masterDataQueryKeys.payrollComponents(),
    queryFn: api.fetchPayrollComponents,
  })
}

export function useCreatePayrollComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<PayrollComponent, 'id'>) => api.createPayrollComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.payrollComponents() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}

export function useUpdatePayrollComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PayrollComponent> }) =>
      api.updatePayrollComponent(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.payrollComponents() })
    },
  })
}

export function useDeletePayrollComponent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deletePayrollComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.payrollComponents() })
      queryClient.invalidateQueries({ queryKey: masterDataQueryKeys.stats() })
    },
  })
}
