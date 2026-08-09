import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/document/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/company/document/"!</div>
}
