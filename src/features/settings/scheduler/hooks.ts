import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createScheduledJob,
  createWorkSchedule,
  deleteWorkSchedule,
  getAssignedEmployees,
  getExecutionHistoryStats,
  getExecutionRecordById,
  getExecutionRecords,
  getScheduledJobById,
  getScheduledJobs,
  getScheduleExecutionLogs,
  getSchedulerManagementStats,
  getWorkScheduleById,
  getWorkSchedules,
  getWorkScheduleStats,
  resetAllSchedulersToDefault,
  resetWorkSchedule,
  retryExecutionRun,
  retryScheduledJob,
  toggleScheduledJobStatus,
  toggleWorkScheduleStatus,
  updateScheduledJob,
  updateWorkSchedule,
} from './api'
import type {
  CreateScheduledJobInput,
  CreateWorkScheduleInput,
  ResetWorkScheduleOptions,
  ScheduledJob,
  UpdateWorkScheduleInput,
} from './types'

export const schedulerQueryKeys = {
  all: ['work-schedules'] as const,
  list: () => [...schedulerQueryKeys.all, 'list'] as const,
  stats: () => [...schedulerQueryKeys.all, 'stats'] as const,
  detail: (id: string) => [...schedulerQueryKeys.all, 'detail', id] as const,
  employees: (id: string) => [...schedulerQueryKeys.all, 'employees', id] as const,
  logs: (id: string) => [...schedulerQueryKeys.all, 'logs', id] as const,
  // Scheduled jobs keys
  jobs: ['scheduled-jobs'] as const,
  jobsList: () => [...schedulerQueryKeys.jobs, 'list'] as const,
  jobsStats: () => [...schedulerQueryKeys.jobs, 'stats'] as const,
  jobDetail: (id: string) => [...schedulerQueryKeys.jobs, 'detail', id] as const,
  // Execution history keys
  executions: ['scheduler-executions'] as const,
  executionsList: (schedulerId?: string) =>
    [...schedulerQueryKeys.executions, 'list', schedulerId ?? 'all'] as const,
  executionsStats: (schedulerId?: string) =>
    [...schedulerQueryKeys.executions, 'stats', schedulerId ?? 'all'] as const,
  executionDetail: (runId: string) =>
    [...schedulerQueryKeys.executions, 'detail', runId] as const,
}

export function useGetWorkSchedules() {
  return useQuery({
    queryKey: schedulerQueryKeys.list(),
    queryFn: getWorkSchedules,
  })
}

export function useGetWorkScheduleStats() {
  return useQuery({
    queryKey: schedulerQueryKeys.stats(),
    queryFn: getWorkScheduleStats,
  })
}

export function useGetWorkScheduleById(id: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.detail(id),
    queryFn: () => getWorkScheduleById(id),
    enabled: !!id,
  })
}

export function useGetAssignedEmployees(scheduleId: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.employees(scheduleId),
    queryFn: () => getAssignedEmployees(scheduleId),
    enabled: !!scheduleId,
  })
}

export function useGetScheduleExecutionLogs(scheduleId: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.logs(scheduleId),
    queryFn: () => getScheduleExecutionLogs(scheduleId),
    enabled: !!scheduleId,
  })
}

export function useCreateWorkSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkScheduleInput) => createWorkSchedule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.all })
    },
  })
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateWorkScheduleInput }) =>
      updateWorkSchedule(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.detail(variables.id) })
    },
  })
}

export function useDeleteWorkSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteWorkSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.all })
    },
  })
}

export function useToggleWorkScheduleStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleWorkScheduleStatus(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.detail(id) })
    },
  })
}

export function useResetWorkSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, options }: { id: string; options?: ResetWorkScheduleOptions }) =>
      resetWorkSchedule(id, options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.logs(variables.id) })
    },
  })
}

// ─── Scheduled Job Hooks (Scheduler Management) ──────────────────────────────

export function useGetScheduledJobs() {
  return useQuery({
    queryKey: schedulerQueryKeys.jobsList(),
    queryFn: getScheduledJobs,
  })
}

export function useGetScheduledJobById(id: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.jobDetail(id),
    queryFn: () => getScheduledJobById(id),
    enabled: !!id,
  })
}

export function useGetSchedulerManagementStats() {
  return useQuery({
    queryKey: schedulerQueryKeys.jobsStats(),
    queryFn: getSchedulerManagementStats,
  })
}

export function useToggleScheduledJobStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleScheduledJobStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.jobs })
    },
  })
}

export function useRetryScheduledJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => retryScheduledJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.jobs })
    },
  })
}

export function useResetAllSchedulersToDefault() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => resetAllSchedulersToDefault(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.jobs })
    },
  })
}

export function useCreateScheduledJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateScheduledJobInput) => createScheduledJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.jobs })
    },
  })
}

export function useUpdateScheduledJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ScheduledJob> }) =>
      updateScheduledJob(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.jobs })
    },
  })
}

// ─── Execution History & Detail Hooks ────────────────────────────────────────

export function useGetExecutionRecords(schedulerId?: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.executionsList(schedulerId),
    queryFn: () => getExecutionRecords(schedulerId),
  })
}

export function useGetExecutionRecordById(runId: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.executionDetail(runId),
    queryFn: () => getExecutionRecordById(runId),
    enabled: !!runId,
  })
}

export function useGetExecutionHistoryStats(schedulerId?: string) {
  return useQuery({
    queryKey: schedulerQueryKeys.executionsStats(schedulerId),
    queryFn: () => getExecutionHistoryStats(schedulerId),
  })
}

export function useRetryExecutionRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (runId: string) => retryExecutionRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schedulerQueryKeys.executions })
    },
  })
}


