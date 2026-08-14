import { createFileRoute } from '@tanstack/react-router'
import { DivisionsPage } from '@/features/master-data/pages/divisions-page'

export const Route = createFileRoute('/(app)/settings/master-data/divisions')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DivisionsPage />
}
