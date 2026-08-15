import { createFileRoute } from '@tanstack/react-router'

import { AttendanceApprovalPage } from '@/features/attendance/pages/attendance-approval-page'

export const Route = createFileRoute('/(app)/attendance/approval/')({
  component: AttendanceApprovalPage,
})
