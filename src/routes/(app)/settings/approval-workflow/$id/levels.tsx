import { createFileRoute } from '@tanstack/react-router'

import {
  WorkflowError,
  WorkflowLoading,
} from '@/features/settings/approval-workflow/components/feedback'
import { ConfigureLevelsPage } from '@/features/settings/approval-workflow/levels/configure-levels-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/$id/levels')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ConfigureLevelsPage workflowId={id} />
}
