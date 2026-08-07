// app-sidebar.tsx
import {
  IconCalendarCheck,
  IconCalendarWeek,
  IconChecklist,
  IconLayoutDashboard,
  IconReportAnalytics,
  IconReportMoney,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import IconHris from '@/shared/components/icon-hris'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar'

const mainMenu = [
  {
    key: 'employee',
    url: '/employee',
    icon: IconUserCircle,
    title: m.app_layout_nav_employee,
  },
  {
    key: 'attendance',
    url: '/attendance',
    icon: IconCalendarCheck,
    title: m.app_layout_nav_attendance,
  },
  {
    key: 'leave',
    url: '/leave',
    icon: IconCalendarWeek,
    title: m.app_layout_nav_leave,
  },
  {
    key: 'payroll',
    url: '/payroll',
    icon: IconReportMoney,
    title: m.app_layout_nav_payroll,
  },
  {
    key: 'performance',
    url: '/performance',
    icon: IconChecklist,
    title: m.app_layout_nav_performance,
  },
  {
    key: 'report',
    url: '/report',
    icon: IconReportAnalytics,
    title: m.app_layout_nav_report,
  },
  {
    key: 'settings',
    url: '/settings',
    icon: IconSettings,
    title: m.app_layout_nav_settings,
  },
] as const

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <Sidebar className="border-none">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <IconHris />
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">
            {m.app_layout_brand_name()}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link to="/">
                  <IconLayoutDashboard size={24} stroke={1.75} />
                  <span>{m.app_layout_nav_dashboard()}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>
            {m.app_layout_nav_main_module_label()}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainMenu.map((item) => {
                const isActive = pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
                        <item.icon size={24} stroke={1.75} />
                        <span>{item.title()}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
