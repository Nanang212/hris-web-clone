import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/settings/scheduler/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
