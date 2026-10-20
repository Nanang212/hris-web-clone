import { createFileRoute } from '@tanstack/react-router'

import { AttendanceSettingsPage } from '@/features/attendance/settings/pages/attendance-settings-page'

export const Route = createFileRoute('/(app)/attendance/settings')({
  component: AttendanceSettingsPage,
})
