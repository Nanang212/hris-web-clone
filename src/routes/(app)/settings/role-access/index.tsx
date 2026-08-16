import { createFileRoute } from '@tanstack/react-router'

import RoleAccessPage from '@/features/settings/role-access/pages/role-access-page'

export const Route = createFileRoute('/(app)/settings/role-access/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RoleAccessPage />
}
