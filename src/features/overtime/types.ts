export interface OvertimeRequest {
  id: string
  employee: string
  date: string
  schedule: string
  requestedHours: number
  eligibleHours: number
  status: 'pending' | 'approved' | 'rejected'
}

export interface OvertimePolicy {
  name: string
  factor: string
  tone: 'blue' | 'green' | 'red'
}

export interface OvertimeTrendPoint {
  month: string
  hours: number
}
