import { createFileRoute } from '@tanstack/react-router'

import { SecurityOverviewPage } from '@/features/settings/security/pages/security-overview-page'

export const Route = createFileRoute('/(app)/settings/security/')({
  component: SecurityOverviewPage,
})
