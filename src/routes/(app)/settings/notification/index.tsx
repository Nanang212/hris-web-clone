import { createFileRoute } from '@tanstack/react-router'

import { NotificationOverviewPage } from '@/features/settings/notification/pages/notification-overview-page'

export const Route = createFileRoute('/(app)/settings/notification/')({
  component: NotificationOverviewPage,
})
