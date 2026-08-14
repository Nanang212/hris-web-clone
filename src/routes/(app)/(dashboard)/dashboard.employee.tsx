import { createFileRoute } from '@tanstack/react-router'

import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { EmployeeDashboardPage } from '@/features/dashboard/employee/employee-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/employee')({
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeDashboardPage />
}
