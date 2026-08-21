import { createFileRoute } from '@tanstack/react-router'

import { EmployeeDetailPage } from '@/features/employment/pages/employee/employee-detail-page'

export const Route = createFileRoute('/(app)/company/employee/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <EmployeeDetailPage id={id} />
}
