import { createFileRoute } from '@tanstack/react-router'
import { LeaveTypesPage } from '@/features/master-data/pages/leave-types-page'

export const Route = createFileRoute('/(app)/settings/master-data/leave-types')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaveTypesPage />
}
