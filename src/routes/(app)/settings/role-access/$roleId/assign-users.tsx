import { createFileRoute } from '@tanstack/react-router'

import { UserAssignmentPage } from '@/features/settings/role-access/pages/user-assignment-page'

export const Route = createFileRoute('/(app)/settings/role-access/$roleId/assign-users')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <UserAssignmentPage roleId={roleId} />
}
