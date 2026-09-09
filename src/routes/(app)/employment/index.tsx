import { createFileRoute } from '@tanstack/react-router'

import { EmploymentDashboardPage } from '@/features/employment/employee/pages/employment-dashboard-page'

export const Route = createFileRoute('/(app)/employment/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmploymentDashboardPage />
}
