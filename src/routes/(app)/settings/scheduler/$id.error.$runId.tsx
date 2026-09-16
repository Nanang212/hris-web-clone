import { createFileRoute } from '@tanstack/react-router'

import { ExecutionErrorLogPage } from '@/features/settings/scheduler/pages/execution-error-log-page'

export const Route = createFileRoute(
  '/(app)/settings/scheduler/$id/error/$runId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { id, runId } = Route.useParams()
  return <ExecutionErrorLogPage scheduleId={id} runId={runId} />
}
