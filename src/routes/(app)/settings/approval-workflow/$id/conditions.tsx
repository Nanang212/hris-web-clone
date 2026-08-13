import { createFileRoute } from '@tanstack/react-router'

import { fetchConditionsData } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ConditionsRoutingPage } from '@/features/approval-workflow/conditions/conditions-routing-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/conditions')({
  loader: async ({ params }) => {
    const data = await fetchConditionsData(params.id)
    return data
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { workflow, rules } = Route.useLoaderData()
  return <ConditionsRoutingPage workflowId={id} workflow={workflow} rules={rules} />
}
