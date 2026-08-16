import { createFileRoute } from '@tanstack/react-router'

import { LeaveBalancePage } from '@/features/leave/pages/leave-balance-page'

export const Route = createFileRoute('/(app)/leave/balance')({ component: LeaveBalancePage })
