import { createFileRoute } from '@tanstack/react-router'

import { CreateWorkflowPage } from '@/features/settings/approval-workflow/create/create-workflow-page'

export const Route = createFileRoute('/(app)/settings/approval-workflow/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CreateWorkflowPage mode='create' />
}
