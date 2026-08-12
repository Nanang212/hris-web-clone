import { DashboardPage } from '@/features/dashboard/hr/hr-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'
import { fetchDashboard } from '@/features/dashboard/api'
import { DashboardLoading, DashboardError } from '@/features/dashboard/components/dashboard-feedback'

export const Route = createFileRoute('/(app)/(dashboard)/')({
  loader: async () => {
    const data = await fetchDashboard({ role: 'HR' })
    return data.hrDashboard
  },
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <DashboardPage data={data} />
}
