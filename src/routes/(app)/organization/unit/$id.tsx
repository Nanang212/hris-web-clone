import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/organization/unit/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello "/(app)/employment/employee/{id}"!</div>
}
