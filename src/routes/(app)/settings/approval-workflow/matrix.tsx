import { createFileRoute } from '@tanstack/react-router'

import { WorkflowError, WorkflowLoading } from '@/features/approval-workflow/components/feedback'
import { ApprovalMatrixPage } from '@/features/approval-workflow/matrix/approval-matrix-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/matrix')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <ApprovalMatrixPage />
}
