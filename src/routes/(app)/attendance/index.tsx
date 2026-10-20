import { createFileRoute } from '@tanstack/react-router'

import { AttendancePage } from '@/features/attendance/overview/pages/attendance-page'

export const Route = createFileRoute('/(app)/attendance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AttendancePage />
}
