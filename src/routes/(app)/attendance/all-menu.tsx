import { createFileRoute } from '@tanstack/react-router'

import { AllMenuPage } from '@/features/attendance/pages/all-menu-page'

export const Route = createFileRoute('/(app)/attendance/all-menu')({ component: AllMenuPage })
