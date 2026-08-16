import { createFileRoute } from '@tanstack/react-router'

import { LeaveApprovalDetailPage } from '@/features/leave/pages/leave-approval-detail-page'

export const Route = createFileRoute('/(app)/leave/approval/$requestId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaveApprovalDetailPage requestId={Route.useParams().requestId} />
}
