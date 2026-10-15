import { createFileRoute } from '@tanstack/react-router'

import { WorkPatternsPage } from '@/features/attendance/pages/work-patterns/work-patterns-page'

export const Route = createFileRoute('/(app)/attendance/work-patterns/')({
  component: WorkPatternsPage,
})
