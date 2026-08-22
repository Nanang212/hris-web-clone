import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { EmploymentPromotionPage } from '@/features/employment/pages/promotion/employment-promotion-page'

const searchSchema = z.object({
  employeeId: z.string().optional(),
  name: z.string().optional(),
})

export const Route = createFileRoute('/(app)/company/employee/promotion/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { employeeId, name } = Route.useSearch()
  return (
    <EmploymentPromotionPage
      key={`${employeeId}-${name}`}
      preselectedEmployeeId={employeeId}
      preselectedName={name}
    />
  )
}
