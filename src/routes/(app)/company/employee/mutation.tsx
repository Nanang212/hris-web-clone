import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/employee/mutation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/employee/mutation"!</div>
}
