import { createFileRoute } from '@tanstack/react-router'

import { fetchDashboard } from '@/features/dashboard/api'
import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { ManagerDashboardPage } from '@/features/dashboard/manager/manager-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/manager')({
  loader: async () => {
    const data = await fetchDashboard({ role: 'MANAGER' })
    return data.managerDashboard
  },
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <ManagerDashboardPage data={data} />
}
