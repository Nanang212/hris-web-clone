import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings/master-data/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/settings/master-data/"!</div>
}
