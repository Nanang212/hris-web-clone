import { createFileRoute } from '@tanstack/react-router'

import { AttendanceManagementPage } from '@/features/attendance/pages/management/attendance-management-page'

export const Route = createFileRoute('/(app)/attendance/management/')({
  component: AttendanceManagementPage,
})
