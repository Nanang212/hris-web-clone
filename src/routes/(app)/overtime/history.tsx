import { createFileRoute } from '@tanstack/react-router'

import { OvertimeHistoryPage } from '@/features/overtime/pages/overtime-history-page'

export const Route = createFileRoute('/(app)/overtime/history')({ component: OvertimeHistoryPage })
