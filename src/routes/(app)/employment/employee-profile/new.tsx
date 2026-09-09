import { createFileRoute } from '@tanstack/react-router'

import { CreateEmployeeInformationPage } from '@/features/employment/employee-profile/pages/create-employee-information-page'

export const Route = createFileRoute('/(app)/employment/employee-profile/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateEmployeeInformationPage />
}
