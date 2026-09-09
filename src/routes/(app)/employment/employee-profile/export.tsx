import { createFileRoute } from '@tanstack/react-router'

import { ExportEmployeeInformationPage } from '@/features/employment/employee-profile/pages/export-employee-information-page'

export const Route = createFileRoute('/(app)/employment/employee-profile/export')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ExportEmployeeInformationPage />
}
