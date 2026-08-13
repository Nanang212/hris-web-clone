import { DashboardCustomizePage } from '@/features/dashboard/widgets/dashboard-customize-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/(dashboard)/dashboard/customize')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DashboardCustomizePage />
}
