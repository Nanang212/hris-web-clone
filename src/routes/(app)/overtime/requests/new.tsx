import { createFileRoute } from '@tanstack/react-router'

import { CreateOvertimeRequestPage } from '@/features/overtime/pages/create-overtime-request-page'

export const Route = createFileRoute('/(app)/overtime/requests/new')({
  component: CreateOvertimeRequestPage,
})
