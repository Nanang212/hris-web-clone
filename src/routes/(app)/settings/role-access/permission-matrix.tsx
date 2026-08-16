import { createFileRoute } from '@tanstack/react-router'

import { PermissionMatrixPage } from '@/features/settings/role-access/pages/permission-matrix-page'

export const Route = createFileRoute('/(app)/settings/role-access/permission-matrix')({
  component: PermissionMatrixPage,
})
