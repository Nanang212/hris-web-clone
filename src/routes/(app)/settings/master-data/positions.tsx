import { createFileRoute } from '@tanstack/react-router'
import { PositionsPage } from '@/features/master-data/pages/positions-page'

export const Route = createFileRoute('/(app)/settings/master-data/positions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PositionsPage />
}
