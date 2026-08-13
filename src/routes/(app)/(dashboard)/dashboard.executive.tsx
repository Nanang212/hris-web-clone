import { ExecutiveDashboardPage } from '@/features/dashboard/executive/executive-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'
import { fetchDashboard } from '@/features/dashboard/api'
import { DashboardLoading, DashboardError } from '@/features/dashboard/components/dashboard-feedback'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/executive')({
  loader: async () => {
    const data = await fetchDashboard({ role: 'EXECUTIVE' })
    return data.executiveDashboard
  },
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <ExecutiveDashboardPage data={data} />
}
