import { createFileRoute } from '@tanstack/react-router'

import { CreateRolePage } from '@/features/settings/pages/create-role-page'

export const Route = createFileRoute('/(app)/settings/create-role')({
  component: CreateRolePage,
})
