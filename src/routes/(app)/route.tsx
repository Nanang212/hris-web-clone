import { AppNavbar } from '@/shared/components/app-layout/app-navbar'
import { AppSidebar } from '@/shared/components/app-layout/app-sidebar'
import { SidebarProvider } from '@/shared/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <AppNavbar
            className="w-full"
            user={{ name: 'John Doe', role: 'Admin' }}
          />
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  )
}
