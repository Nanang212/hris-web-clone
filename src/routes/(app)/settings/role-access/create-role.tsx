import { createFileRoute } from '@tanstack/react-router'

import { CreateRolePage } from '@/features/settings/role-access/pages/create-role-page'

export const Route = createFileRoute('/(app)/settings/role-access/create-role')({
  component: CreateRolePage,
})
