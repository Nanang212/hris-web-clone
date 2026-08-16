import { createFileRoute } from '@tanstack/react-router'

import { ManualAttendancePage } from '@/features/attendance/pages/management/manual-attendance-page'

export const Route = createFileRoute('/(app)/attendance/management/manual')({
  component: ManualAttendancePage,
})
