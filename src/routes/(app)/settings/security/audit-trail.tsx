import { createFileRoute } from '@tanstack/react-router'

import { AuditTrailPage } from '@/features/settings/security/pages/audit-trail-page'

export const Route = createFileRoute('/(app)/settings/security/audit-trail')({
  component: AuditTrailPage,
})
