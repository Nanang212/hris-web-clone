import { createFileRoute } from '@tanstack/react-router'

import { AttendanceApprovalDetailPage } from '@/features/attendance/pages/approval/attendance-approval-detail-page'

export const Route = createFileRoute('/(app)/attendance/approval/$requestId')({
  component: AttendanceApprovalDetailPage,
})
