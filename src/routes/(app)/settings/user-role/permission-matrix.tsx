import { createFileRoute } from '@tanstack/react-router'

import { PermissionMatrixPage } from '@/features/settings/user-role/pages/permission-matrix-page'

export const Route = createFileRoute('/(app)/settings/user-role/permission-matrix')({
  component: PermissionMatrixPage,
})
