import { createFileRoute } from '@tanstack/react-router'

import { EmploymentDashboardPage } from '@/features/employment/pages/employment-dashboard-page'

export const Route = createFileRoute('/(app)/company/employee/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmploymentDashboardPage />
}
