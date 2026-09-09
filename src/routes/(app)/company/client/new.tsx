import { createFileRoute } from '@tanstack/react-router'

import { ClientFormPage } from '@/features/company/client/pages/client-form-page'

export const Route = createFileRoute('/(app)/company/client/new')({
  component: ClientFormPage,
})
