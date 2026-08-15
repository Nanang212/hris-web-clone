import { createFileRoute } from '@tanstack/react-router'

import { ClockInOutPage } from '@/features/attendance/pages/clock-in-out-page'

export const Route = createFileRoute('/(app)/attendance/clock-in-out')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ClockInOutPage />
}
