export interface LeaveRequest {
  id: string
  employee: string
  employeeRole: string
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity'
  startDate: string
  endDate: string
  duration: string
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  submittedAt: string
  coverage: 'safe' | 'review' | 'conflict'
}

export interface LeaveBalance {
  code: string
  leaveType: 'annual' | 'sick' | 'personal' | 'maternity'
  available: string
  expiry: string
  tone: 'blue' | 'emerald' | 'violet' | 'orange'
}
