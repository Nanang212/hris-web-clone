import { createFileRoute } from '@tanstack/react-router'

import { RegisteredDevicesPage } from '@/features/settings/security/pages/registered-devices-page'

export const Route = createFileRoute('/(app)/settings/security/device_/registered-devices')({
  component: RegisteredDevicesPage,
})
