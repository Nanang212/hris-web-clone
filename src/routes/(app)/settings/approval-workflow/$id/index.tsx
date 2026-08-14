import { createFileRoute } from '@tanstack/react-router'

import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { CreateWorkflowPage } from '@/features/approval-workflow/create/create-workflow-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <CreateWorkflowPage mode='edit' workflowId={id} />
}
