import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings/company/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(app)/settings/company/"!</div>
}
