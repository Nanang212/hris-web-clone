import { createFileRoute } from '@tanstack/react-router'

import { ShiftSwapDetailPage } from '@/features/attendance/shift-management/pages/shift-swap-detail-page'

export const Route = createFileRoute('/(app)/attendance/management/shifts/swaps/$swapId')({
  component: ShiftSwapDetailPage,
})
