import { createFileRoute } from '@tanstack/react-router'

import { LeaveHistoryPage } from '@/features/leave/pages/leave-history-page'

export const Route = createFileRoute('/(app)/leave/history')({ component: LeaveHistoryPage })
