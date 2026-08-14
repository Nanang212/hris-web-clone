import { createFileRoute } from '@tanstack/react-router'

import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ConditionsRoutingPage } from '@/features/approval-workflow/conditions/conditions-routing-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/conditions')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ConditionsRoutingPage workflowId={id} />
}
