import { createFileRoute } from '@tanstack/react-router'

import { AttendanceHistoryPage } from '@/features/attendance/pages/attendance-history-page'

export const Route = createFileRoute('/(app)/attendance/history')({
  component: AttendanceHistoryPage,
})
