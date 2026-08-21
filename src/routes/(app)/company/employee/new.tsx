import { createFileRoute } from '@tanstack/react-router'

import { EmployeeFormPage } from '@/features/employment/pages/employee/employee-form-page'

export const Route = createFileRoute('/(app)/company/employee/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeFormPage mode='create' />
}
