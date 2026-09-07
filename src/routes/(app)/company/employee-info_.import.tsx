import { createFileRoute } from '@tanstack/react-router'

import { ImportEmployeeInformationPage } from '@/features/company/employee-information/pages/import-employee-information-page'

export const Route = createFileRoute('/(app)/company/employee-info_/import')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImportEmployeeInformationPage />
}
