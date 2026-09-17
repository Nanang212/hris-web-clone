import { createFileRoute } from '@tanstack/react-router'

import { AttendanceRequestDetailPage } from '@/features/attendance/pages/requests/attendance-request-detail-page'

export const Route = createFileRoute('/(app)/attendance/requests/$requestId')({
  component: AttendanceRequestDetailPage,
})
