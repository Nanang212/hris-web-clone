import { createFileRoute } from '@tanstack/react-router'
import { ImportPage } from '@/features/master-data/pages/import-page'

export const Route = createFileRoute('/(app)/settings/master-data/import')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ImportPage />
}
