import { createFileRoute } from '@tanstack/react-router'
import { PayrollComponentsPage } from '@/features/master-data/pages/payroll-components-page'

export const Route = createFileRoute('/(app)/settings/master-data/payroll-components')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PayrollComponentsPage />
}
