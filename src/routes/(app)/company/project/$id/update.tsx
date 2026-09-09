import { createFileRoute } from '@tanstack/react-router'

import { ProjectFormPage } from '@/features/company/project/pages/project-form-page'

export const Route = createFileRoute('/(app)/company/project/$id/update')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ProjectFormPage projectId={id} />
}
