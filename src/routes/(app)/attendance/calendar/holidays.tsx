import { createFileRoute } from '@tanstack/react-router'

import { PublicHolidaysPage } from '@/features/attendance/working-calendar/pages/public-holidays-page'

export const Route = createFileRoute('/(app)/attendance/calendar/holidays')({
  component: PublicHolidaysPage,
})
