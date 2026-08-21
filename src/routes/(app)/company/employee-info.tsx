import { createFileRoute } from '@tanstack/react-router'
import { EmployeeListPage } from '@/features/employment/pages/employee/employee-list-page'

export const Route = createFileRoute('/(app)/company/employee-info')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeListPage />
}
