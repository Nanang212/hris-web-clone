import { createFileRoute } from '@tanstack/react-router'

import { CreateEmployeeInformationPage } from '@/features/company/employee-information/pages/create-employee-information-page'

export const Route = createFileRoute('/(app)/company/employee-info_/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateEmployeeInformationPage />
}
