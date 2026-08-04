import { SignOutPage } from '@/features/auth/pages/signout-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/signout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignOutPage />
}
