import { createFileRoute } from '@tanstack/react-router'

import { ClockResultPage } from '@/features/attendance/pages/clock-result-page'

export const Route = createFileRoute('/(app)/attendance/clock-out-success')({
  component: () => <ClockResultPage mode='out' />,
})
