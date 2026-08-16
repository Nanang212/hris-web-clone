import { createFileRoute } from '@tanstack/react-router'

import { RejectAttendanceRequestPage } from '@/features/attendance/pages/approval/reject-attendance-request-page'

export const Route = createFileRoute('/(app)/attendance/approval/$requestId/reject')({
  component: RejectAttendanceRequestPage,
})
