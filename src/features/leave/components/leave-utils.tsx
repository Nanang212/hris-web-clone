import dayjs from 'dayjs'

import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'
import type { LeaveRequest } from '@/features/leave/types'
import { m } from '@/i18n/paraglide/messages'

export function getLeaveTypeLabel(leaveType: LeaveRequest['leaveType']) {
  return {
    annual: m.leave_type_annual(),
    sick: m.leave_type_sick(),
    personal: m.leave_type_personal(),
    maternity: m.leave_type_maternity(),
  }[leaveType]
}

export function formatLeavePeriod(startDate: string, endDate: string) {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  return start.isSame(end, 'day')
    ? start.format('DD MMM YYYY')
    : `${start.format('DD')}–${end.format('DD MMM YYYY')}`
}

export function LeaveStatus({ status }: Readonly<{ status: LeaveRequest['status'] }>) {
  const labels = {
    pending: m.leave_status_pending(),
    approved: m.leave_status_approved(),
    rejected: m.leave_status_rejected(),
  }
  return (
    <Badge
      variant={
        status === 'rejected' ? 'destructive' : status === 'pending' ? 'secondary' : 'outline'
      }
      className={cn(status === 'approved' && 'border-emerald-200 bg-emerald-50 text-emerald-700')}
    >
      {labels[status]}
    </Badge>
  )
}
