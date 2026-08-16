import { createFileRoute } from '@tanstack/react-router'

import { ShiftSwapRequestsPage } from '@/features/attendance/pages/shifts/shift-swap-requests-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/swaps')({
  component: ShiftSwapRequestsPage,
})
