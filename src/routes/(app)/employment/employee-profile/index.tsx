import { createFileRoute } from '@tanstack/react-router'

import { EmployeeInformationPage } from '@/features/employment/employee-profile/pages/employee-information-page'

export const Route = createFileRoute('/(app)/employment/employee-profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeInformationPage />
}
