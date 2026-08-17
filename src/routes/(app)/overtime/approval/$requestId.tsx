import { createFileRoute } from '@tanstack/react-router'

import { OvertimeApprovalDetailPage } from '@/features/overtime/pages/overtime-approval-detail-page'

export const Route = createFileRoute('/(app)/overtime/approval/$requestId')({
  component: OvertimeApprovalDetailPage,
})
