import type {
  AssignedEmployee,
  CreateScheduledJobInput,
  CreateWorkScheduleInput,
  ExecutionHistoryStats,
  ExecutionRecord,
  ResetWorkScheduleOptions,
  ScheduledJob,
  SchedulerManagementStats,
  ScheduleExecutionLog,
  UpdateWorkScheduleInput,
  WorkSchedule,
  WorkScheduleStats,
} from './types'
import {
  defaultExecutionHistoryStats,
  defaultScheduledJobs,
  dummyAssignedEmployees,
  dummyExecutionLogs,
  dummyExecutionRecords,
  dummyWorkSchedules,
  dummyWorkScheduleStats,
} from './data'

const sleep = (ms = 600) => new Promise((r) => setTimeout(r, ms))

// In-memory store for dummy CRUD
let store: WorkSchedule[] = [...dummyWorkSchedules]

export async function getWorkSchedules(): Promise<WorkSchedule[]> {
  await sleep()
  return [...store]
}

export async function getWorkScheduleStats(): Promise<WorkScheduleStats> {
  await sleep(300)
  return {
    total: store.length,
    active: store.filter((s) => s.status === 'active').length,
    regular: store.filter((s) => s.type === 'regular').length,
    shifting: store.filter((s) => s.type === 'shifting').length,
    split: store.filter((s) => s.type === 'split').length,
  }
}

export async function createWorkSchedule(input: CreateWorkScheduleInput): Promise<WorkSchedule> {
  await sleep()
  const newItem: WorkSchedule = {
    ...input,
    id: `ws-${Date.now()}`,
    totalEmployees: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    createdBy: 'Admin HR',
  }
  store = [newItem, ...store]
  return newItem
}

export async function updateWorkSchedule(
  id: string,
  input: UpdateWorkScheduleInput,
): Promise<WorkSchedule> {
  await sleep()
  store = store.map((s) =>
    s.id === id
      ? { ...s, ...input, updatedAt: new Date().toISOString().split('T')[0] }
      : s,
  )
  const updated = store.find((s) => s.id === id)
  if (!updated) throw new Error('Work schedule not found')
  return updated
}

export async function deleteWorkSchedule(id: string): Promise<void> {
  await sleep()
  store = store.filter((s) => s.id !== id)
}

export async function getWorkScheduleById(id: string): Promise<WorkSchedule> {
  await sleep(200)
  const item = store.find((s) => s.id === id)
  if (!item) throw new Error('Work schedule not found')
  return { ...item }
}

export async function getAssignedEmployees(scheduleId: string): Promise<AssignedEmployee[]> {
  await sleep(300)
  const employees = dummyAssignedEmployees[scheduleId]
  if (employees && employees.length > 0) return [...employees]
  // Fallback to default list with adapted department for dummy
  return (dummyAssignedEmployees['ws-001'] ?? []).slice(0, 3)
}

const executionLogsStore: Record<string, ScheduleExecutionLog[]> = { ...dummyExecutionLogs }

export async function getScheduleExecutionLogs(
  scheduleId: string,
): Promise<ScheduleExecutionLog[]> {
  await sleep(300)
  const logs = executionLogsStore[scheduleId]
  if (logs && logs.length > 0) return [...logs]
  return [
    {
      id: `log-def-${scheduleId}`,
      scheduleId,
      executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'success',
      affectedEmployees: 0,
      triggerType: 'scheduled',
      message: 'Jadwal siap digunakan dan berjalan normal.',
    },
  ]
}

