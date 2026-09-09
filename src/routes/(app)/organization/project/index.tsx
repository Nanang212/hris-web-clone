import { createFileRoute } from '@tanstack/react-router'

import { ProjectPage } from '@/features/organization/project/pages/project-page'

export const Route = createFileRoute('/(app)/organization/project/')({
  component: ProjectPage,
})
