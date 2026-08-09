// app-sidebar.tsx
import {
  IconCalendarCheck,
  IconCalendarWeek,
  IconChecklist,
  IconChevronRight,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar'

const mainMenu = [
  {
    key: 'company',
    url: '.',
    icon: IconUserCircle,
    title: m.app_layout_nav_company,
    items: [
      {
        title: m.app_layout_nav_employee,
        url: '/company/employee',
      },
      {
        title: m.app_layout_nav_organization,
        url: '/company/organization',
      },
      {
        title: m.app_layout_nav_document,
        url: '/company/document',
      },
    ],
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
    <Sidebar className='border-none'>
      <SidebarHeader className='px-4 py-5'>
        <div className='flex items-center gap-2.5'>
          <IconHris />
          <span className='text-lg font-semibold tracking-tight text-sidebar-foreground'>
            {m.app_layout_brand_name()}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to='/'>
                    <IconLayoutDashboard size={24} stroke={1.75} />
                    <span>{m.app_layout_nav_dashboard()}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{m.app_layout_nav_main_module_label()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1.5'>
              {mainMenu.map((item) => {
                const hasSubItems = 'items' in item && item.items.length > 0

                const isActive = hasSubItems
                  ? item.items.some((subItem) => pathname.startsWith(subItem.url))
                  : pathname.startsWith(item.url)

                if (!hasSubItems) {
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
                }

                return (
                  <Collapsible
                    key={item.key}
                    asChild
                    defaultOpen={isActive}
                    className='group/collapsible'
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton isActive={isActive}>
                          <item.icon size={24} stroke={1.75} />
                          <span>{item.title()}</span>
                          <IconChevronRight
                            size={16}
                            className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => {
                            const isSubActive = pathname.startsWith(subItem.url)
                            return (
                              <SidebarMenuSubItem key={subItem.url}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={subItem.url}>
                                    <span>{subItem.title()}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
