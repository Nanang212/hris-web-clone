import { createFileRoute } from '@tanstack/react-router'
import { ShiftsPage } from '@/features/master-data/pages/shifts-page'

export const Route = createFileRoute('/(app)/settings/master-data/shifts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ShiftsPage />
}
