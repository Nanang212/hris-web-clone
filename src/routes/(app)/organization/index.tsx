import { createFileRoute } from '@tanstack/react-router'

import { UnitStructurePage } from '@/features/organization/unit/pages/unit-structure-page'

export const Route = createFileRoute('/(app)/organization/')({
  component: UnitStructurePage,
})
