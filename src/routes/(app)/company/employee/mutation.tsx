import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { EmploymentMutationPage } from '@/features/employment/pages/mutation/employment-mutation-page'

const searchSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/(app)/company/employee/mutation')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId, name } = Route.useSearch()
  return (
    <EmploymentMutationPage
      key={`${employeeId}-${name}`}
      preselectedEmployeeId={employeeId}
      preselectedName={name}
    />
  )
}
