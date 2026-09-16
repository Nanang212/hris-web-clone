import { createFileRoute } from '@tanstack/react-router'

import { ExecutionDetailPage } from '@/features/settings/scheduler/pages/execution-detail-page'

export const Route = createFileRoute(
  '/(app)/settings/scheduler/$id/execution/$runId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { id, runId } = Route.useParams()
  return <ExecutionDetailPage scheduleId={id} runId={runId} />
}
