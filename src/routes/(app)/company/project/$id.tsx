import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)/company/project/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}

