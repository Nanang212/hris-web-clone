import { createFileRoute } from '@tanstack/react-router'

import { ClockOutPage } from '@/features/attendance/overview/pages/clock-out-page'

export const Route = createFileRoute('/(app)/attendance/clock-out')({
  component: ClockOutPage,
})
