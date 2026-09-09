import { createFileRoute } from '@tanstack/react-router'

import { ClientPage } from '@/features/company/client/pages/client-page'

export const Route = createFileRoute('/(app)/company/client/')({
  component: ClientPage,
})
