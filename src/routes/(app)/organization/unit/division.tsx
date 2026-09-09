import { createFileRoute } from '@tanstack/react-router'

import { UnitDivisionPage } from '@/features/organization/unit/pages/unit-division-page'

export const Route = createFileRoute('/(app)/organization/unit/division')({
  component: UnitDivisionPage,
})
