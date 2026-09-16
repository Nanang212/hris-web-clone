import { createFileRoute } from '@tanstack/react-router'

import { SchedulerDetailPage } from '@/features/settings/scheduler/pages/scheduler-detail-page'

export const Route = createFileRoute('/(app)/settings/scheduler/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <SchedulerDetailPage scheduleId={id} />
}
