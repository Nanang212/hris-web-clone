import { Link, useRouterState } from "@tanstack/react-router"
import {
  IconLayoutDashboard,
  IconUserCircle,
  IconCalendarCheck,
  IconCalendarWeek,
  IconReportMoney,
  IconChecklist,
  IconReportAnalytics,
  IconSettings,
  IconHeadset,
} from "@tabler/icons-react"

import { Button } from "@/shared/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

const mainMenu = [
  { title: "Dashboard", url: "/", icon: IconLayoutDashboard },
  { title: "Employee", url: "/employee", icon: IconUserCircle },
  { title: "Attendance", url: "/attendance", icon: IconCalendarCheck },
  { title: "Leave", url: "/leave", icon: IconCalendarWeek },
  { title: "Payroll", url: "/payroll", icon: IconReportMoney },
  { title: "Performance", url: "/performance", icon: IconChecklist },
  { title: "Report", url: "/report", icon: IconReportAnalytics },
  { title: "Settings", url: "/settings", icon: IconSettings },
]

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-lg font-bold text-sidebar-primary-foreground">
            Q
          </div>
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            HRIS
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainMenu.map((item) => {
                const isActive =
                  (item.url === "/" && pathname === "/") ||
                  (item.url !== "/" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-10 rounded-xl px-3 text-[0.925rem] font-medium"
                    >
                      <Link to={item.url}>
                        <item.icon size={19} stroke={1.75} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-sidebar-accent px-4 py-5 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-border">
            <IconHeadset
              size={24}
              className="text-sidebar-foreground"
              stroke={1.75}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">
              Need Help?
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              We're here to help
            </p>
          </div>
          <Button>Contact Support</Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
