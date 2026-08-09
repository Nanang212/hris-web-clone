import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/employee/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello "/(app)/company/employee/{id}"!</div>
}
