import { createFileRoute } from '@tanstack/react-router'

import { LockedAccountsPage } from '@/features/settings/security/pages/locked-accounts-page'

export const Route = createFileRoute('/(app)/settings/security/password_/locked-accounts')({
  component: LockedAccountsPage,
})
