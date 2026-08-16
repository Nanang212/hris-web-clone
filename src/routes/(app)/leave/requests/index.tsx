import { createFileRoute } from '@tanstack/react-router'

import { LeaveRequestsPage } from '@/features/leave/pages/leave-requests-page'

export const Route = createFileRoute('/(app)/leave/requests/')({ component: LeaveRequestsPage })
