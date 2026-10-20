import { createFileRoute } from '@tanstack/react-router'

import { AttendanceRequestDetailPage } from '@/features/attendance/overview/pages/requests/attendance-request-detail-page'

export const Route = createFileRoute('/(app)/attendance/requests/$requestId')({
  component: AttendanceRequestDetailPage,
})
