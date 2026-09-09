import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { EmployeeFormPage } from '@/features/employment/employee/pages/employee-form-page'

export const Route = createFileRoute('/(app)/employment/employee/update')({
  validateSearch: z.object({ id: z.string() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useSearch()
  return <EmployeeFormPage mode='update' employeeId={id} />
}
