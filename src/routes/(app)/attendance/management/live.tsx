import { createFileRoute } from '@tanstack/react-router'

import { LiveAttendancePage } from '@/features/attendance/overview/pages/management/live-attendance-page'

export const Route = createFileRoute('/(app)/attendance/management/live')({
  component: LiveAttendancePage,
})
