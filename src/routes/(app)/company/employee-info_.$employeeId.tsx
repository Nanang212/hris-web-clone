import { createFileRoute } from '@tanstack/react-router'

import { EmployeeInformationDetailPage } from '@/features/company/employee-information/pages/employee-information-detail-page'

export const Route = createFileRoute('/(app)/company/employee-info_/$employeeId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId } = Route.useParams()
  return <EmployeeInformationDetailPage employeeId={employeeId} />
}
