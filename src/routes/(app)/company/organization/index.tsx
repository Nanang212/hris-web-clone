import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/organization/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/unit/"!</div>
}
