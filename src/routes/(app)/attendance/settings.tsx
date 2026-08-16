import { createFileRoute } from '@tanstack/react-router'

import { AttendanceSettingsPage } from '@/features/attendance/pages/settings/attendance-settings-page'

export const Route = createFileRoute('/(app)/attendance/settings')({
  component: AttendanceSettingsPage,
})
