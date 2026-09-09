import { createFileRoute } from '@tanstack/react-router'

import { EmployeeDetailPage } from '@/features/employment/employee/pages/employee-detail-page'

export const Route = createFileRoute('/(app)/employment/employee/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <EmployeeDetailPage id={id} />
}
