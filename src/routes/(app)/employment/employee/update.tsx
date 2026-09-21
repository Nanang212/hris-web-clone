import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { UpdateEmployeeInformationPage } from '@/features/employment/employee-profile/pages/update-employee-information-page'

export const Route = createFileRoute('/(app)/employment/employee/update')({
  validateSearch: z.object({ id: z.string() }),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useSearch()
  return <UpdateEmployeeInformationPage employeeId={id} />
}