export async function resetWorkSchedule(
  id: string,
  options?: ResetWorkScheduleOptions,
): Promise<WorkSchedule> {
  await sleep(500)
  const existing = store.find((s) => s.id === id)
  if (!existing) throw new Error('Work schedule not found')

  // Find baseline or template
  const baseline = dummyWorkSchedules.find((s) => s.id === id)

  const templateSessions =
    existing.type === 'regular'
      ? [{ label: 'Kerja', startTime: '08:00', endTime: '17:00' }]
      : existing.type === 'shifting'
        ? [{ label: 'Shift Pagi', startTime: '06:00', endTime: '14:00' }]
        : [
            { label: 'Sesi Pagi', startTime: '08:00', endTime: '12:00' },
            { label: 'Sesi Sore', startTime: '16:00', endTime: '21:00' },
          ]

  const templateDays =
    existing.type === 'regular'
      ? (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const)
      : (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const)

  const updatedItem: WorkSchedule = {
    ...existing,
    sessions: options?.restoreTemplate !== false
      ? (baseline?.sessions ?? templateSessions)
      : existing.sessions,
    workDays: options?.restoreTemplate !== false
      ? (baseline?.workDays ?? [...templateDays])
      : existing.workDays,
    gracePeriodMinutes: baseline?.gracePeriodMinutes ?? 15,
    breakDurationMinutes: baseline?.breakDurationMinutes ?? 60,
    overtimeThresholdMinutes: baseline?.overtimeThresholdMinutes ?? 30,
    totalEmployees: options?.resetAssignments ? 0 : existing.totalEmployees,
    updatedAt: new Date().toISOString().split('T')[0],
  }

  store = store.map((s) => (s.id === id ? updatedItem : s))

  // Append new execution log for the reset event
  const newLog: ScheduleExecutionLog = {
    id: `log-${Date.now()}`,
    scheduleId: id,
    executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'warning',
    affectedEmployees: updatedItem.totalEmployees,
    triggerType: 'reset',
    message: `Jadwal kerja direset ke template default.${options?.notifyEmployees ? ' Notifikasi dikirim ke karyawan terkait.' : ''}`,
  }

  executionLogsStore[id] = [newLog, ...(executionLogsStore[id] ?? [])]

  return updatedItem
}

export async function toggleWorkScheduleStatus(id: string): Promise<WorkSchedule> {
  await sleep(300)
  store = store.map((s) =>
    s.id === id
      ? {
          ...s,
          status: s.status === 'active' ? 'inactive' : 'active',
          updatedAt: new Date().toISOString().split('T')[0],
        }
      : s,
  )
  const updated = store.find((s) => s.id === id)
  if (!updated) throw new Error('Work schedule not found')
  return updated
}

// re-export stats baseline for reset purposes
export { dummyWorkScheduleStats }

// ─── Scheduler Management Store & APIs ───────────────────────────────────────

let jobsStore: ScheduledJob[] = [...defaultScheduledJobs]

export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  await sleep(200)
  return [...jobsStore]
}

export async function getScheduledJobById(id: string): Promise<ScheduledJob> {
  await sleep(150)
  const job = jobsStore.find((j) => j.id === id)
  if (!job) throw new Error('Scheduled job not found')
  return { ...job }
}

export async function getSchedulerManagementStats(): Promise<SchedulerManagementStats> {
  await sleep(150)
  const total = jobsStore.length
  const active = jobsStore.filter((j) => j.status === 'active').length
  const running = jobsStore.filter((j) => j.status === 'running').length
  const failed = jobsStore.filter((j) => j.status === 'failed').length
  const modules = new Set(jobsStore.map((j) => j.module)).size

  return {
    totalJobs: total,
    totalModules: modules,
    active,
    activePercentage: total > 0 ? Math.round((active / total) * 1000) / 10 : 0,
    running,
    runningLabel: 'Device sync',
    failed,
    failedLabel: 'Needs attention',
  }
}

export async function toggleScheduledJobStatus(id: string): Promise<ScheduledJob> {
  await sleep(300)
  jobsStore = jobsStore.map((j) => {
    if (j.id !== id) return j
    const nextStatus = j.status === 'active' ? 'inactive' : 'active'
    return {
      ...j,
      status: nextStatus,
      result: nextStatus === 'inactive' ? 'idle' : j.result,
    }
  })
  const updated = jobsStore.find((j) => j.id === id)
  if (!updated) throw new Error('Scheduled job not found')
  return { ...updated }
}

