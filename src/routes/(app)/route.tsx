import { AppMain } from '@/shared/components/app-layout/app-main'
import { AppNavbar } from '@/shared/components/app-layout/app-navbar'
import { AppSidebar } from '@/shared/components/app-layout/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider className="bg-sidebar">
      <AppSidebar />
      <div className="w-full">
        <AppNavbar
          className="w-full"
          user={{ name: 'John Doe', role: 'Admin' }}
        />
        <AppMain>
          <Outlet />
        </AppMain>
      </div>
    </SidebarProvider>
  )
}
