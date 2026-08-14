import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings/notification/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/settings/notification/"!</div>
}
