import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AppNavbar } from '@/shared/components/app-layout/app-navbar'
import { AppSidebar } from '@/shared/components/app-layout/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { getCurrentUser, isAuthenticated } from '@/shared/lib/auth-guard'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    if (!isAuthenticated()) throw redirect({ to: '/signin', replace: true })
  },
  component: RouteComponent,
})

function RouteComponent() {
  const user = getCurrentUser()
  return (
    <SidebarProvider className='bg-sidebar'>
      <AppSidebar />
      <div className='w-full min-w-0 flex-1 overflow-x-hidden'>
        <AppNavbar className='w-full' user={user} />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
