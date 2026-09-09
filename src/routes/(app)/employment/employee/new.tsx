import { createFileRoute } from '@tanstack/react-router'

import { EmployeeFormPage } from '@/features/employment/employee/pages/employee-form-page'

export const Route = createFileRoute('/(app)/employment/employee/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EmployeeFormPage mode='create' />
}
