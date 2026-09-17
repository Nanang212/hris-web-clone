import { createFileRoute } from '@tanstack/react-router'

import { LiveAttendancePage } from '@/features/attendance/pages/management/live-attendance-page'

export const Route = createFileRoute('/(app)/attendance/management/live')({
  component: LiveAttendancePage,
})
