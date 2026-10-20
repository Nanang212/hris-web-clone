import { createFileRoute } from '@tanstack/react-router'

import { GpsSecurityEventDetailPage } from '@/features/attendance/gps-security/pages/gps-security-event-detail-page'

export const Route = createFileRoute('/(app)/attendance/gps-security/events/$eventId')({
  component: GpsSecurityEventDetailPage,
})
