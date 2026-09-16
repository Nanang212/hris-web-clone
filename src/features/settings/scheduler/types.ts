// types.ts — Work Schedule (Scheduler) feature types

export type ShiftType = 'regular' | 'shifting' | 'split'
export type ShiftStatus = 'active' | 'inactive'
export type WorkDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface ShiftSession {
  label?: string     // e.g. 'Pagi', 'Siang', 'Malam'
  startTime: string  // 'HH:mm'
  endTime: string    // 'HH:mm'
  crossMidnight?: boolean
}

export interface WorkSchedule {
  id: string
  code: string
  name: string
  description: string
  type: ShiftType
  sessions: ShiftSession[]
  workDays: WorkDay[]
  gracePeriodMinutes: number  // tolerance late (menit)
  breakDurationMinutes: number
  overtimeThresholdMinutes: number
  status: ShiftStatus
  totalEmployees: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CreateWorkScheduleInput {
  code: string
  name: string
  description: string
  type: ShiftType
  sessions: ShiftSession[]
  workDays: WorkDay[]
  gracePeriodMinutes: number
  breakDurationMinutes: number
  overtimeThresholdMinutes: number
  status: ShiftStatus
}

export type UpdateWorkScheduleInput = Partial<CreateWorkScheduleInput>

export interface WorkScheduleStats {
  total: number
  active: number
  regular: number
  shifting: number
  split: number
}

export interface ResetWorkScheduleOptions {
  restoreTemplate?: boolean
  resetAssignments?: boolean
  notifyEmployees?: boolean
}

export interface AssignedEmployee {
  id: string
  name: string
  nik: string
  department: string
  position: string
  avatar?: string
  assignedAt: string
}

export interface ScheduleExecutionLog {
  id: string
  scheduleId: string
  executedAt: string
  status: 'success' | 'warning' | 'failed'
  affectedEmployees: number
  triggerType: 'scheduled' | 'manual' | 'reset'
  message: string
}

// ─── Scheduler Management Types (from design screenshots) ─────────────────

export type SchedulerModule =
  | 'Attendance'
  | 'Leave'
  | 'Payroll'
  | 'Employee'
  | 'Workflow'
  | 'System'
  | 'Overtime'
  | 'Claim'
  | 'Business Trip'

export type SchedulerJobStatus = 'active' | 'running' | 'inactive' | 'failed'
export type SchedulerJobResult = 'success' | 'running' | 'failed' | 'idle'

export interface ScheduledJob {
  id: string
  name: string
  module: SchedulerModule
  frequency: string
  lastRun: string
  nextRun: string
  status: SchedulerJobStatus
  result: SchedulerJobResult
  description?: string
  retryPolicy?: string
  errorLog?: {
    message: string
    timestamp: string
    code?: string
    details?: string
  }
}

export interface SchedulerManagementStats {
  totalJobs: number
  totalModules: number
  active: number
  activePercentage: number
  running: number
  runningLabel: string
  failed: number
  failedLabel: string
}

export interface CreateScheduledJobInput {
  name: string
  module: SchedulerModule
  frequency: string
  status: SchedulerJobStatus
  description?: string
}

// ─── Execution History & Detail Types ──────────────────────────────────────

export interface ExecutionTimelineItem {
  time: string
  title: string
  color: 'blue' | 'purple' | 'green' | 'amber' | 'red'
  subtext?: string
}

export interface ExecutionLogLine {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

export interface ExecutionErrorContext {
  code: string
  errorCodeShort?: string
  failedStep?: string
  attempt?: string
  employee?: string
  recordDate?: string
  errorMessage: string
  suggestedCheck?: string
  stackContext?: string[]
}

export interface ExecutionRecord {
  runId: string
  schedulerId: string
  schedulerName: string
  module: SchedulerModule
  trigger: 'Scheduled' | 'Manual' | 'Retry'
  startedAt: string
  finishedAt: string
  startedFormatted: string
  duration: string
  result: 'Success' | 'Failed' | 'Running'
  totalRecords: number
  processed: number
  succeeded: number
  skipped: number
  failed: number
  remaining: number
  warnings: number
  bannerError?: string
  timeline: ExecutionTimelineItem[]
  logs?: ExecutionLogLine[]
  errorContext?: ExecutionErrorContext
}

export interface ExecutionHistoryStats {
  totalRuns: number
  successRate: number
  avgDuration: string
  failed: number
}
