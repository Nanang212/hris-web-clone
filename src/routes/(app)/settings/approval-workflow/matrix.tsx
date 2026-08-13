import { createFileRoute } from '@tanstack/react-router'

import { fetchApprovalMatrix } from '@/features/approval-workflow/api'
import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ApprovalMatrixPage } from '@/features/approval-workflow/matrix/approval-matrix-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/matrix')({
  loader: async () => {
    const entries = await fetchApprovalMatrix()
    return { entries }
  },
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const { entries } = Route.useLoaderData()
  return <ApprovalMatrixPage entries={entries} />
}
