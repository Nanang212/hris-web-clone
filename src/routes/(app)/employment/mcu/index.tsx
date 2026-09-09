import { createFileRoute } from '@tanstack/react-router'

import { EmployeeMcuManagementPage } from '@/features/employment/employee-profile/pages/employee-mcu-management-page'

export const Route = createFileRoute('/(app)/employment/mcu/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeMcuManagementPage />
}
