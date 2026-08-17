import { createFileRoute } from '@tanstack/react-router'

import { OvertimeRulesPage } from '@/features/overtime/pages/overtime-rules-page'

export const Route = createFileRoute('/(app)/overtime/calculation/rules')({
  component: OvertimeRulesPage,
})
