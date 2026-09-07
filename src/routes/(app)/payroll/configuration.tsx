// src/routes/(app)/payroll/configuration.tsx
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PayrollPage } from '@/features/payroll/pages/payroll-page'

const searchSchema = z.object({
  subTab: z.enum(['general', 'components', 'bpjs-tk', 'bpjs-kes', 'pph21', 'thr']).optional(),
})

export const Route = createFileRoute('/(app)/payroll/configuration')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { subTab } = Route.useSearch()
  return (
    <PayrollPage
      key={subTab || 'default-config'}
      initialTab='configuration'
      initialSubTab={subTab || 'bpjs-tk'}
    />
  )
}
