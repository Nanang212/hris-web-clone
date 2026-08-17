import { createFileRoute } from '@tanstack/react-router'

import { OvertimeCalculationDetailPage } from '@/features/overtime/pages/overtime-calculation-detail-page'

export const Route = createFileRoute('/(app)/overtime/calculation/$requestId')({
  component: OvertimeCalculationDetailPage,
})
