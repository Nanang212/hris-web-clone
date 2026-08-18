import { createFileRoute } from '@tanstack/react-router'

import { CreateNotificationTemplatePage } from '@/features/settings/notification/pages/create-notification-template-page'

export const Route = createFileRoute('/(app)/settings/notification/templates_/create')({
  component: CreateNotificationTemplatePage,
})
