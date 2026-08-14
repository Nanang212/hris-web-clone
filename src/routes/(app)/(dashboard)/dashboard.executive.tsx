import { createFileRoute } from '@tanstack/react-router'

import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { ExecutiveDashboardPage } from '@/features/dashboard/executive/executive-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/executive')({
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <ExecutiveDashboardPage />
}
