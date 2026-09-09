import { createFileRoute } from '@tanstack/react-router'

import { UnitDepartmentPage } from '@/features/organization/unit/pages/unit-department-page'

export const Route = createFileRoute('/(app)/organization/unit/department')({
  component: UnitDepartmentPage,
})
