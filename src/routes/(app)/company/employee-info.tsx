import { createFileRoute } from '@tanstack/react-router'
import { EmployeeInformationPage } from '@/features/company/employee-information/pages/employee-information-page'

export const Route = createFileRoute('/(app)/company/employee-info')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeInformationPage />
}
