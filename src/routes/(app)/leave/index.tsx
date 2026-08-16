import { createFileRoute } from '@tanstack/react-router'

import { LeaveOverviewPage } from '@/features/leave/pages/leave-overview-page'

export const Route = createFileRoute('/(app)/leave/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaveOverviewPage />
}
