import { createFileRoute } from '@tanstack/react-router'
import { CreateContractPage } from '@/features/employment/pages/contract/create-contract-page'

export const Route = createFileRoute('/(app)/company/employee/contract/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateContractPage />
}
