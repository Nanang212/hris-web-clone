import { createFileRoute } from '@tanstack/react-router'

import { AttendanceLocationsPage } from '@/features/attendance/pages/locations/attendance-locations-page'

export const Route = createFileRoute('/(app)/attendance/locations/')({
  component: AttendanceLocationsPage,
})
