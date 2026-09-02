import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppNavbar } from '@/shared/components/app-layout/app-navbar'
import { AppSidebar } from '@/shared/components/app-layout/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className='bg-sidebar'>
      <AppSidebar />
      <div className='flex-1 min-w-0 w-full overflow-x-hidden'>
        <AppNavbar className='w-full' user={{ name: 'John Doe', role: 'Admin' }} />
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
