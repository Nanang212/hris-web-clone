import { createFileRoute } from '@tanstack/react-router'

import { CreateLeaveRequestPage } from '@/features/leave/pages/create-leave-request-page'

export const Route = createFileRoute('/(app)/leave/requests/new')({
  component: CreateLeaveRequestPage,
})
