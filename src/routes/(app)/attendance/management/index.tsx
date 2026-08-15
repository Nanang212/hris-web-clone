import { createFileRoute } from '@tanstack/react-router'

import { AttendanceManagementPage } from '@/features/attendance/pages/attendance-management-page'

export const Route = createFileRoute('/(app)/attendance/management/')({
  component: AttendanceManagementPage,
})
