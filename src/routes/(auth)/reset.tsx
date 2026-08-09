import { createFileRoute } from '@tanstack/react-router'

import { ResetPage } from '@/features/auth/pages/reset-page'

export const Route = createFileRoute('/(auth)/reset')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ResetPage />
}
