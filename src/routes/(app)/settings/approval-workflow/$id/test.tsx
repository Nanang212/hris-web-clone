import { createFileRoute } from '@tanstack/react-router'

import { fetchTestPageData } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { TestWorkflowPage } from '@/features/approval-workflow/test/test-workflow-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/test')({
  loader: async ({ params }) => {
    const data = await fetchTestPageData(params.id)
    return data
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { workflow } = Route.useLoaderData()
  return <TestWorkflowPage workflowId={id} workflow={workflow} />
}
