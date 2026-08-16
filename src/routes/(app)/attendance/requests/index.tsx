import { createFileRoute } from '@tanstack/react-router'

import { AttendanceRequestsPage } from '@/features/attendance/pages/requests/attendance-requests-page'

export const Route = createFileRoute('/(app)/attendance/requests/')({
  component: AttendanceRequestsPage,
})
