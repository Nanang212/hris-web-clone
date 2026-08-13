import { createFileRoute } from '@tanstack/react-router'

import { fetchWorkflowById } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { CreateWorkflowPage } from '@/features/approval-workflow/create/create-workflow-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/')({
  loader: async ({ params }) => {
    const workflow = await fetchWorkflowById(params.id)
    if (!workflow) throw new Error(`Workflow dengan ID "${params.id}" tidak ditemukan`)
    return { workflow }
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { workflow } = Route.useLoaderData()
  return <CreateWorkflowPage mode='edit' workflowId={id} workflow={workflow} />
}
