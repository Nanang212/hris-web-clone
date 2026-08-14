import { createFileRoute } from '@tanstack/react-router'
import { DepartmentsPage } from '@/features/master-data/pages/departments-page'

export const Route = createFileRoute('/(app)/settings/master-data/departments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <DepartmentsPage />
}
