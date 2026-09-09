import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { OrganizationPage } from '@/features/company/organization/pages/organization-page'

const searchSchema = z.object({
  tab: z.enum(['structure', 'department', 'division', 'section']).optional(),
})

export const Route = createFileRoute('/(app)/company/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { tab } = Route.useSearch()
  return <OrganizationPage tab={tab} />
}
