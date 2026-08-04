import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/performance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/performance/"!</div>
}
