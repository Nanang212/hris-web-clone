import { createFileRoute } from '@tanstack/react-router'

import { UserManagementPage } from '@/features/settings/pages/user-management-page'

export const Route = createFileRoute('/(app)/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <UserManagementPage />
}
