import { createFileRoute } from '@tanstack/react-router'

import { OvertimeApprovalPage } from '@/features/overtime/pages/overtime-approval-page'

export const Route = createFileRoute('/(app)/overtime/approval/')({
  component: OvertimeApprovalPage,
})
