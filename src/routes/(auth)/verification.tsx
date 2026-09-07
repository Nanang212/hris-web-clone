import { createFileRoute } from '@tanstack/react-router'

import { VerificationPage } from '@/features/auth/pages/verification-page'

export const Route = createFileRoute('/(auth)/verification')({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token.trim() || undefined : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useSearch()
  return <VerificationPage key={token} token={token} />
}
