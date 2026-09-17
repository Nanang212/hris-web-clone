import { createFileRoute } from '@tanstack/react-router'

import { FaceVerificationSettingsPage } from '@/features/attendance/pages/security/face-verification-settings-page'

export const Route = createFileRoute('/(app)/attendance/face-verification-settings')({
  component: FaceVerificationSettingsPage,
})
