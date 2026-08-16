import { createFileRoute } from '@tanstack/react-router'

import { FaceRecognitionPage } from '@/features/attendance/pages/security/face-recognition-page'

export const Route = createFileRoute('/(app)/attendance/face-recognition')({
  component: FaceRecognitionPage,
})
