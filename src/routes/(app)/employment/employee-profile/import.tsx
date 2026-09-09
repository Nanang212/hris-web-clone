import { createFileRoute } from '@tanstack/react-router'

import { ImportEmployeeInformationPage } from '@/features/employment/employee-profile/pages/import-employee-information-page'

export const Route = createFileRoute('/(app)/employment/employee-profile/import')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImportEmployeeInformationPage />
}
