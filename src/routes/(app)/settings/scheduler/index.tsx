import { createFileRoute } from '@tanstack/react-router'

import { SchedulerError, SchedulerLoading } from '@/features/settings/scheduler/components/feedback'
import { SchedulerPage } from '@/features/settings/scheduler/pages/scheduler-page'

export const Route = createFileRoute('/(app)/settings/scheduler/')({
  pendingComponent: SchedulerLoading,
  errorComponent: ({ error, reset }) => <SchedulerError error={error} reset={reset} />,
  component: RouteComponent,
})

function RouteComponent() {
  return <SchedulerPage />
}