export async function retryScheduledJob(id: string): Promise<ScheduledJob> {
  await sleep(600)
  jobsStore = jobsStore.map((j) => {
    if (j.id !== id) return j
    return {
      ...j,
      status: 'active',
      result: 'success',
      lastRun: 'Just now',
      errorLog: undefined,
    }
  })
  const updated = jobsStore.find((j) => j.id === id)
  if (!updated) throw new Error('Scheduled job not found')
  return { ...updated }
}

export async function resetAllSchedulersToDefault(): Promise<{ count: number }> {
  await sleep(600)
  jobsStore = [...defaultScheduledJobs]
  return { count: jobsStore.length }
}

export async function createScheduledJob(input: CreateScheduledJobInput): Promise<ScheduledJob> {
  await sleep(300)
  const newJob: ScheduledJob = {
    id: `job-${Date.now()}`,
    name: input.name,
    module: input.module,
    frequency: input.frequency,
    lastRun: '—',
    nextRun: 'Tomorrow · 00:00',
    status: input.status,
    result: input.status === 'active' ? 'idle' : 'idle',
    description: input.description,
  }
  jobsStore = [newJob, ...jobsStore]
  return newJob
}

export async function updateScheduledJob(
  id: string,
  input: Partial<ScheduledJob>,
): Promise<ScheduledJob> {
  await sleep(300)
  jobsStore = jobsStore.map((j) => (j.id === id ? { ...j, ...input } : j))
  const updated = jobsStore.find((j) => j.id === id)
  if (!updated) throw new Error('Scheduled job not found')
  return { ...updated }
}

// ─── Execution History & Detail API ──────────────────────────────────────────

const executionRecordsStore: ExecutionRecord[] = [...dummyExecutionRecords]

export async function getExecutionRecords(schedulerId?: string): Promise<ExecutionRecord[]> {
  await sleep(250)
  if (schedulerId) {
    const list = executionRecordsStore.filter((r) => r.schedulerId === schedulerId)
    if (list.length > 0) return [...list]
    const job = jobsStore.find((j) => j.id === schedulerId)
    return executionRecordsStore.map((r) => ({
      ...r,
      schedulerId,
      schedulerName: job?.name || r.schedulerName,
      module: job?.module || r.module,
    }))
  }
  return [...executionRecordsStore]
}

export async function getExecutionRecordById(runId: string): Promise<ExecutionRecord> {
  await sleep(200)
  const item = executionRecordsStore.find((r) => r.runId === runId)
  if (item) return { ...item }
  const isFailed = runId.includes('0100')
  const fallback =
    executionRecordsStore.find((r) => (isFailed ? r.result === 'Failed' : r.result === 'Success')) ||
    executionRecordsStore[0]
  if (fallback) return { ...fallback, runId }
  throw new Error('Execution record not found')
}

export async function getExecutionHistoryStats(
  schedulerId?: string,
): Promise<ExecutionHistoryStats> {
  await sleep(150)
  if (schedulerId) {
    const list = executionRecordsStore.filter((r) => r.schedulerId === schedulerId)
    if (list.length > 0) {
      const failed = list.filter((r) => r.result === 'Failed').length
      const successRate = Math.round(((list.length - failed) / list.length) * 1000) / 10
      return {
        totalRuns: list.length,
        successRate,
        avgDuration: '1m 49s',
        failed,
      }
    }
  }
  return { ...defaultExecutionHistoryStats }
}

export async function retryExecutionRun(runId: string): Promise<{ success: boolean; newRunId: string }> {
  await sleep(600)
  const newRunId = runId
    ? `EXE-${runId.replace(/^EXE-/, '').split('-')[0] || new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
    : `EXE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`
  return { success: true, newRunId }
}


