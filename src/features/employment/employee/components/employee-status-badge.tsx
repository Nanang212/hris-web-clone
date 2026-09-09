// employee-status-badge.tsx — Reusable status badge for employees

import { Badge } from '@/shared/components/ui/badge'
import type { EmployeeStatus } from '@/features/employment/employee/types'

const statusConfig: Record<
  EmployeeStatus,
  { label: string; variant: 'green' | 'gray' | 'amber' | 'blue' | 'red' }
> = {
  active: { label: 'Aktif', variant: 'green' },
  inactive: { label: 'Tidak Aktif', variant: 'gray' },
  probation: { label: 'Probasi', variant: 'amber' },
  resigned: { label: 'Resign', variant: 'red' },
  terminated: { label: 'Terminated', variant: 'red' },
}

interface EmployeeStatusBadgeProps {
  status: EmployeeStatus
}

export function EmployeeStatusBadge({ status }: Readonly<EmployeeStatusBadgeProps>) {
  const config = statusConfig[status] ?? { label: status, variant: 'gray' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
