import { createFileRoute } from '@tanstack/react-router'

import { ExportEmployeeInformationPage } from '@/features/company/employee-information/pages/export-employee-information-page'

export const Route = createFileRoute('/(app)/company/employee-info_/export')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ExportEmployeeInformationPage />
}
