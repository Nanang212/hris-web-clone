import { createFileRoute } from '@tanstack/react-router'

import { CalendarSettingsPage } from '@/features/attendance/pages/settings/working-calendar-page'

export const Route = createFileRoute('/(app)/attendance/calendar/settings')({
  component: CalendarSettingsPage,
})
