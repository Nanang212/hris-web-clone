import { createFileRoute } from '@tanstack/react-router'

import { ProjectPage } from '@/features/company/project/pages/project-page'

export const Route = createFileRoute('/(app)/company/project/')({
  component: ProjectPage,
})
