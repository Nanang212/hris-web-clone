import { createFileRoute } from '@tanstack/react-router'

import { ManualAttendancePage } from '@/features/attendance/overview/pages/management/manual-attendance-page'

export const Route = createFileRoute('/(app)/attendance/management/manual')({
  component: ManualAttendancePage,
})
