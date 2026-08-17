import { createFileRoute } from '@tanstack/react-router'

import { OvertimeCalculationPage } from '@/features/overtime/pages/overtime-calculation-page'

export const Route = createFileRoute('/(app)/overtime/calculation/')({
  component: OvertimeCalculationPage,
})
