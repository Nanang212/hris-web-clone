import { createFileRoute } from '@tanstack/react-router'

import { ApprovalPage } from '@/features/approval/approval-page'
import {
  WorkflowError,
  WorkflowLoading,
} from '@/features/settings/approval-workflow/components/feedback'

export const Route = createFileRoute('/(app)/approval/')({
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <ApprovalPage />
}
