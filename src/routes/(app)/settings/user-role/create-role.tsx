import { createFileRoute } from '@tanstack/react-router'

import { CreateRolePage } from '@/features/settings/user-role/create-role-page'

export const Route = createFileRoute('/(app)/settings/user-role/create-role')({
  component: CreateRolePage,
})
