import { createFileRoute } from '@tanstack/react-router'

import { PasswordPolicyPage } from '@/features/settings/security/pages/password-policy-page'

export const Route = createFileRoute('/(app)/settings/security/password')({
  component: PasswordPolicyPage,
})
