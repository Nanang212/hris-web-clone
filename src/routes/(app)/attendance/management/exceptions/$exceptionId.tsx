import { createFileRoute } from '@tanstack/react-router'

import { AttendanceExceptionDetailPage } from '@/features/attendance/pages/management/attendance-exception-detail-page'

export const Route = createFileRoute('/(app)/attendance/management/exceptions/$exceptionId')({
  component: AttendanceExceptionDetailPage,
})
