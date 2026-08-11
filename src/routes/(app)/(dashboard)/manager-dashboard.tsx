import { ManagerDashboardPage } from '@/features/dashboard/pages/manager-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'
import { fetchDashboard } from '@/features/dashboard/api'
import { DashboardLoading, DashboardError } from '@/features/dashboard/components/dashboard-feedback'

export const Route = createFileRoute('/(app)/(dashboard)/manager-dashboard')({
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
