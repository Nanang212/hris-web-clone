import { createFileRoute } from '@tanstack/react-router'

import { FaceVerificationSettingsPage } from '@/features/attendance/face-recognition/pages/face-verification-settings-page'

export const Route = createFileRoute('/(app)/attendance/face-verification-settings')({
  component: FaceVerificationSettingsPage,
})
