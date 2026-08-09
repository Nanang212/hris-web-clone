import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/employee/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/employee/new"!</div>
}
