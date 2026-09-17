import { createFileRoute } from '@tanstack/react-router'

import { ShiftSwapDetailPage } from '@/features/attendance/pages/shifts/shift-swap-detail-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/swaps/$swapId')({
  component: ShiftSwapDetailPage,
})
