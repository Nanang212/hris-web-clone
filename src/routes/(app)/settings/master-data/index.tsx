import { createFileRoute } from '@tanstack/react-router'
import { MasterDataDashboardPage } from '@/features/master-data/pages/master-data-dashboard-page'

export const Route = createFileRoute('/(app)/settings/master-data/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MasterDataDashboardPage />
}
