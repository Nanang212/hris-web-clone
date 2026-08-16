import { createFileRoute } from '@tanstack/react-router'

import { EditRolePage } from '@/features/settings/role-access/pages/edit-role-page'

export const Route = createFileRoute('/(app)/settings/role-access/$roleId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roleId } = Route.useParams()
  return <EditRolePage roleId={roleId} />
}
