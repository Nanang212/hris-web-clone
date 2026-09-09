import { createFileRoute } from '@tanstack/react-router'

import { UnitSectionPage } from '@/features/organization/unit/pages/unit-section-page'

export const Route = createFileRoute('/(app)/organization/unit/section')({
  component: UnitSectionPage,
})
