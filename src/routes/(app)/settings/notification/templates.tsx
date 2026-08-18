import { createFileRoute } from '@tanstack/react-router'

import { NotificationTemplatesPage } from '@/features/settings/notification/pages/notification-templates-page'

export const Route = createFileRoute('/(app)/settings/notification/templates')({
  component: NotificationTemplatesPage,
})
