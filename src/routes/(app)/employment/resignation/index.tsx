import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EmploymentResignationPage } from '@/features/employment/resignation/pages/employment-resignation-page'

const searchSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/(app)/employment/resignation/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId, name } = Route.useSearch()
  return (
    <EmploymentResignationPage
      key={`${employeeId}-${name}`}
      preselectedEmployeeId={employeeId}
      preselectedName={name}
    />
  )
}
