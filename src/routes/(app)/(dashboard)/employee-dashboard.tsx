import { EmployeeDashboardPage } from '@/features/dashboard/pages/employee-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/(dashboard)/employee-dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeDashboardPage />
}
