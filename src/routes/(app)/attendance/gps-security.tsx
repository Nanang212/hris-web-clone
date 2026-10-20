import { createFileRoute } from '@tanstack/react-router'

import { GpsSecurityPage } from '@/features/attendance/gps-security/pages/gps-security-page'

export const Route = createFileRoute('/(app)/attendance/gps-security')({
  component: GpsSecurityPage,
})
