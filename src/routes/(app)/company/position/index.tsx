import { createFileRoute } from '@tanstack/react-router'

import { PositionPage } from '@/features/company/position/pages/position-page'

export const Route = createFileRoute('/(app)/company/position/')({
  component: PositionPage,
})
