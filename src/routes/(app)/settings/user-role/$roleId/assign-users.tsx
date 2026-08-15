import { createFileRoute } from '@tanstack/react-router'

import { UserAssignmentPage } from '@/features/settings/user-role/pages/user-assignment-page'

export const Route = createFileRoute('/(app)/settings/user-role/$roleId/assign-users')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <UserAssignmentPage roleId={roleId} />
}
