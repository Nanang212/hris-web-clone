import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EmploymentRotationPage } from '@/features/employment/rotation/pages/employment-rotation-page'

const searchSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/(app)/employment/rotation/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId, name } = Route.useSearch()
  return (
    <EmploymentRotationPage
      key={`${employeeId}-${name}`}
      preselectedEmployeeId={employeeId}
      preselectedName={name}
    />
  )
}
