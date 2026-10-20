import { createFileRoute } from '@tanstack/react-router'

import { WorkingCalendarPage } from '@/features/attendance/working-calendar/pages/working-calendar-page'

export const Route = createFileRoute('/(app)/attendance/calendar/')({
  component: WorkingCalendarPage,
})
