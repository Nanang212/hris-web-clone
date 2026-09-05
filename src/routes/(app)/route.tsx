import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AppNavbar } from '@/shared/components/app-layout/app-navbar'
import { AppSidebar } from '@/shared/components/app-layout/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { getCookie } from '@/shared/lib/utils'

export const Route = createFileRoute('/(app)')({
  beforeLoad: async () => {
    const isSignedIn = getCookie('is_signed_in') === 'true'
    if (!isSignedIn) throw redirect({ to: '/signin', replace: true })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className='bg-sidebar'>
      <AppSidebar />
      <div className='w-full min-w-0 flex-1 overflow-x-hidden'>
        <AppNavbar className='w-full' user={{ name: 'John Doe', role: 'Admin' }} />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
