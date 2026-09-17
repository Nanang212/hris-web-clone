import { createFileRoute } from '@tanstack/react-router'

import { FaceResetManagementPage } from '@/features/attendance/pages/security/face-reset-management-page'

export const Route = createFileRoute('/(app)/attendance/face-reset')({
  component: FaceResetManagementPage,
})
