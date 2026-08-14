// app-sidebar.tsx
import { IconChevronRight } from '@tabler/icons-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { m } from '@/i18n/paraglide/messages'
import { dashboardMenu, mainMenu } from '@/shared/components/app-layout/menu'
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
        {/* Dashboard section with collapsible sub-items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardMenu.map((item) => {
                const hasSubItems = 'items' in item && item.items?.length
                const isActive = hasSubItems
                  ? item.items?.some(
                      (subItem) => pathname === subItem.to || pathname.startsWith(subItem.to + '/'),
                    )
                  : pathname === item.to || pathname.startsWith(item.to + '/')

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.to}>
                          {item.icon && <item.icon size={24} stroke={1.75} />}
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
                          {item.icon && <item.icon size={24} stroke={1.75} />}
                          <span>{item.title()}</span>
                          <IconChevronRight
                            size={16}
                            className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const isSubActive =
                              pathname === subItem.to || pathname.startsWith(subItem.to + '/')
                            return (
                              <SidebarMenuSubItem key={subItem.key}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={subItem.to}>
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

        {/* Main modules section */}
        <SidebarGroup>
          <SidebarGroupLabel>{m.app_layout_nav_main_module_label()}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1.5'>
              {mainMenu.map((item) => {
                const hasSubItems = 'items' in item && item.items?.length

                const isActive = hasSubItems
                  ? item.items?.some((subItem) => subItem.to && pathname.startsWith(subItem.to))
                  : pathname === item.to || pathname.startsWith(item.to + '/')

                if (!hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.to}>
                          {item.icon && <item.icon size={24} stroke={1.75} />}
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
                          {item.icon && <item.icon size={24} stroke={1.75} />}
                          <span>{item.title()}</span>
                          <IconChevronRight
                            size={16}
                            className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90'
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => {
                            const isSubActive = subItem.to && pathname.startsWith(subItem.to)
                            return (
                              <SidebarMenuSubItem key={subItem.to}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <Link to={subItem.to}>
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
