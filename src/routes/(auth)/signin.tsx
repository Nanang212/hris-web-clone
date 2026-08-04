import { SignInPage } from '@/features/auth/pages/signin-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <SignInPage />
}
