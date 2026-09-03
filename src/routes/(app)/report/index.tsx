import { createFileRoute } from '@tanstack/react-router'
import { ReportPage } from '@/features/report/report-page'

export const Route = createFileRoute('/(app)/report/')({
  component: ReportPage,
})

