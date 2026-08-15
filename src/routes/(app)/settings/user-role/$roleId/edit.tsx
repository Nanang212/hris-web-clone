import { createFileRoute } from '@tanstack/react-router'

import { EditRolePage } from '@/features/settings/user-role/pages/edit-role-page'

export const Route = createFileRoute('/(app)/settings/user-role/$roleId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <EditRolePage roleId={roleId} />
}
