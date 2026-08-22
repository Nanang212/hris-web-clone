import { createFileRoute } from '@tanstack/react-router'

import { RegisterDevicePage } from '@/features/settings/security/pages/register-device-page'

export const Route = createFileRoute('/(app)/settings/security/device_/register')({
  component: RegisterDevicePage,
})
