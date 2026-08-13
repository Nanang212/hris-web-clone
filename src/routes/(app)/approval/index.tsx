import { createFileRoute } from '@tanstack/react-router'

import { fetchApprovalRequests } from '@/features/approval/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ApprovalPage } from '@/features/approval/approval-page'

export const Route = createFileRoute('/(app)/approval/')({
  loader: async () => {
    const initialRequests = await fetchApprovalRequests()
    return { initialRequests }
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { initialRequests } = Route.useLoaderData()
  return <ApprovalPage initialRequests={initialRequests} />
}
