import type { ModuleType } from '@/features/settings/approval-workflow/types'

export interface ApprovalTimelineStep {
  level: number
  name: string // e.g. Direct Manager, Dept Head
  approverName: string
  status: 'approved' | 'pending' | 'waiting' | 'rejected'
  approvedAt?: string
  note?: string
}

export interface ApprovalRequest {
  id: string
  employeeName: string
  employeeAvatar?: string
  department: string
  position: string
  requestType: ModuleType
  requestDate: string
  details: string
  status: 'pending' | 'approved' | 'rejected'
  currentLevel: number
  totalLevels: number
  workflowName: string
  amount?: number
  days?: number
  reason?: string
  attachmentUrl?: string
  // Business Trip specific
  destination?: string
  travelDates?: string
  advanceMoney?: number
  transportType?: string
  // Claim specific
  categoryLabel?: string
  costCenter?: string
  paymentMethod?: string
  bankAccount?: string
  timeline: ApprovalTimelineStep[]
}
