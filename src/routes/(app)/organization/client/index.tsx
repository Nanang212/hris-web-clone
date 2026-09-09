import { createFileRoute } from '@tanstack/react-router'

import { ClientPage } from '@/features/organization/client/pages/client-page'

export const Route = createFileRoute('/(app)/organization/client/')({
  component: ClientPage,
})
