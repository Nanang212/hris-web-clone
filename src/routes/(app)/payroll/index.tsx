import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/payroll/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/payroll/"!</div>
}
