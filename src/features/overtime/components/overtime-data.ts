import type { OvertimePolicy, OvertimeRequest, OvertimeTrendPoint } from '@/features/overtime/types'

export const overtimeRequests: OvertimeRequest[] = [
  {
    id: 'OT-2026-0081',
    employee: 'Budi Santoso',
    date: '2026-08-15',
    schedule: '18:00–21:30',
    requestedHours: 3.5,
    eligibleHours: 3,
    status: 'pending',
  },
  {
    id: 'OT-2026-0080',
    employee: 'Dewi Lestari',
    date: '2026-08-14',
    schedule: '18:00–20:00',
    requestedHours: 2,
    eligibleHours: 2,
    status: 'approved',
  },
  {
    id: 'OT-2026-0079',
    employee: 'Andi Pratama',
    date: '2026-08-13',
    schedule: '19:00–22:00',
    requestedHours: 3,
    eligibleHours: 3,
    status: 'approved',
  },
  {
    id: 'OT-2026-0078',
    employee: 'Rina Ayu',
    date: '2026-08-12',
    schedule: '18:30–20:30',
    requestedHours: 2,
    eligibleHours: 1.5,
    status: 'rejected',
  },
]

export const overtimePolicies: OvertimePolicy[] = [
  { name: 'Workday', factor: '1.5×', tone: 'blue' },
  { name: 'Rest day', factor: '2×', tone: 'green' },
  { name: 'National holiday', factor: '3×', tone: 'red' },
]

export const overtimeTrend: OvertimeTrendPoint[] = [
  { month: 'Mar', hours: 228 },
  { month: 'Apr', hours: 251 },
  { month: 'May', hours: 274 },
  { month: 'Jun', hours: 273 },
  { month: 'Jul', hours: 308 },
  { month: 'Aug', hours: 346.5 },
]
