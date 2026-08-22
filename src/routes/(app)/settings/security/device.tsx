import { createFileRoute } from '@tanstack/react-router'

import { DeviceSecurityPage } from '@/features/settings/security/pages/device-security-page'

export const Route = createFileRoute('/(app)/settings/security/device')({
  component: DeviceSecurityPage,
})
