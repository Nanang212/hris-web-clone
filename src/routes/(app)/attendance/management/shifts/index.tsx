import { createFileRoute } from '@tanstack/react-router'

import { ShiftSchedulePage } from '@/features/attendance/pages/shifts/shift-schedule-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/')({
  component: ShiftSchedulePage,
})
