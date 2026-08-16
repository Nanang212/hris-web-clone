import { createFileRoute } from '@tanstack/react-router'

import { WorkingCalendarPage } from '@/features/attendance/pages/settings/working-calendar-page'

export const Route = createFileRoute('/(app)/attendance/calendar/')({
  component: WorkingCalendarPage,
})
