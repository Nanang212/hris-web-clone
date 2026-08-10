import { ExecutiveDashboardPage } from '@/features/dashboard/pages/executive-dashboard-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/(dashboard)/executive-dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ExecutiveDashboardPage />
}
