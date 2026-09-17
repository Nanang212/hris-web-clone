import { createFileRoute } from '@tanstack/react-router'

import { ClockResultPage } from '@/features/attendance/pages/clock-result-page'

export const Route = createFileRoute('/(app)/attendance/clock-in-success')({
  component: () => <ClockResultPage mode='in' />,
})
