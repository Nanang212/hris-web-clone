import { createFileRoute } from '@tanstack/react-router'

import { ProjectDetailPage } from '@/features/company/project/pages/project-detail-page'

export const Route = createFileRoute('/(app)/company/project/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ProjectDetailPage projectId={id} />
}
