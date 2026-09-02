import { createFileRoute } from '@tanstack/react-router'
import { PayrollPage } from '@/features/payroll/pages/payroll-page'

export const Route = createFileRoute('/(app)/payroll/')({
  component: PayrollPage,
})
