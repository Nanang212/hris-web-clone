import { createFileRoute } from '@tanstack/react-router'

import { PublicHolidaysPage } from '@/features/attendance/pages/settings/public-holidays-page'

export const Route = createFileRoute('/(app)/attendance/calendar/holidays')({
  component: PublicHolidaysPage,
})
