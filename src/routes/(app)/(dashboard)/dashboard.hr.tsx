import { createFileRoute } from '@tanstack/react-router'

import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { HrDashboardPage } from '@/features/dashboard/hr/hr-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/hr')({
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <HrDashboardPage />
}
