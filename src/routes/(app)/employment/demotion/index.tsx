import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EmploymentDemotionPage } from '@/features/employment/demotion/pages/employment-demotion-page'

const searchSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/(app)/employment/demotion/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId, name } = Route.useSearch()
  return (
    <EmploymentDemotionPage
      key={`${employeeId}-${name}`}
      preselectedEmployeeId={employeeId}
      preselectedName={name}
    />
  )
}
