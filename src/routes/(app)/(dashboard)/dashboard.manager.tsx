import { createFileRoute } from '@tanstack/react-router'

import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { ManagerDashboardPage } from '@/features/dashboard/manager/manager-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/manager')({
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <ManagerDashboardPage />
}
