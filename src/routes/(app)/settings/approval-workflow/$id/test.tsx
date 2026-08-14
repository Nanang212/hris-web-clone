import { createFileRoute } from '@tanstack/react-router'

import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { TestWorkflowPage } from '@/features/approval-workflow/test/test-workflow-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/test')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <TestWorkflowPage workflowId={id} />
}
