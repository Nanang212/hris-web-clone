// api.ts — Master Data API via Mockstack HTTP client

import { apiClient } from '@/shared/lib/axios'
import type {
  Department,
  Division,
  Position,
  Grade,
  Shift,
  Holiday,
  LeaveType,
  PayrollComponent,
  MasterDataStats,
} from './types'

const BASE = '/api/v1/master-data'

// --- Stats ---

export async function fetchMasterDataStats(): Promise<MasterDataStats> {
  const res = await apiClient.get<{ data: MasterDataStats }>(`${BASE}/stats`)
  return res.data.data
}

// --- 1. Departments ---

export async function fetchDepartments(): Promise<Department[]> {
  const res = await apiClient.get<{ data: Department[] }>(`${BASE}/departments`)
  return res.data.data
}

export async function fetchDepartmentById(id: string): Promise<Department> {
  const res = await apiClient.get<{ data: Department }>(`${BASE}/departments/${id}`)
  return res.data.data
}

export async function createDepartment(data: Omit<Department, 'id'>): Promise<Department> {
  const res = await apiClient.post<{ data: Department }>(`${BASE}/departments`, data)
  return res.data.data
}

export async function updateDepartment(
  id: string,
  updates: Partial<Department>,
): Promise<Department> {
  const res = await apiClient.put<{ data: Department }>(`${BASE}/departments/${id}`, updates)
  return res.data.data
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/departments/${id}`)
}

// --- 2. Divisions ---

export async function fetchDivisions(): Promise<Division[]> {
  const res = await apiClient.get<{ data: Division[] }>(`${BASE}/divisions`)
  return res.data.data
}

export async function fetchDivisionById(id: string): Promise<Division> {
  const res = await apiClient.get<{ data: Division }>(`${BASE}/divisions/${id}`)
  return res.data.data
}

export async function createDivision(data: Omit<Division, 'id'>): Promise<Division> {
  const res = await apiClient.post<{ data: Division }>(`${BASE}/divisions`, data)
  return res.data.data
}

export async function updateDivision(id: string, updates: Partial<Division>): Promise<Division> {
  const res = await apiClient.put<{ data: Division }>(`${BASE}/divisions/${id}`, updates)
  return res.data.data
}

export async function deleteDivision(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/divisions/${id}`)
}

// --- 3. Positions ---

export async function fetchPositions(): Promise<Position[]> {
  const res = await apiClient.get<{ data: Position[] }>(`${BASE}/positions`)
  return res.data.data
}

export async function fetchPositionById(id: string): Promise<Position> {
  const res = await apiClient.get<{ data: Position }>(`${BASE}/positions/${id}`)
  return res.data.data
}

export async function createPosition(data: Omit<Position, 'id'>): Promise<Position> {
  const res = await apiClient.post<{ data: Position }>(`${BASE}/positions`, data)
  return res.data.data
}

export async function updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
  const res = await apiClient.put<{ data: Position }>(`${BASE}/positions/${id}`, updates)
  return res.data.data
}

export async function deletePosition(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/positions/${id}`)
}

// --- 4. Grades ---

export async function fetchGrades(): Promise<Grade[]> {
  const res = await apiClient.get<{ data: Grade[] }>(`${BASE}/grades`)
  return res.data.data
}

export async function fetchGradeById(id: string): Promise<Grade> {
  const res = await apiClient.get<{ data: Grade }>(`${BASE}/grades/${id}`)
  return res.data.data
}

export async function createGrade(data: Omit<Grade, 'id'>): Promise<Grade> {
  const res = await apiClient.post<{ data: Grade }>(`${BASE}/grades`, data)
  return res.data.data
}

export async function updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
  const res = await apiClient.put<{ data: Grade }>(`${BASE}/grades/${id}`, updates)
  return res.data.data
}

export async function deleteGrade(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/grades/${id}`)
}

// --- 5. Shifts ---

export async function fetchShifts(): Promise<Shift[]> {
  const res = await apiClient.get<{ data: Shift[] }>(`${BASE}/shifts`)
  return res.data.data
}

export async function fetchShiftById(id: string): Promise<Shift> {
  const res = await apiClient.get<{ data: Shift }>(`${BASE}/shifts/${id}`)
  return res.data.data
}

export async function createShift(data: Omit<Shift, 'id'>): Promise<Shift> {
  const res = await apiClient.post<{ data: Shift }>(`${BASE}/shifts`, data)
  return res.data.data
}

export async function updateShift(id: string, updates: Partial<Shift>): Promise<Shift> {
  const res = await apiClient.put<{ data: Shift }>(`${BASE}/shifts/${id}`, updates)
  return res.data.data
}

export async function deleteShift(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/shifts/${id}`)
}

// --- 6. Holidays ---

export async function fetchHolidays(): Promise<Holiday[]> {
  const res = await apiClient.get<{ data: Holiday[] }>(`${BASE}/holidays`)
  return res.data.data
}

export async function fetchHolidayById(id: string): Promise<Holiday> {
  const res = await apiClient.get<{ data: Holiday }>(`${BASE}/holidays/${id}`)
  return res.data.data
}

export async function createHoliday(data: Omit<Holiday, 'id'>): Promise<Holiday> {
  const res = await apiClient.post<{ data: Holiday }>(`${BASE}/holidays`, data)
  return res.data.data
}

export async function updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday> {
  const res = await apiClient.put<{ data: Holiday }>(`${BASE}/holidays/${id}`, updates)
  return res.data.data
}

export async function deleteHoliday(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/holidays/${id}`)
}

// --- 7. Leave Types ---

export async function fetchLeaveTypes(): Promise<LeaveType[]> {
  const res = await apiClient.get<{ data: LeaveType[] }>(`${BASE}/leave-types`)
  return res.data.data
}

export async function fetchLeaveTypeById(id: string): Promise<LeaveType> {
  const res = await apiClient.get<{ data: LeaveType }>(`${BASE}/leave-types/${id}`)
  return res.data.data
}

export async function createLeaveType(data: Omit<LeaveType, 'id'>): Promise<LeaveType> {
  const res = await apiClient.post<{ data: LeaveType }>(`${BASE}/leave-types`, data)
  return res.data.data
}

export async function updateLeaveType(
  id: string,
  updates: Partial<LeaveType>,
): Promise<LeaveType> {
  const res = await apiClient.put<{ data: LeaveType }>(`${BASE}/leave-types/${id}`, updates)
  return res.data.data
}

export async function deleteLeaveType(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/leave-types/${id}`)
}

// --- 8. Payroll Components ---

export async function fetchPayrollComponents(): Promise<PayrollComponent[]> {
  const res = await apiClient.get<{ data: PayrollComponent[] }>(`${BASE}/payroll-components`)
  return res.data.data
}

export async function fetchPayrollComponentById(id: string): Promise<PayrollComponent> {
  const res = await apiClient.get<{ data: PayrollComponent }>(
    `${BASE}/payroll-components/${id}`,
  )
  return res.data.data
}

export async function createPayrollComponent(
  data: Omit<PayrollComponent, 'id'>,
): Promise<PayrollComponent> {
  const res = await apiClient.post<{ data: PayrollComponent }>(`${BASE}/payroll-components`, data)
  return res.data.data
}

export async function updatePayrollComponent(
  id: string,
  updates: Partial<PayrollComponent>,
): Promise<PayrollComponent> {
  const res = await apiClient.put<{ data: PayrollComponent }>(
    `${BASE}/payroll-components/${id}`,
    updates,
  )
  return res.data.data
}

export async function deletePayrollComponent(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/payroll-components/${id}`)
}
