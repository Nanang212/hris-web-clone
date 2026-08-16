import { createFileRoute } from '@tanstack/react-router'

import { ShiftAssignmentsPage } from '@/features/attendance/pages/shifts/shift-assignments-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/assignments')({
  component: ShiftAssignmentsPage,
})
