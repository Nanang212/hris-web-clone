import { createFileRoute } from '@tanstack/react-router'
import { ClaimManagementPage } from '@/features/travel-expense/claim/pages/claim-management-page'

export const Route = createFileRoute('/(app)/travel-expense/claim/')({
  component: ClaimManagementPage,
})
