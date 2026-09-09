import { createFileRoute } from '@tanstack/react-router'

import { PositionPage } from '@/features/organization/position/pages/position-page'

export const Route = createFileRoute('/(app)/organization/position/')({
  component: PositionPage,
})
