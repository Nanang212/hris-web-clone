// src/features/payroll/components/payroll-status-badge.tsx
import type { PayrollStatus, PayslipStatus } from '../types'
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
          {status === 'disbursed' ? 'Disbursed' : 'Downloaded'}
        </Badge>
      )
    case 'approved':
    case 'sent':
      return (
        <Badge variant='blue' className={`text-[10px] font-semibold uppercase ${className}`}>
          {status === 'approved' ? 'Approved' : 'Sent'}
        </Badge>
      )
    case 'in_review':
    case 'published':
      return (
        <Badge variant='amber' className={`text-[10px] font-semibold uppercase ${className}`}>
          {status === 'in_review' ? 'In Review' : 'Published'}
        </Badge>
      )
    case 'draft':
    default:
      return (
        <Badge variant='gray' className={`text-[10px] font-semibold uppercase ${className}`}>
          Draft
        </Badge>
      )
  }
}
