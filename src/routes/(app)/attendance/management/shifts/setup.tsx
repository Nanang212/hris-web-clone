import { createFileRoute } from '@tanstack/react-router'

import { ShiftSetupPage } from '@/features/attendance/shift-management/pages/shift-setup-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/setup')({
  component: ShiftSetupPage,
})
