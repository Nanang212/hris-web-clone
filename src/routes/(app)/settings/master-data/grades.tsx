import { createFileRoute } from '@tanstack/react-router'
import { GradesPage } from '@/features/master-data/pages/grades-page'

export const Route = createFileRoute('/(app)/settings/master-data/grades')({
  component: RouteComponent,
})

function RouteComponent() {
  return <GradesPage />
}
