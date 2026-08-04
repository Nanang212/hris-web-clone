import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/leave/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/leave/"!</div>
}
