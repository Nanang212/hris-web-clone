import { createFileRoute } from '@tanstack/react-router'

import { FaceEnrollmentDetailPage } from '@/features/attendance/pages/security/face-enrollment-detail-page'

export const Route = createFileRoute('/(app)/attendance/face-enrollment/$employeeId')({
  component: FaceEnrollmentDetailPage,
})
