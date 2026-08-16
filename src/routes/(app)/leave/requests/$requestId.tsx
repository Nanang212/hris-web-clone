import { createFileRoute } from '@tanstack/react-router'

import { LeaveRequestDetailPage } from '@/features/leave/pages/leave-request-detail-page'

export const Route = createFileRoute('/(app)/leave/requests/$requestId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaveRequestDetailPage requestId={Route.useParams().requestId} />
}
