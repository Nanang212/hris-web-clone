import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ApprovalPage } from '@/features/approval/approval-page'
import {
  WorkflowError,
  WorkflowLoading,
} from '@/features/settings/approval-workflow/components/feedback'

const approvalSearchSchema = z.object({
  tab: z.string().optional(),
  status: z.enum(['all', 'pending', 'approved', 'rejected']).optional(),
})

export const Route = createFileRoute('/(app)/approval/')({
  validateSearch: approvalSearchSchema,
  pendingComponent: WorkflowLoading,
  errorComponent: ({ error, reset }) => <WorkflowError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  return (
    <ApprovalPage
      key={`${search.tab}-${search.status}`}
      initialTab={search.tab}
      initialStatus={search.status}
    />
  )
}
