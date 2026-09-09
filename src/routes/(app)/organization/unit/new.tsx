import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/organization/unit/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/unit/new"!</div>
}
