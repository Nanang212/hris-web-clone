import { createFileRoute } from '@tanstack/react-router'

import { ExecutionHistoryPage } from '@/features/settings/scheduler/pages/execution-history-page'

export const Route = createFileRoute('/(app)/settings/scheduler/$id/history')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ExecutionHistoryPage scheduleId={id} />
}
