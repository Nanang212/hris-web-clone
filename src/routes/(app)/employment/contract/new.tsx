import { createFileRoute } from '@tanstack/react-router'

import { CreateContractPage } from '@/features/employment/contract/pages/create-contract-page'

export const Route = createFileRoute('/(app)/employment/contract/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateContractPage />
}
