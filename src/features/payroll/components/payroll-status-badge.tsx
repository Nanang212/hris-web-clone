// src/features/payroll/components/payroll-status-badge.tsx
import type { PayrollStatus, PayslipStatus } from '../types'
import { m } from '@/i18n/paraglide/messages'
import { Badge } from '@/shared/components/ui/badge'

interface PayrollStatusBadgeProps {
  status: PayrollStatus | PayslipStatus
  className?: string
}

export function PayrollStatusBadge({ status, className }: PayrollStatusBadgeProps) {
  switch (status) {
    case 'disbursed':
    case 'downloaded':
      return (
        <Badge variant='green' className={`text-[10px] font-semibold uppercase ${className}`}>
          {status === 'disbursed' ? m.payroll_status_disbursed() : m.payroll_status_downloaded()}
        </Badge>
      )
    case 'approved':
    case 'sent':
      return (
        <Badge variant='blue' className={`text-[10px] font-semibold uppercase ${className}`}>
          {status === 'approved' ? m.payroll_status_approved() : m.payroll_status_sent()}
        </Badge>
      )
    case 'in_review':
    case 'published':
      return (
        <Badge variant='amber' className={`text-[10px] font-semibold uppercase ${className}`}>
          {status === 'in_review' ? m.payroll_status_in_review() : m.payroll_status_published()}
        </Badge>
      )
    case 'draft':
    default:
      return (
        <Badge variant='gray' className={`text-[10px] font-semibold uppercase ${className}`}>
          {m.payroll_status_draft()}
        </Badge>
      )
  }
}
