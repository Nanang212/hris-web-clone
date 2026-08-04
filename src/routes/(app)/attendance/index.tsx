import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/attendance/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/attendance/"!</div>
}
