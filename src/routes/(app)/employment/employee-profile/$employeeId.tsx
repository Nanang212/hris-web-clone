import { createFileRoute } from '@tanstack/react-router'

import { EmployeeInformationDetailPage } from '@/features/employment/employee-profile/pages/employee-information-detail-page'

export const Route = createFileRoute('/(app)/employment/employee-profile/$employeeId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId } = Route.useParams()
  return <EmployeeInformationDetailPage employeeId={employeeId} />
}
