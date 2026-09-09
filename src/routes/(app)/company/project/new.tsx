import { createFileRoute } from '@tanstack/react-router'

import { ProjectFormPage } from '@/features/company/project/pages/project-form-page'

export const Route = createFileRoute('/(app)/company/project/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProjectFormPage />
}
