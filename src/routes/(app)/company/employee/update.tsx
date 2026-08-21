import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EmployeeFormPage } from '@/features/employment/pages/employee/employee-form-page'

export const Route = createFileRoute('/(app)/company/employee/update')({
  validateSearch: z.object({ id: z.string() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useSearch()
  return <EmployeeFormPage mode='update' employeeId={id} />
}
