import { createFileRoute } from '@tanstack/react-router'

import { ClientDetailPage } from '@/features/company/client/pages/client-detail-page'

export const Route = createFileRoute('/(app)/company/client/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ClientDetailPage clientId={id} />
}
