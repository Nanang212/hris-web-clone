import { createFileRoute } from '@tanstack/react-router'

import { ShiftVsActualPage } from '@/features/attendance/shift-management/pages/shift-vs-actual-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/vs-actual')({
  component: ShiftVsActualPage,
})
