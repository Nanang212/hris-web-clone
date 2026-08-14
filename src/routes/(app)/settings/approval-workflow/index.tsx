import { createFileRoute } from '@tanstack/react-router'

import {
  WorkflowError,
  WorkflowLoading,
} from '@/features/settings/approval-workflow/components/feedback'
import { ApprovalWorkflowListPage } from '@/features/settings/approval-workflow/list/approval-workflow-list-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <ApprovalWorkflowListPage />
}
