import { createFileRoute } from '@tanstack/react-router'

import { FaceResetManagementPage } from '@/features/attendance/face-recognition/pages/face-reset-management-page'

export const Route = createFileRoute('/(app)/attendance/face-reset')({
  component: FaceResetManagementPage,
})
