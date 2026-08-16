import { createFileRoute } from '@tanstack/react-router'

import { LeaveApprovalPage } from '@/features/leave/pages/leave-approval-page'

export const Route = createFileRoute('/(app)/leave/approval/')({ component: LeaveApprovalPage })
