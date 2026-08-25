import { createFileRoute } from '@tanstack/react-router'

import { DeviceBindingPolicyPage } from '@/features/settings/security/pages/device-binding-policy-page'

export const Route = createFileRoute('/(app)/settings/security/device_/binding-policy')({
  component: DeviceBindingPolicyPage,
})
