import { createFileRoute } from '@tanstack/react-router'

import { fetchConfigureLevelsData } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ConfigureLevelsPage } from '@/features/approval-workflow/levels/configure-levels-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/levels')({
  loader: async ({ params }) => {
    const data = await fetchConfigureLevelsData(params.id)
    return data
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { workflow, levels } = Route.useLoaderData()
  return <ConfigureLevelsPage workflowId={id} workflow={workflow} levels={levels} />
}
