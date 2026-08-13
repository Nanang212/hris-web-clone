import { createFileRoute } from '@tanstack/react-router'

import { fetchDashboard } from '@/features/dashboard/api'
import {
  DashboardError,
  DashboardLoading,
} from '@/features/dashboard/components/dashboard-feedback'
import { EmployeeDashboardPage } from '@/features/dashboard/employee/employee-dashboard-page'

export const Route = createFileRoute('/(app)/(dashboard)/')({
  loader: async () => {
    const data = await fetchDashboard({ role: 'EMPLOYEE' })
    return data.employeeDashboard
  },
  pendingComponent: DashboardLoading,
  errorComponent: ({ error, reset }) => <DashboardError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <EmployeeDashboardPage data={data} />
}
