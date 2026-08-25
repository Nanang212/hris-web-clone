import { createFileRoute } from '@tanstack/react-router'

import { SessionManagementPage } from '@/features/settings/security/pages/session-management-page'

export const Route = createFileRoute('/(app)/settings/security/session')({
  component: SessionManagementPage,
})
