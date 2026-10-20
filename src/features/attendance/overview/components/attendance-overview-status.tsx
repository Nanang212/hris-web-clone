import { Badge } from '@/shared/components/ui/badge'

import type { AttendanceOverviewStatus } from '../types'
import { getAttendanceOverviewStatusLabel } from './attendance-overview-status-labels'

export function AttendanceOverviewStatusBadge({
  status,
  isToday,
}: Readonly<{ status: AttendanceOverviewStatus; isToday: boolean }>) {
  const variants = {
    on_time: 'green',
    late: 'amber',
    leave: 'blue',
    missing: 'red',
  } as const

  return (
    <Badge variant={variants[status]}>{getAttendanceOverviewStatusLabel(status, isToday)}</Badge>
  )
}
