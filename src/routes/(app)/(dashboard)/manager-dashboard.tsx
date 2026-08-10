import { ManagerDashboardPage } from '@/features/dashboard/pages/manager-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/(dashboard)/manager-dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManagerDashboardPage />
}
