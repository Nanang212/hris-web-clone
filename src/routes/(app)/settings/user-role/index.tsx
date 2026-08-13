import { createFileRoute } from '@tanstack/react-router'

import UserRolePage from '@/features/settings/user-role/user-role-page'

export const Route = createFileRoute('/(app)/settings/user-role/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserRolePage />
}
