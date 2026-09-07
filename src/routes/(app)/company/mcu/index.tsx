import { createFileRoute } from '@tanstack/react-router'
import { EmployeeMcuManagementPage } from '@/features/company/employee-information/pages/employee-mcu-management-page'

export const Route = createFileRoute('/(app)/company/mcu/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeMcuManagementPage />
}
