import { createFileRoute } from '@tanstack/react-router'
import { OrganizationPage } from '@/features/company/organization/pages/organization-page'

export const Route = createFileRoute('/(app)/company/organization/')({
  component: OrganizationPage,
})
