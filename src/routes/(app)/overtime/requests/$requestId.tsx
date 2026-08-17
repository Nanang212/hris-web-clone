import { createFileRoute } from '@tanstack/react-router'

import { OvertimeRequestDetailPage } from '@/features/overtime/pages/overtime-request-detail-page'

export const Route = createFileRoute('/(app)/overtime/requests/$requestId')({
  component: OvertimeRequestDetailPage,
})
