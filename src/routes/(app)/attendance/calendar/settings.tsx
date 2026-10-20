import { createFileRoute } from '@tanstack/react-router'

import { CalendarSettingsPage } from '@/features/attendance/working-calendar/pages/calendar-settings-page'

export const Route = createFileRoute('/(app)/attendance/calendar/settings')({
  component: CalendarSettingsPage,
})
