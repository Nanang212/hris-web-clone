import { createFileRoute } from '@tanstack/react-router'

import { ChangeDeviceRequestsPage } from '@/features/settings/security/pages/change-device-requests-page'

export const Route = createFileRoute('/(app)/settings/security/device_/change-requests')({
  component: ChangeDeviceRequestsPage,
})
