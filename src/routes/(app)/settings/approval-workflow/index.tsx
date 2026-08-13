import { createFileRoute } from '@tanstack/react-router'

import { fetchWorkflows } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ApprovalWorkflowListPage } from '@/features/approval-workflow/list/approval-workflow-list-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/')({
  loader: async () => {
    const workflows = await fetchWorkflows()
    return { workflows }
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { workflows } = Route.useLoaderData()
  return <ApprovalWorkflowListPage workflows={workflows} />
}
