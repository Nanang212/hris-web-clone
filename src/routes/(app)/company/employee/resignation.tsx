import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/employee/resignation')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/employee/resignation"!</div>
}
