import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { DocumentCenterPage } from '@/features/document/pages/document-center-page'

const searchSchema = z.object({
  tab: z.enum(['overview', 'certificates', 'attachments']).optional(),
  employeeId: z.string().optional(),
})

export const Route = createFileRoute('/(app)/company/document/')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { tab, employeeId } = Route.useSearch()
  return (
    <DocumentCenterPage
      key={`${tab}-${employeeId}`}
      initialTab={tab}
      preselectedEmployeeId={employeeId}
    />
  )
}
