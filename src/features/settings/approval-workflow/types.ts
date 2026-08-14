// types.ts — Approval Workflow feature types

export type WorkflowStatus = 'active' | 'inactive' | 'draft'
export type ApprovalType = 'sequential' | 'parallel' | 'any_one'
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in'
export type ApproverType = 'role' | 'user' | 'dynamic' | 'department_head' | 'direct_manager'
export type ModuleType =
  | 'leave'
  | 'overtime'
  | 'reimbursement'
  | 'loan'
  | 'resignation'
  | 'transfer'
  | 'promotion'

export interface Workflow {
  id: string
  name: string
  description: string
  module: ModuleType
  status: WorkflowStatus
  totalLevels: number
  totalRequests: number
  avgProcessingDays: number
  pendingRequests: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ApprovalLevel {
  id: string
  workflowId: string
  level: number
  name: string
  approverType: ApproverType
  approverValue: string // role name, user name, etc.
  approvalType: ApprovalType
  timeoutDays: number
  timeoutAction: 'escalate' | 'auto_approve' | 'auto_reject'
  requireNote: boolean
  canDelegate: boolean
}

export interface ConditionRule {
  id: string
  field: string
  operator: ConditionOperator
  value: string | number
  label?: string
}

export interface ConditionGroup {
  id: string
  logic: 'AND' | 'OR'
  rules: ConditionRule[]
}

export interface RoutingRule {
  id: string
  workflowId: string
  name: string
  priority: number
  conditions: ConditionGroup
  targetWorkflowId?: string // redirect to another workflow
  skipLevels?: number[]
}

export interface TestScenario {
  requesterName: string
  requesterDepartment: string
  requesterPosition: string
  requestType: ModuleType
  requestValue?: number
  requestDays?: number
  reason?: string
}

export interface TestResult {
  workflowName: string
  matchedConditions: string[]
  levels: {
    level: number
    name: string
    approver: string
    approverType: ApproverType
    estimatedDays: number
  }[]
  totalEstimatedDays: number
  canBeApproved: boolean
  warnings: string[]
}

export interface MatrixEntry {
  id: string
  employeeName: string
  department: string
  position: string
  requestType: ModuleType
  workflowName: string
  currentLevel: number
  totalLevels: number
  status: 'pending' | 'in_progress' | 'approved' | 'rejected'
  daysElapsed: number
}
