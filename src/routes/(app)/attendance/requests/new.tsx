import { createFileRoute } from '@tanstack/react-router'

import { AttendanceRequestFormPage } from '@/features/attendance/pages/requests/attendance-request-form-page'

export const Route = createFileRoute('/(app)/attendance/requests/new')({
  component: AttendanceRequestFormPage,
})
