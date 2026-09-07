// src/features/payroll/store/payroll-bpjs-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { initialBpjsKesConfig, initialBpjsTkConfig } from '../data/mock-payroll-data'
import type { BpjsKesConfig, BpjsTkConfig } from '../types'

export interface BpjsDependent {
  id: string
  name: string
  relationship: string
  dateOfBirth: string
  status: 'Active' | 'Pending'
}

export interface EmployeeBpjsRecord {
  health: {
    participantNumber: string
    memberSince: string
    classLevel: string
    facility: string
    status: 'Active' | 'Inactive'
  }
  employment: {
    participantNumber: string
    memberSince: string
    jht: boolean
    jkk: boolean
    jkm: boolean
    jp: boolean
    status: 'Active' | 'Inactive'
  }
  dependents: BpjsDependent[]
  lastSync: string
}

interface PayrollBpjsStoreState {
  bpjsTkConfig: BpjsTkConfig
  bpjsKesConfig: BpjsKesConfig
  lastSyncGlobal: string
  recordsByEmployee: Record<string, EmployeeBpjsRecord>

  // Actions
  setBpjsTkConfig: (config: BpjsTkConfig) => void
  setBpjsKesConfig: (config: BpjsKesConfig) => void
  getEmployeeBpjsRecord: (employeeId: string, defaultHealthNo?: string, defaultEmpNo?: string) => EmployeeBpjsRecord
  updateEmployeeHealthData: (
    employeeId: string,
    data: Partial<EmployeeBpjsRecord['health']>,
  ) => void
  updateEmployeeEmploymentData: (
    employeeId: string,
    data: Partial<EmployeeBpjsRecord['employment']>,
  ) => void
  addDependent: (employeeId: string, dependent: Omit<BpjsDependent, 'id'>) => void
  updateDependent: (
    employeeId: string,
    dependentId: string,
    data: Partial<BpjsDependent>,
  ) => void
  deleteDependent: (employeeId: string, dependentId: string) => void
  syncBpjsRecords: (employeeId: string) => void
}

const defaultRecord: EmployeeBpjsRecord = {
  health: {
    participantNumber: '0001234567890',
    memberSince: '1 June 2023',
    classLevel: 'Class 1',
    facility: 'Puskesmas Tanah Abang',
    status: 'Active',
  },
  employment: {
    participantNumber: '190001234567890',
    memberSince: '1 June 2023',
    jht: true,
    jkk: true,
    jkm: true,
    jp: true,
    status: 'Active',
  },
  dependents: [
    {
      id: 'dep-1',
      name: 'Sinta Maharani',
      relationship: 'Wife',
      dateOfBirth: '21 Apr 1993',
      status: 'Active',
    },
    {
      id: 'dep-2',
      name: 'Nara Aditya',
      relationship: 'Child',
      dateOfBirth: '2 Feb 2020',
      status: 'Active',
    },
    {
      id: 'dep-3',
      name: 'Raka Aditya',
      relationship: 'Child',
      dateOfBirth: '14 Jul 2023',
      status: 'Pending',
    },
  ],
  lastSync: '10 Aug 2025, 02:40 PM',
}

export const usePayrollBpjsStore = create<PayrollBpjsStoreState>()(
  persist(
    (set, get) => ({
      bpjsTkConfig: initialBpjsTkConfig,
      bpjsKesConfig: initialBpjsKesConfig,
      lastSyncGlobal: '10 Aug 2025, 02:40 PM',
      recordsByEmployee: {},

      setBpjsTkConfig: (config) => {
        const now = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        set({ bpjsTkConfig: config, lastSyncGlobal: now })
      },

      setBpjsKesConfig: (config) => {
        const now = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        set({ bpjsKesConfig: config, lastSyncGlobal: now })
      },

      getEmployeeBpjsRecord: (employeeId: string, defaultHealthNo?: string, defaultEmpNo?: string) => {
        const state = get()
        const existing = state.recordsByEmployee[employeeId]
        if (existing) return existing

        return {
          ...defaultRecord,
          health: {
            ...defaultRecord.health,
            participantNumber: defaultHealthNo || defaultRecord.health.participantNumber,
          },
          employment: {
            ...defaultRecord.employment,
            participantNumber: defaultEmpNo || defaultRecord.employment.participantNumber,
          },
        }
      },

      updateEmployeeHealthData: (employeeId, data) => {
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const updated: EmployeeBpjsRecord = {
          ...current,
          health: {
            ...current.health,
            ...data,
          },
        }
        set({
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },

      updateEmployeeEmploymentData: (employeeId, data) => {
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const updated: EmployeeBpjsRecord = {
          ...current,
          employment: {
            ...current.employment,
            ...data,
          },
        }
        set({
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },

      addDependent: (employeeId, dependent) => {
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const newDependent: BpjsDependent = {
          ...dependent,
          id: `dep-${Date.now()}`,
        }
        const updated: EmployeeBpjsRecord = {
          ...current,
          dependents: [...current.dependents, newDependent],
        }
        set({
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },

      updateDependent: (employeeId, dependentId, data) => {
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const updated: EmployeeBpjsRecord = {
          ...current,
          dependents: current.dependents.map((d) => (d.id === dependentId ? { ...d, ...data } : d)),
        }
        set({
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },

      deleteDependent: (employeeId, dependentId) => {
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const updated: EmployeeBpjsRecord = {
          ...current,
          dependents: current.dependents.filter((d) => d.id !== dependentId),
        }
        set({
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },

      syncBpjsRecords: (employeeId) => {
        const now = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        const state = get()
        const current = state.getEmployeeBpjsRecord(employeeId)
        const updated: EmployeeBpjsRecord = {
          ...current,
          lastSync: now,
        }
        set({
          lastSyncGlobal: now,
          recordsByEmployee: {
            ...state.recordsByEmployee,
            [employeeId]: updated,
          },
        })
      },
    }),
    {
      name: 'hris_payroll_bpjs_store_v1',
    },
  ),
)
