import { createFileRoute } from '@tanstack/react-router'

import { ClockOutPage } from '@/features/attendance/pages/clock-out-page'

export const Route = createFileRoute('/(app)/attendance/clock-out')({
  component: ClockOutPage,
})
