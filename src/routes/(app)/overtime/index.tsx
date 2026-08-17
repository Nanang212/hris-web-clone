import { createFileRoute } from '@tanstack/react-router'

import { OvertimeOverviewPage } from '@/features/overtime/pages/overtime-overview-page'

export const Route = createFileRoute('/(app)/overtime/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OvertimeOverviewPage />
}
