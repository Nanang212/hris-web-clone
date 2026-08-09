import { createFileRoute } from '@tanstack/react-router'

import { VerificationPage } from '@/features/auth/pages/verification-page'

export const Route = createFileRoute('/(auth)/verification')({
  component: RouteComponent,
})

function RouteComponent() {
  return <VerificationPage />
}
